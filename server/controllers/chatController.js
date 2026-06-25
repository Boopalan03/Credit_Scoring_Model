const dataService = require('../dataService');

// System Prompt for FinAssist AI
const FINASSIST_SYSTEM_PROMPT = `You are FinAssist AI, an intelligent banking and credit advisor for an Indian AI Credit Scoring System.

Your responsibilities are:
- Explain credit scores in simple language.
- Help users understand loan eligibility.
- Suggest ways to improve credit scores.
- Explain EMI calculations.
- Guide users on PAN, Aadhaar, bank account verification, and KYC.
- Explain why a loan was approved or rejected using the prediction results.
- Recommend suitable loan amounts based on monthly income, expenses, and repayment capacity.
- Never promise loan approval.
- Never invent banking policies.
- Always advise users to verify final decisions with the bank.
- Use Indian Rupees (₹) for all monetary values.
- Respond in a professional, friendly, and concise manner.

If the user shares:
- Monthly Income
- Monthly Expenses
- Existing EMI
- Loan Amount
- Savings
- Employment Type

Estimate repayment capacity and provide general guidance, but clearly state that the final decision depends on the AI credit model and the lender's policy.

If the user asks financial questions outside credit scoring (such as investments or tax planning), recommend consulting a qualified financial advisor.`;

// Intelligent Local Fallback Chat Engine (when no API keys are present)
const handleFallbackChat = (userMessage, latestApplication) => {
  const msg = userMessage.toLowerCase();
  
  // 1. Context-based response: Why was my loan approved/rejected?
  if (msg.includes('my loan') || msg.includes('status') || msg.includes('why') || msg.includes('eligibility') || msg.includes('reject') || msg.includes('approve')) {
    if (!latestApplication) {
      return `I couldn't find any active loan application for your account yet. You can apply for a loan using the **Loan Application Form** on the sidebar, and I will be able to analyze your results and explain your credit score and risk factors in detail!`;
    }
    
    const isApproved = latestApplication.approved;
    const score = latestApplication.creditScore;
    const risk = latestApplication.riskLevel;
    const maxLoan = latestApplication.maxLoanAmount;
    const interest = latestApplication.recommendedInterest;
    const reasons = latestApplication.reasons || [];
    
    let response = `### Your Loan Application Analysis\n\n`;
    response += `* **Status**: ${isApproved ? 'Eligible' : 'Not Eligible'}\n`;
    response += `* **Credit Score**: **${score} / 900** (${latestApplication.rating})\n`;
    response += `* **Risk Level**: **${risk}**\n`;
    if (isApproved) {
      response += `* **Maximum Recommended Loan**: **₹${maxLoan.toLocaleString('en-IN')}**\n`;
      response += `* **Recommended Interest Rate**: **${interest}%**\n\n`;
      response += `**Why it was approved:**\n`;
    } else {
      response += `\n**Key Risk Factors Identified:**\n`;
    }
    
    reasons.forEach(r => {
      response += `- ${r}\n`;
    });
    
    if (!isApproved) {
      response += `\n### Recommendations to Improve Your Score:\n`;
      if (reasons.some(r => r.includes('Income'))) {
        response += `- **Increase Savings/Assets**: High savings can offset a lower monthly income during manual bank reviews.\n`;
      }
      if (reasons.some(r => r.includes('EMI'))) {
        response += `- **Close Active Loans / Reduce EMI**: Pay off smaller active credit card balances or personal loans to bring your debt-to-income ratio below 40%.\n`;
      }
      if (reasons.some(r => r.includes('Defaults'))) {
        response += `- **Avoid Defaults**: Ensure all credit card outstanding dues and EMI payments are paid 100% on time. Even a single default significantly lowers your score.\n`;
      }
      if (reasons.some(r => r.includes('utilization'))) {
        response += `- **Reduce Credit Card Utilization**: Keep your monthly credit card outstanding below 30% of your total limit.\n`;
      }
    } else {
      response += `\nCongratulations! Your credit profile is healthy. Please review the recommended terms and proceed with your bank representative. Remember that the final decision rests with the lender.`;
    }
    
    return response;
  }
  
  // 2. Improving Credit Score
  if (msg.includes('improve') || msg.includes('increase') || msg.includes('boost') || msg.includes('score')) {
    return `### How to Improve Your Credit Score (CIBIL) in India:

1. **Maintain 100% On-Time Payments**: Set up auto-debit for your EMIs and credit card bills. Payment history accounts for 35% of your score.
2. **Keep Credit Utilization below 30%**: If your credit limit is ₹1,00,000, try not to spend more than ₹30,000 in a billing cycle.
3. **Avoid Multiple Loan Enquiries**: Don't apply for multiple credit cards or loans simultaneously, as this flags you as credit-hungry.
4. **Maintain a Healthy Credit Mix**: Having a balanced mix of secured loans (like home/car loans) and unsecured loans (like credit cards/personal loans) is viewed positively.
5. **Keep Old Accounts Active**: A longer credit history builds trust. Don't close your oldest credit cards unless necessary.
6. **Check Credit Report regularly**: Rectify any errors or incorrect default entries by raising a dispute with CIBIL/Experian.`;
  }
  
  // 3. EMI Calculation Explanation
  if (msg.includes('emi') || msg.includes('calculate') || msg.includes('formula') || msg.includes('interest')) {
    return `### Equated Monthly Instalment (EMI) Explained

An **EMI** is a fixed payment made by a borrower to a lender on a specified date each calendar month. 

#### **The EMI Formula:**
$$\\text{EMI} = \\frac{P \\times r \\times (1 + r)^n}{(1 + r)^n - 1}$$

Where:
* **$P$** = Principal loan amount (e.g., ₹10,00,000)
* **$r$** = Monthly interest rate (Annual Rate / 12 / 100). E.g., if annual rate is 12%, then $r = 12 / 12 / 100 = 0.01$
* **$n$** = Loan tenure in months (e.g., 3 years = 36 months)

#### **Example:**
For a loan of **₹5,00,000** at **9% annual interest** for **3 years (36 months)**:
* $P$ = ₹5,00,000
* $r$ = 9 / 12 / 100 = 0.0075
* $n$ = 36
* **Monthly EMI**: **₹15,900**
* **Total Interest**: **₹72,393**
* **Total Repayment**: **₹5,72,393**

You can use the interactive **EMI Calculator** on your **Applicant Dashboard** to run these calculations in real-time!`;
  }
  
  // 4. PAN, Aadhaar & KYC Verification
  if (msg.includes('pan') || msg.includes('aadhaar') || msg.includes('kyc') || msg.includes('verification') || msg.includes('bank')) {
    return `### Guide to Banking Verification & KYC in India

In our system, we demonstrate three key Indian verification standards:
1. **PAN Card Verification**: We validate your 10-character Permanent Account Number format (\`ABCDE1234F\`). It is issued by the Income Tax Department and verifies tax compliance and identity.
2. **Aadhaar Card Check**: We validate the 12-digit UIDAI format (\`1234 5678 9012\`). It represents biometric identity.
3. **Bank Account Verification (RazorpayX/Setu)**: 
   - We perform a **penny drop test** where the system validates if the account exists, the IFSC code is valid, and the bank ledger's account-holder name matches your application name.
   - **Demo Tip**: You can input any account ending with \`000\` to simulate "Account Does Not Exist", or ending with \`999\` to simulate "Name Mismatch/Verification Failed". All other inputs will verify successfully.`;
  }
  
  // 5. Income Share & Repayment Capacity Estimation
  // Regex to extract numbers
  const incomeMatch = msg.match(/(?:income|salary|earn)[^\d]*(\d+[\d,]*)/);
  const emiMatch = msg.match(/(?:emi|expense|spend)[^\d]*(\d+[\d,]*)/);
  
  if (incomeMatch) {
    const inc = parseInt(incomeMatch[1].replace(/,/g, ''));
    const existingEmi = emiMatch ? parseInt(emiMatch[1].replace(/,/g, '')) : 0;
    
    const maxEmiAllowed = inc * 0.5; // 50% DTI cap
    const remainingCapacity = Math.max(0, maxEmiAllowed - existingEmi);
    
    // Estimate loan amounts
    const estPersonalLoan = remainingCapacity * 36;
    const estHomeLoan = remainingCapacity * 60;
    
    return `### FinAssist Repayment Capacity Estimate (₹)
Based on your shared monthly income of **₹${inc.toLocaleString('en-IN')}** and existing EMI of **₹${existingEmi.toLocaleString('en-IN')}**:

1. **Debt-to-Income Limit**: Indian banks generally cap your total monthly EMIs at **50% of your net income**, which is **₹${maxEmiAllowed.toLocaleString('en-IN')}**.
2. **Remaining Monthly EMI Capacity**: You can afford an additional monthly EMI of up to **₹${remainingCapacity.toLocaleString('en-IN')}**.
3. **Estimated Borrowing Power**:
   - **Personal Loan (3-year tenure at 11.5%)**: Approximately **₹${Math.round(estPersonalLoan * 0.8).toLocaleString('en-IN')}**
   - **Home Loan (5-year tenure at 8.5%)**: Approximately **₹${Math.round(estHomeLoan * 0.85).toLocaleString('en-IN')}**

*Please note: This is a preliminary estimate. The final loan amount and interest rates are determined dynamically by our AI credit scoring model based on your comprehensive defaults, savings, and credit history.*`;
  }

  // 6. Default Welcome/Fallback response
  return `Hello! I am **FinAssist AI**, your intelligent credit and banking advisor. 

How can I help you today? You can ask me questions like:
- "Why was my loan application rejected/approved?" (to review your latest results)
- "How do I improve my CIBIL credit score?"
- "Explain how a monthly EMI is calculated."
- "What are the rules for PAN, Aadhaar, and bank verification?"

*Note: I provide banking guidance using Indian Rupees (₹) and standards. Always verify final loan terms with your bank representative.*`;
};

// Chat Controller Endpoint
const chatWithFinAssist = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const userId = req.user._id;
    
    // Fetch latest application for this user safely, handling legacy records
    const allApps = await dataService.getAllApplications();
    const myApps = allApps.filter(app => app.userId && app.userId.toString() === userId.toString());
    const latestApplication = myApps.length > 0 ? myApps[0] : null;

    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. If Gemini API Key is present, call Gemini
    if (geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        
        // Include user's application context in the message to the model
        let contextMessage = `User Message: "${message}"\n\n`;
        if (latestApplication) {
          contextMessage += `[Applicant Application Context]:
- Name: ${latestApplication.fullName}
- Credit Score: ${latestApplication.creditScore} / 900
- Risk Level: ${latestApplication.riskLevel} (${latestApplication.rating})
- Status: ${latestApplication.approved ? 'Approved/Eligible' : 'Rejected/Not Eligible'}
- Max Eligible Loan: ₹${latestApplication.maxLoanAmount}
- Recommended Interest: ${latestApplication.recommendedInterest}%
- Key Factors: ${JSON.stringify(latestApplication.reasons)}`;
        } else {
          contextMessage += `[Applicant Application Context]: No loan application has been submitted yet.`;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: contextMessage }] }],
            systemInstruction: { parts: [{ text: FINASSIST_SYSTEM_PROMPT }] }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates[0].content.parts[0].text;
          return res.json({ response: reply });
        } else {
          console.warn('Gemini API returned an error, falling back to local chat engine.');
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local chat engine. Error:', err.message);
      }
    }

    // 2. If OpenAI API Key is present, call OpenAI
    if (openaiKey) {
      try {
        let contextMessage = `User Message: "${message}"\n\n`;
        if (latestApplication) {
          contextMessage += `[Context]: User has applied. Score: ${latestApplication.creditScore}, Status: ${latestApplication.approved ? 'Eligible' : 'Not Eligible'}, Factors: ${latestApplication.reasons.join(', ')}`;
        }
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: FINASSIST_SYSTEM_PROMPT },
              { role: 'user', content: contextMessage }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices[0].message.content;
          return res.json({ response: reply });
        } else {
          console.warn('OpenAI API returned an error, falling back to local chat engine.');
        }
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to local chat engine. Error:', err.message);
      }
    }

    // 3. Fallback to local intelligent chat engine
    const reply = handleFallbackChat(message, latestApplication);
    res.json({ response: reply });

  } catch (error) {
    console.error('Error in chatbot controller:', error);
    res.status(500).json({ error: 'Server error processing chat message.' });
  }
};

module.exports = {
  chatWithFinAssist
};
