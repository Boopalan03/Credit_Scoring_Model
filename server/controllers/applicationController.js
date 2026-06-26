const Application = require('../models/Application');
const dataService = require('../dataService');

// Helper to validate PAN format (5 letters, 4 digits, 1 letter)
const validatePAN = (pan) => {
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(pan.toUpperCase());
};

// Helper to validate Aadhaar format (12 digits, optional spaces)
const validateAadhaar = (aadhaar) => {
  const cleaned = aadhaar.replace(/\s+/g, '');
  const regex = /^\d{12}$/;
  return regex.test(cleaned);
};

// Helper to validate IFSC format (4 letters, 0, 6 alphanumeric)
const validateIFSC = (ifsc) => {
  const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return regex.test(ifsc.toUpperCase());
};

// Endpoint to verify bank account in real-time (Demo)
const verifyBankAccountDemo = async (req, res) => {
  const { accountNumber, ifsc, fullName } = req.body;
  
  if (!accountNumber || !ifsc) {
    return res.status(400).json({ error: 'Account Number and IFSC are required' });
  }

  const isIfscValid = validateIFSC(ifsc);
  
  // Demo simulation logic
  // Ends with 000 -> Account does not exist
  // Ends with 999 -> Name mismatch
  const accountExists = isIfscValid && !accountNumber.endsWith('000');
  const nameMatch = accountExists && !accountNumber.endsWith('999');

  res.json({
    success: accountExists && nameMatch && isIfscValid,
    accountExists,
    nameMatch,
    ifscValid: isIfscValid,
    bankName: isIfscValid ? getBankNameByIFSC(ifsc) : 'Unknown Bank',
    verifiedName: nameMatch ? (fullName || 'Applicant Name') : 'Demo User mismatch'
  });
};

// Helper to get bank name based on IFSC prefix
const getBankNameByIFSC = (ifsc) => {
  const prefix = ifsc.substring(0, 4).toUpperCase();
  const banks = {
    'SBIN': 'State Bank of India',
    'ICIC': 'ICICI Bank',
    'HDFC': 'HDFC Bank',
    'BARB': 'Bank of Baroda',
    'PUNB': 'Punjab National Bank',
    'UTIB': 'Axis Bank',
    'KKBK': 'Kotak Mahindra Bank'
  };
  return banks[prefix] || 'Commercial Bank of India (Demo)';
};

// JavaScript Fallback Scoring Engine if ML Server is Offline
const runFallbackScoringEngine = (data) => {
  const income = parseFloat(data.monthlyIncome);
  const expenses = parseFloat(data.monthlyExpenses);
  const existingEmi = parseFloat(data.existingEmi);
  const savings = parseFloat(data.savings);
  const loanAmount = parseFloat(data.loanAmount);
  const creditUtil = parseFloat(data.creditUtilization);
  const prevDefaults = parseInt(data.previousDefaults);
  const creditHistory = parseInt(data.workExperience); // proxy for history length
  const activeLoans = parseInt(data.activeLoans);
  const purpose = data.loanPurpose;
  const empType = data.employmentType;

  // CIBIL Score Calculation
  let baseScore = 620;
  baseScore -= min(prevDefaults * 85, 250);
  
  if (creditUtil < 30) baseScore += 40;
  else if (creditUtil <= 50) baseScore += 10;
  else if (creditUtil <= 75) baseScore -= 30;
  else baseScore -= 100;

  baseScore += min(creditHistory * 8, 100);

  if (activeLoans === 0) baseScore += 10;
  else if (activeLoans >= 3) baseScore -= min((activeLoans - 2) * 20, 60);

  const dti = existingEmi / (income + 1.0);
  if (dti > 0.5) baseScore -= 60;
  else if (dti > 0.3) baseScore -= 30;
  else baseScore += 20;

  const creditScore = Math.max(300, Math.min(900, Math.round(baseScore)));
  
  // Risk Level
  let riskLevel, rating;
  if (creditScore >= 751) { riskLevel = "LOW RISK"; rating = "Excellent"; }
  else if (creditScore >= 651) { riskLevel = "LOW RISK"; rating = "Good"; }
  else if (creditScore >= 501) { riskLevel = "MEDIUM RISK"; rating = "Medium Risk"; }
  else if (creditScore >= 301) { riskLevel = "HIGH RISK"; rating = "High Risk"; }
  else { riskLevel = "VERY HIGH RISK"; rating = "Very High Risk"; }

  const isEligible = creditScore >= 500 && dti < 0.65 && prevDefaults === 0;
  const eligibility = isEligible ? "Eligible" : "Not Eligible";

  // Max Loan
  let maxLoanAmount = 0;
  if (isEligible) {
    const scoreFactor = (creditScore - 500) / 400.0;
    const scoreMultiplier = 0.4 + 0.6 * scoreFactor;
    const purposeMultipliers = { 'Home': 50, 'Business': 24, 'Car': 12, 'Education': 15, 'Personal': 8 };
    const mult = purposeMultipliers[purpose] || 8;
    const repaymentCapacity = Math.max(0, (income * 0.5) - existingEmi);
    const termMonths = purpose === 'Home' ? 60 : 36;
    maxLoanAmount = Math.round(Math.min(repaymentCapacity * termMonths, income * mult * scoreMultiplier) / 10000) * 10000;
    maxLoanAmount = Math.max(50000, maxLoanAmount);
  }

  // Recommended Interest
  const baseInterest = { 'Home': 8.5, 'Car': 9.5, 'Personal': 11.5, 'Education': 8.2, 'Business': 12.5 };
  let interestRate = baseInterest[purpose] || 10.5;
  if (creditScore >= 751) interestRate -= 1.0;
  else if (creditScore >= 651) interestRate -= 0.5;
  else if (creditScore >= 501) interestRate += 0.8;
  else if (creditScore >= 301) interestRate += 2.5;
  else interestRate += 4.0;
  interestRate = Math.round(Math.max(6.5, Math.min(18.0, interestRate)) * 10) / 10;

  // Reasons Checklist
  const reasons = [];
  if (isEligible) {
    if (income > 60000) reasons.push("✔ High Income");
    if (prevDefaults === 0) reasons.push("✔ No Defaults");
    if (savings > (loanAmount * 0.3)) reasons.push("✔ Good Savings");
    if (['Government', 'Private'].includes(empType)) reasons.push("✔ Stable Job");
    if (creditUtil < 30) reasons.push("✔ Low Credit Utilization");
  } else {
    if (income < 30000) reasons.push("✘ Income too low");
    if (dti > 0.45) reasons.push("✘ High EMI");
    if (prevDefaults > 0) reasons.push("✘ Previous Defaults");
    if (savings < 50000) reasons.push("✘ Low Savings");
    if (creditUtil > 70) reasons.push(`✘ Credit utilization ${Math.round(creditUtil)}%`);
    if (creditScore < 600) reasons.push("✘ Low Credit Score");
  }

  return {
    approved: isEligible,
    creditScore,
    riskLevel,
    rating,
    eligibility,
    maxLoanAmount,
    recommendedInterest: interestRate,
    reasons
  };
};

const min = (a, b) => a < b ? a : b;

// Submit Loan Application
const submitApplication = async (req, res) => {
  try {
    const {
      fullName, age, panNumber, aadhaarNumber, mobile, email,
      employmentType, companyName, workExperience,
      monthlyIncome, monthlyExpenses, existingEmi, savings, currentBalance, creditCardOutstanding,
      loanAmount, loanPurpose,
      previousDefaults, creditUtilization, creditHistoryLength, activeLoans,
      bankAccountNumber, bankIfsc
    } = req.body;

    const userId = req.user._id;

    // 1. Format Validations
    if (!validatePAN(panNumber)) {
      return res.status(400).json({ error: 'Invalid PAN Number format. Must be like ABCDE1234F.' });
    }
    if (!validateAadhaar(aadhaarNumber)) {
      return res.status(400).json({ error: 'Invalid Aadhaar Number format. Must be a 12-digit number.' });
    }
    if (!validateIFSC(bankIfsc)) {
      return res.status(400).json({ error: 'Invalid IFSC format. Must be SBIN0001234.' });
    }

    // 2. Bank Verification (Demo)
    const isIfscValid = validateIFSC(bankIfsc);
    const bankAccountExists = isIfscValid && !bankAccountNumber.endsWith('000');
    const bankNameMatch = bankAccountExists && !bankAccountNumber.endsWith('999');
    const bankVerified = bankAccountExists && bankNameMatch && isIfscValid;

    // 3. Fraud Detection Engine
    // Income ₹20,000 and Loan ₹40 Lakhs -> Fraud Alert!
    // Flag if requested loan is greater than 100x monthly income
    let isFraudFlagged = false;
    let fraudReason = '';

    if (parseFloat(loanAmount) > parseFloat(monthlyIncome) * 100) {
      isFraudFlagged = true;
      fraudReason = `Disproportionate Loan Request: Requested loan (₹${parseFloat(loanAmount).toLocaleString('en-IN')}) is extremely high compared to Monthly Income (₹${parseFloat(monthlyIncome).toLocaleString('en-IN')}). Potential Income Manipulation Fraud.`;
    }

    // 4. ML Prediction Call
    let predictionData;
    const mlPayload = {
      Age: parseInt(age),
      Employment_Type: employmentType,
      Monthly_Income_INR: parseFloat(monthlyIncome),
      Monthly_Expenses_INR: parseFloat(monthlyExpenses),
      Savings_INR: parseFloat(savings),
      Current_Balance_INR: parseFloat(currentBalance),
      Existing_EMI_INR: parseFloat(existingEmi),
      Loan_Amount_INR: parseFloat(loanAmount),
      Credit_Utilization: parseFloat(creditUtilization) / 100.0, // Convert to decimal
      Previous_Defaults: parseInt(previousDefaults),
      Credit_History_Years: parseInt(creditHistoryLength),
      Active_Loans: parseInt(activeLoans),
      Loan_Purpose: loanPurpose
    };

    try {
      const mlServiceUrl = process.env.ML_SERVICE_URL || `http://127.0.0.1:${process.env.ML_PORT || 5001}`;
      const mlResponse = await fetch(`${mlServiceUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlPayload)
      });
      
      if (mlResponse.ok) {
        const mlResult = await mlResponse.json();
        predictionData = {
          approved: mlResult.approved,
          creditScore: mlResult.credit_score,
          riskLevel: mlResult.risk_level,
          rating: mlResult.rating,
          eligibility: mlResult.eligibility,
          maxLoanAmount: mlResult.max_loan,
          recommendedInterest: mlResult.recommended_interest,
          reasons: mlResult.reasons
        };
      } else {
        console.warn('Flask ML Server responded with an error. Running fallback scoring engine.');
        predictionData = runFallbackScoringEngine(req.body);
      }
    } catch (err) {
      console.warn('Flask ML Server is offline. Running fallback scoring engine. Error details:', err.message);
      predictionData = runFallbackScoringEngine(req.body);
    }

    // 5. Build and Save Application object
    const applicationData = {
      userId,
      fullName,
      age: parseInt(age),
      panNumber: panNumber.toUpperCase(),
      aadhaarNumber: aadhaarNumber.replace(/\s+/g, ''),
      mobile,
      email,
      employmentType,
      companyName,
      workExperience: parseInt(workExperience),
      monthlyIncome: parseFloat(monthlyIncome),
      monthlyExpenses: parseFloat(monthlyExpenses),
      existingEmi: parseFloat(existingEmi),
      savings: parseFloat(savings),
      currentBalance: parseFloat(currentBalance),
      creditCardOutstanding: parseFloat(creditCardOutstanding),
      loanAmount: parseFloat(loanAmount),
      loanPurpose,
      previousDefaults: parseInt(previousDefaults),
      creditUtilization: parseFloat(creditUtilization),
      creditHistoryLength: parseInt(creditHistoryLength),
      activeLoans: parseInt(activeLoans),
      bankAccountNumber,
      bankIfsc: bankIfsc.toUpperCase(),
      bankVerified,
      bankAccountExists,
      bankNameMatch,
      bankIfscValid: isIfscValid,
      ...predictionData,
      isFraudFlagged,
      fraudReason
    };

    const savedApp = await dataService.saveApplication(applicationData);

    res.status(201).json({
      success: true,
      message: isFraudFlagged 
        ? 'Application submitted but flagged for manual fraud review.' 
        : 'Application processed successfully.',
      application: savedApp
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Server error processing application.' });
  }
};

// Get My Applications
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const allApps = await dataService.getAllApplications();
    // Filter apps for this user safely, handling any legacy records with missing userId
    const myApps = allApps.filter(app => app.userId && app.userId.toString() === userId.toString());
    res.json(myApps);
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({ error: 'Server error fetching applications.' });
  }
};

// Get Application by ID
const getApplicationById = async (req, res) => {
  try {
    const app = await dataService.getApplicationById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    
    // Check ownership safely: must be the user themselves (by userId or email) or an admin
    const isOwner = (app.userId && app.userId.toString() === req.user._id.toString()) || 
                    (app.email && app.email === req.user.email);
                    
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    
    res.json(app);
  } catch (error) {
    console.error('Error fetching application by ID:', error);
    res.status(500).json({ error: 'Server error fetching application.' });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getApplicationById,
  verifyBankAccountDemo
};
