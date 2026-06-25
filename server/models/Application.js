const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 1. Personal Details
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  panNumber: { type: String, required: true },
  aadhaarNumber: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },

  // 2. Employment Details
  employmentType: { 
    type: String, 
    enum: ['Government', 'Private', 'Self Employed', 'Business'], 
    required: true 
  },
  companyName: { type: String, required: true },
  workExperience: { type: Number, required: true }, // in years

  // 3. Financial Details
  monthlyIncome: { type: Number, required: true },
  monthlyExpenses: { type: Number, required: true },
  existingEmi: { type: Number, required: true },
  savings: { type: Number, required: true },
  currentBalance: { type: Number, required: true },
  creditCardOutstanding: { type: Number, required: true },

  // 4. Loan Details
  loanAmount: { type: Number, required: true },
  loanPurpose: { 
    type: String, 
    enum: ['Home', 'Car', 'Personal', 'Education', 'Business'], 
    required: true 
  },

  // 5. Credit Details
  previousDefaults: { type: Number, required: true },
  creditUtilization: { type: Number, required: true }, // in %
  creditHistoryLength: { type: Number, required: true }, // in years
  activeLoans: { type: Number, required: true },

  // 6. Bank Verification Details (Demo)
  bankAccountNumber: { type: String, required: true },
  bankIfsc: { type: String, required: true },
  bankVerified: { type: Boolean, default: false },
  bankAccountExists: { type: Boolean, default: false },
  bankNameMatch: { type: Boolean, default: false },
  bankIfscValid: { type: Boolean, default: false },

  // 7. Prediction & Scoring Outputs
  approved: { type: Boolean, default: false },
  creditScore: { type: Number },
  riskLevel: { type: String }, // e.g. LOW RISK, MEDIUM RISK, HIGH RISK
  rating: { type: String }, // e.g. Excellent, Good, Medium Risk, etc.
  eligibility: { type: String }, // Eligible / Not Eligible
  maxLoanAmount: { type: Number },
  recommendedInterest: { type: Number },
  reasons: [{ type: String }], // Checklist of approval/rejection reasons (XAI)

  // 8. Fraud Detection Details
  isFraudFlagged: { type: Boolean, default: false },
  fraudReason: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);
