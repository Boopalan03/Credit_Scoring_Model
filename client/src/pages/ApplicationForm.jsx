import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { applicationService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { toast } from 'react-toastify';
import { 
  User, Briefcase, CreditCard, Landmark, ChevronRight, 
  ChevronLeft, CheckCircle2, AlertCircle, Sparkles, ShieldAlert 
} from 'lucide-react';

const ApplicationForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: user?.name || '',
    age: 30,
    panNumber: '',
    aadhaarNumber: '',
    mobile: '',
    email: user?.email || '',

    // Step 2: Employment
    employmentType: 'Private',
    companyName: '',
    workExperience: 5,
    monthlyIncome: 65000,
    monthlyExpenses: 25000,
    savings: 200000,

    // Step 3: Financial & Loan
    existingEmi: 0,
    currentBalance: 35000,
    creditCardOutstanding: 12000,
    loanAmount: 500000,
    loanPurpose: 'Personal',

    // Step 4: Credit & Bank
    previousDefaults: 0,
    creditUtilization: 25,
    creditHistoryLength: 4,
    activeLoans: 1,
    bankAccountNumber: '',
    bankIfsc: ''
  });

  // Verification states
  const [bankVerificationLoading, setBankVerificationLoading] = useState(false);
  const [bankVerificationResult, setBankVerificationResult] = useState(null);
  const [isBankVerified, setIsBankVerified] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState({});

  // Clean format inputs as user types
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Auto-formatting PAN and IFSC to uppercase
    let formattedValue = value;
    if (name === 'panNumber' || name === 'bankIfsc') {
      formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else if (name === 'aadhaarNumber') {
      // Formats Aadhaar with spaces: 1234 5678 9012
      const digitsOnly = value.replace(/\D/g, '');
      const matches = digitsOnly.match(/\d{1,4}/g);
      formattedValue = matches ? matches.join(' ').substring(0, 14) : '';
    } else if (name === 'mobile') {
      formattedValue = value.replace(/\D/g, '').substring(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(formattedValue) : formattedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Run validation for current step before proceeding
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!formData.age || formData.age < 18 || formData.age > 65) {
        newErrors.age = 'Age must be between 18 and 65';
      }
      
      // PAN check
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!formData.panNumber) {
        newErrors.panNumber = 'PAN Number is required';
      } else if (!panRegex.test(formData.panNumber.toUpperCase())) {
        newErrors.panNumber = 'Invalid PAN format. Example: ABCDE1234F';
      }

      // Aadhaar check
      const aadhaarClean = formData.aadhaarNumber.replace(/\s+/g, '');
      if (!formData.aadhaarNumber) {
        newErrors.aadhaarNumber = 'Aadhaar Number is required';
      } else if (aadhaarClean.length !== 12) {
        newErrors.aadhaarNumber = 'Aadhaar must be a 12-digit number';
      }

      if (!formData.mobile || formData.mobile.length !== 10) {
        newErrors.mobile = 'Mobile number must be 10 digits';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        newErrors.email = 'Valid email is required';
      }
    }

    if (step === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (formData.workExperience === undefined || formData.workExperience < 0) {
        newErrors.workExperience = 'Work experience cannot be negative';
      }
      if (!formData.monthlyIncome || formData.monthlyIncome <= 0) {
        newErrors.monthlyIncome = 'Monthly income must be greater than 0';
      }
      if (formData.monthlyExpenses === undefined || formData.monthlyExpenses < 0) {
        newErrors.monthlyExpenses = 'Monthly expenses cannot be negative';
      }
      if (formData.savings === undefined || formData.savings < 0) {
        newErrors.savings = 'Savings cannot be negative';
      }
    }

    if (step === 3) {
      if (formData.existingEmi === undefined || formData.existingEmi < 0) {
        newErrors.existingEmi = 'Existing EMI cannot be negative';
      }
      if (formData.currentBalance === undefined || formData.currentBalance < 0) {
        newErrors.currentBalance = 'Current balance cannot be negative';
      }
      if (formData.creditCardOutstanding === undefined || formData.creditCardOutstanding < 0) {
        newErrors.creditCardOutstanding = 'Credit Card Outstanding cannot be negative';
      }
      if (!formData.loanAmount || formData.loanAmount <= 0) {
        newErrors.loanAmount = 'Loan Amount must be greater than 0';
      }
    }

    if (step === 4) {
      if (formData.previousDefaults === undefined || formData.previousDefaults < 0) {
        newErrors.previousDefaults = 'Defaults count cannot be negative';
      }
      if (formData.creditUtilization === undefined || formData.creditUtilization < 0 || formData.creditUtilization > 100) {
        newErrors.creditUtilization = 'Credit utilization must be between 0% and 100%';
      }
      if (formData.creditHistoryLength === undefined || formData.creditHistoryLength < 0) {
        newErrors.creditHistoryLength = 'Credit history length cannot be negative';
      }
      if (formData.activeLoans === undefined || formData.activeLoans < 0) {
        newErrors.activeLoans = 'Active loans count cannot be negative';
      }
      if (!formData.bankAccountNumber || formData.bankAccountNumber.length < 9 || formData.bankAccountNumber.length > 18) {
        newErrors.bankAccountNumber = 'Account Number must be between 9 and 18 digits';
      }
      
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!formData.bankIfsc) {
        newErrors.bankIfsc = 'Bank IFSC is required';
      } else if (!ifscRegex.test(formData.bankIfsc.toUpperCase())) {
        newErrors.bankIfsc = 'Invalid IFSC format. Example: SBIN0001234';
      }

      if (!isBankVerified) {
        newErrors.bankVerification = 'Please verify your bank account before submitting';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.warning('Please resolve form errors before proceeding.');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Demo Bank Account Penny Drop Verification
  const handleVerifyBank = async () => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!formData.bankAccountNumber || formData.bankAccountNumber.length < 9) {
      setErrors(prev => ({ ...prev, bankAccountNumber: 'Please enter a valid Account Number' }));
      return;
    }
    if (!formData.bankIfsc || !ifscRegex.test(formData.bankIfsc.toUpperCase())) {
      setErrors(prev => ({ ...prev, bankIfsc: 'Please enter a valid IFSC' }));
      return;
    }

    setBankVerificationLoading(true);
    setBankVerificationResult(null);
    setIsBankVerified(false);

    try {
      const result = await applicationService.verifyBank(
        formData.bankAccountNumber,
        formData.bankIfsc,
        formData.fullName
      );
      
      setBankVerificationResult(result);
      if (result.success) {
        setIsBankVerified(true);
        toast.success('Bank Account Verified Successfully!');
        // Clear error
        setErrors(prev => ({ ...prev, bankVerification: '' }));
      } else {
        setIsBankVerified(false);
        toast.error('Bank account verification failed.');
      }
    } catch (error) {
      toast.error('Verification connection error.');
      setIsBankVerified(false);
    } finally {
      setBankVerificationLoading(false);
    }
  };

  // Handle final submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      return;
    }

    setLoading(true);
    try {
      // Map Aadhaar to remove spaces before sending
      const submissionPayload = {
        ...formData,
        aadhaarNumber: formData.aadhaarNumber.replace(/\s+/g, '')
      };

      const response = await applicationService.submit(submissionPayload);
      
      if (response.application.isFraudFlagged) {
        toast.warning('Application submitted. Flagged for Manual Fraud Review!');
      } else {
        toast.success('Loan Application Processed Successfully!');
      }

      // Redirect immediately to prediction results page
      navigate(`/prediction/${response.application._id || response.application.id}`);
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to submit application.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Detect potential fraud alert parameters in real-time
  const isHighDebtFraudRisk = formData.loanAmount > formData.monthlyIncome * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-slate-800 dark:text-slate-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">AI Loan Application</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Complete your profile to assess your creditworthiness and get an instant decision.</p>
      </div>

      {/* Progress Wizard Header */}
      <div className="p-5 rounded-2xl glass-panel shadow-lg">
        <div className="flex justify-between items-center mb-4">
          {[
            { step: 1, label: 'Personal', icon: User },
            { step: 2, label: 'Employment', icon: Briefcase },
            { step: 3, label: 'Financials', icon: CreditCard },
            { step: 4, label: 'Verification', icon: Landmark }
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center flex-1 relative">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border text-sm font-semibold z-10 transition-all duration-300 ${
                currentStep === s.step
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-110'
                  : currentStep > s.step
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                <s.icon className="h-4 w-4" />
              </div>
              <span className={`text-xs mt-2 hidden sm:block font-medium ${
                currentStep === s.step ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
              }`}>{s.label}</span>
              
              {/* Connector Line */}
              {s.step < totalSteps && (
                <div className={`absolute top-[18px] left-[50%] right-[-50%] h-[2px] -z-0 ${
                  currentStep > s.step ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Real-time Fraud Engine Banner */}
        {isHighDebtFraudRisk && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs flex items-center gap-2.5 animate-pulse">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Potential Fraud Alert:</strong> The requested loan amount (₹{formData.loanAmount.toLocaleString('en-IN')}) is extremely high compared to your Monthly Income (₹{formData.monthlyIncome.toLocaleString('en-IN')}). If submitted, this application will be flagged for fraud review.
            </span>
          </div>
        )}
      </div>

      <Card className="shadow-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">1. Personal Details</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Input 
                    label="Full Name (as in PAN)" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleInputChange} 
                    required
                    error={errors.fullName}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-700"
                  />
                  <Input 
                    label="Age" 
                    type="number" 
                    name="age" 
                    value={formData.age} 
                    onChange={handleInputChange} 
                    required 
                    error={errors.age}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                  <Input 
                    label="PAN Number" 
                    name="panNumber" 
                    value={formData.panNumber} 
                    onChange={handleInputChange} 
                    placeholder="ABCDE1234F"
                    required
                    error={errors.panNumber}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-700 font-mono"
                  />
                  <Input 
                    label="Aadhaar Number" 
                    name="aadhaarNumber" 
                    value={formData.aadhaarNumber} 
                    onChange={handleInputChange} 
                    placeholder="1234 5678 9012"
                    required
                    error={errors.aadhaarNumber}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-700 font-mono"
                  />
                  <Input 
                    label="Mobile Number (10-digit)" 
                    name="mobile" 
                    value={formData.mobile} 
                    onChange={handleInputChange} 
                    placeholder="9876543210"
                    required
                    error={errors.mobile}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-700 font-mono"
                  />
                  <Input 
                    label="Email Address" 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required
                    error={errors.email}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-700"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Employment & Income */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">2. Employment & Financial Information</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Employment Type</label>
                    <select 
                      name="employmentType" 
                      value={formData.employmentType} 
                      onChange={handleInputChange} 
                      className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100/80 dark:bg-slate-950"
                    >
                      <option value="Government">Government Sector</option>
                      <option value="Private">Private Company</option>
                      <option value="Self Employed">Self Employed</option>
                      <option value="Business">Business Owner</option>
                    </select>
                  </div>
                  <Input 
                    label="Company / Business Name" 
                    name="companyName" 
                    value={formData.companyName} 
                    onChange={handleInputChange} 
                    required
                    error={errors.companyName}
                    placeholder="e.g. Tata Consultancy Services"
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-700"
                  />
                  <Input 
                    label="Total Work Experience (Years)" 
                    type="number" 
                    name="workExperience" 
                    value={formData.workExperience} 
                    onChange={handleInputChange} 
                    required
                    error={errors.workExperience}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                  <Input 
                    label="Monthly Income (₹)" 
                    type="number" 
                    name="monthlyIncome" 
                    value={formData.monthlyIncome} 
                    onChange={handleInputChange} 
                    required
                    error={errors.monthlyIncome}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-blue-400"
                  />
                  <Input 
                    label="Monthly Expenses (₹)" 
                    type="number" 
                    name="monthlyExpenses" 
                    value={formData.monthlyExpenses} 
                    onChange={handleInputChange} 
                    required
                    error={errors.monthlyExpenses}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                  <Input 
                    label="Liquid Savings (₹)" 
                    type="number" 
                    name="savings" 
                    value={formData.savings} 
                    onChange={handleInputChange} 
                    required
                    error={errors.savings}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-emerald-400"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Financial Liabilities & Loan Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">3. Liabilities & Loan Parameters</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Input 
                    label="Existing Monthly EMI (₹)" 
                    type="number" 
                    name="existingEmi" 
                    value={formData.existingEmi} 
                    onChange={handleInputChange} 
                    required
                    error={errors.existingEmi}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                  <Input 
                    label="Current Account Savings Balance (₹)" 
                    type="number" 
                    name="currentBalance" 
                    value={formData.currentBalance} 
                    onChange={handleInputChange} 
                    required
                    error={errors.currentBalance}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                  <Input 
                    label="Credit Card Outstanding (₹)" 
                    type="number" 
                    name="creditCardOutstanding" 
                    value={formData.creditCardOutstanding} 
                    onChange={handleInputChange} 
                    required
                    error={errors.creditCardOutstanding}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                  <Input 
                    label="Required Loan Amount (₹)" 
                    type="number" 
                    name="loanAmount" 
                    value={formData.loanAmount} 
                    onChange={handleInputChange} 
                    required
                    error={errors.loanAmount}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-blue-400"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Loan Purpose</label>
                    <select 
                      name="loanPurpose" 
                      value={formData.loanPurpose} 
                      onChange={handleInputChange} 
                      className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100/80 dark:bg-slate-950"
                    >
                      <option value="Home">Home Loan</option>
                      <option value="Car">Car Loan</option>
                      <option value="Personal">Personal Loan</option>
                      <option value="Education">Education Loan</option>
                      <option value="Business">Business Development</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Credit History & Bank Verification (Demo) */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">4. Credit Score Factors & Bank Account Verification</h2>
                
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Previous Loan Defaults (count)</label>
                    <select 
                      name="previousDefaults" 
                      value={formData.previousDefaults} 
                      onChange={handleInputChange} 
                      className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100/80 dark:bg-slate-950"
                    >
                      <option value={0}>0 (No defaults)</option>
                      <option value={1}>1 default</option>
                      <option value={2}>2 defaults</option>
                      <option value={3}>3 or more defaults</option>
                    </select>
                  </div>
                  <Input 
                    label="Credit Card Utilization (%)" 
                    type="number" 
                    name="creditUtilization" 
                    value={formData.creditUtilization} 
                    onChange={handleInputChange} 
                    required
                    error={errors.creditUtilization}
                    placeholder="e.g. 30"
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                  <Input 
                    label="Credit History Length (Years)" 
                    type="number" 
                    name="creditHistoryLength" 
                    value={formData.creditHistoryLength} 
                    onChange={handleInputChange} 
                    required
                    error={errors.creditHistoryLength}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                  <Input 
                    label="Number of Active Loans" 
                    type="number" 
                    name="activeLoans" 
                    value={formData.activeLoans} 
                    onChange={handleInputChange} 
                    required
                    error={errors.activeLoans}
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Bank account verification panel */}
                <div className="p-5 rounded-2xl bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">RazorpayX Bank Verification ( penny-drop test )</h3>
                    </div>
                    {isBankVerified ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                        ✔ VERIFIED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-600/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full">
                        PENDING
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input 
                      label="Bank Account Number" 
                      name="bankAccountNumber" 
                      value={formData.bankAccountNumber} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 10093827101"
                      required
                      error={errors.bankAccountNumber}
                      className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
                    />
                    <Input 
                      label="Bank IFSC" 
                      name="bankIfsc" 
                      value={formData.bankIfsc} 
                      onChange={handleInputChange} 
                      placeholder="e.g. SBIN0001234"
                      required
                      error={errors.bankIfsc}
                      className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={handleVerifyBank}
                      isLoading={bankVerificationLoading}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white rounded-lg h-9 px-4"
                    >
                      Verify Account
                    </Button>
                    <span className="text-[10px] text-slate-500">
                      *Demo tips: Enter number ending in <strong>000</strong> to test non-existing account, or <strong>999</strong> to test name-mismatch.
                    </span>
                  </div>

                  {/* Verification Report */}
                  {bankVerificationResult && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                      bankVerificationResult.success 
                        ? 'bg-slate-100/30 dark:bg-slate-900/30 border-emerald-600/20 text-slate-700 dark:text-slate-300' 
                        : 'bg-red-950/10 border-red-900/20 text-red-300'
                    }`}>
                      <p className="font-bold flex items-center gap-1.5">
                        {bankVerificationResult.success ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        )}
                        Verification Report: {bankVerificationResult.success ? 'SUCCESS' : 'FAILED'}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800/60">
                        <div className="flex items-center gap-1">
                          <span>Account Exists:</span>
                          <span className={bankVerificationResult.accountExists ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {bankVerificationResult.accountExists ? '✔' : '✘'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Name Match:</span>
                          <span className={bankVerificationResult.nameMatch ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {bankVerificationResult.nameMatch ? '✔' : '✘'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>IFSC Valid:</span>
                          <span className={bankVerificationResult.ifscValid ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {bankVerificationResult.ifscValid ? '✔' : '✘'}
                          </span>
                        </div>
                      </div>

                      {bankVerificationResult.success && (
                        <div className="pt-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <p>• **Bank Name**: {bankVerificationResult.bankName}</p>
                          <p>• **Account Name**: {bankVerificationResult.verifiedName}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {errors.bankVerification && (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.bankVerification}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form Footer Action buttons */}
            <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
              {currentStep > 1 ? (
                <Button 
                  type="button" 
                  onClick={handleBack} 
                  variant="outline" 
                  className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 h-10 px-5 rounded-xl flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div></div> // spacing
              )}

              {currentStep < totalSteps ? (
                <Button 
                  type="button" 
                  onClick={handleNext} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
                >
                  Next Step
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  isLoading={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-500/15"
                >
                  <Sparkles className="h-4 w-4" />
                  Submit Application
                </Button>
              )}
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationForm;
