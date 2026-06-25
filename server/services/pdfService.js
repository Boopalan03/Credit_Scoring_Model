/**
 * PDF Service — Credit Assessment Report Generator.
 *
 * Generates a comprehensive PDF report containing KYC status,
 * bureau scores, credit report summary, banking analysis,
 * loan eligibility, and financial health metrics.
 *
 * Uses plain text streaming to build a PDF-compatible report.
 * In production, replace with PDFKit or Puppeteer for styled output.
 */

const RiskAssessment = require('../models/RiskAssessment');
const KYCProfile = require('../models/KYCProfile');
const CreditBureauReport = require('../models/CreditBureauReport');
const AccountAggregator = require('../models/AccountAggregator');
const User = require('../models/User');
const { decrypt, maskSensitive } = require('../utils/encryption');

/**
 * Generate report data object for a user.
 * This structured data can be used by any PDF renderer.
 */
async function generateReportData(userId) {
  const [user, kyc, assessment, bureauReports, aaRecord] = await Promise.all([
    User.findById(userId).select('-password'),
    KYCProfile.findOne({ userId }),
    RiskAssessment.findOne({ userId }).sort({ createdAt: -1 }),
    CreditBureauReport.find({ userId }).sort({ fetchedAt: -1 }).limit(4),
    AccountAggregator.findOne({ userId, consentStatus: 'APPROVED' }).sort({ dataFetchedAt: -1 }),
  ]);

  const reportDate = new Date().toISOString().split('T')[0];

  return {
    meta: {
      reportTitle: 'CreditWise Credit Assessment Report',
      generatedAt: new Date().toISOString(),
      reportDate,
      reportId: `CW-${Date.now()}`,
    },

    personalInfo: {
      name: user?.name || 'N/A',
      email: user?.email || 'N/A',
    },

    kycStatus: kyc ? {
      overall: kyc.kycStatus,
      panVerified: kyc.panVerified,
      panName: kyc.panName,
      panMasked: kyc.panNumber ? maskSensitive(decrypt(kyc.panNumber)) : 'N/A',
      aadhaarVerified: kyc.aadhaarVerified,
      mobileVerified: kyc.mobileVerified,
      bankVerified: kyc.bankAccount?.verified || false,
      bankName: kyc.bankAccount?.bankName || 'N/A',
    } : null,

    bureauScores: bureauReports.map(r => ({
      bureau: r.bureau,
      score: r.score,
      totalAccounts: r.creditReport?.totalAccounts || 0,
      activeAccounts: r.creditReport?.totalActiveAccounts || 0,
      overdueAccounts: r.creditReport?.totalOverdueAccounts || 0,
      totalCreditLimit: r.creditReport?.totalCreditLimit || 0,
      totalOutstanding: r.creditReport?.totalCurrentBalance || 0,
      activeLoansCount: r.creditReport?.activeLoans?.length || 0,
      closedLoansCount: r.creditReport?.closedLoans?.length || 0,
      creditCardsCount: r.creditReport?.creditCards?.length || 0,
      defaultsCount: r.creditReport?.defaults?.length || 0,
      enquiryCount: r.enquiryCount || 0,
      fetchedAt: r.fetchedAt,
    })),

    riskAssessment: assessment ? {
      dynamicRiskScore: assessment.dynamicRiskScore,
      riskCategory: assessment.riskCategory,
      consolidatedBureauScore: assessment.consolidatedBureauScore,
      debtToIncomeRatio: assessment.debtToIncomeRatio,
      financialHealthScore: assessment.financialHealthScore,
      mlCreditScore: assessment.mlCreditScore,
      loanDecision: assessment.loanDecision,
      bankingData: assessment.bankingData,
      incomeVerification: assessment.incomeVerification,
      existingLiabilities: assessment.existingLiabilities,
    } : null,

    bankingAnalysis: aaRecord ? {
      linkedAccounts: aaRecord.linkedAccounts?.length || 0,
      financialHealthMetrics: aaRecord.financialHealthMetrics,
      cashFlow: aaRecord.financialData?.cashFlowData || [],
      salaryCredits: aaRecord.financialData?.salaryCredits || [],
      recurringExpenses: aaRecord.financialData?.recurringExpenses || [],
      dataFetchedAt: aaRecord.dataFetchedAt,
    } : null,
  };
}

/**
 * Generate a plain-text formatted report (for streaming / basic PDF).
 */
async function generateTextReport(userId) {
  const data = await generateReportData(userId);
  const lines = [];
  const hr = '═'.repeat(60);
  const hr2 = '─'.repeat(60);

  lines.push(hr);
  lines.push('  CREDITWISE — CREDIT ASSESSMENT REPORT');
  lines.push(hr);
  lines.push(`  Report ID: ${data.meta.reportId}`);
  lines.push(`  Generated: ${data.meta.generatedAt}`);
  lines.push('');

  // Personal Info
  lines.push(hr2);
  lines.push('  SECTION 1: PERSONAL INFORMATION');
  lines.push(hr2);
  lines.push(`  Name:  ${data.personalInfo.name}`);
  lines.push(`  Email: ${data.personalInfo.email}`);
  lines.push('');

  // KYC Status
  lines.push(hr2);
  lines.push('  SECTION 2: KYC VERIFICATION STATUS');
  lines.push(hr2);
  if (data.kycStatus) {
    lines.push(`  Overall Status: ${data.kycStatus.overall.toUpperCase()}`);
    lines.push(`  PAN Verified:     ${data.kycStatus.panVerified ? '✓ Yes' : '✗ No'}  ${data.kycStatus.panMasked || ''}`);
    lines.push(`  Aadhaar Verified: ${data.kycStatus.aadhaarVerified ? '✓ Yes' : '✗ No'}`);
    lines.push(`  Mobile Verified:  ${data.kycStatus.mobileVerified ? '✓ Yes' : '✗ No'}`);
    lines.push(`  Bank Verified:    ${data.kycStatus.bankVerified ? '✓ Yes' : '✗ No'}  ${data.kycStatus.bankName || ''}`);
  } else {
    lines.push('  KYC not started.');
  }
  lines.push('');

  // Bureau Scores
  lines.push(hr2);
  lines.push('  SECTION 3: CREDIT BUREAU SCORES');
  lines.push(hr2);
  if (data.bureauScores.length > 0) {
    lines.push('  Bureau       Score   Active Loans   Outstanding   Defaults');
    lines.push('  ' + '─'.repeat(56));
    data.bureauScores.forEach(b => {
      lines.push(`  ${b.bureau.padEnd(12)} ${String(b.score).padStart(5)}   ${String(b.activeLoansCount).padStart(12)}   ${('₹' + b.totalOutstanding.toLocaleString('en-IN')).padStart(13)}   ${String(b.defaultsCount).padStart(8)}`);
    });
  } else {
    lines.push('  No bureau scores fetched.');
  }
  lines.push('');

  // Risk Assessment
  lines.push(hr2);
  lines.push('  SECTION 4: RISK ASSESSMENT');
  lines.push(hr2);
  if (data.riskAssessment) {
    const ra = data.riskAssessment;
    lines.push(`  Dynamic Risk Score:       ${ra.dynamicRiskScore}/100`);
    lines.push(`  Risk Category:            ${ra.riskCategory}`);
    lines.push(`  Consolidated Bureau Score: ${ra.consolidatedBureauScore}`);
    lines.push(`  ML Credit Score:          ${ra.mlCreditScore}`);
    lines.push(`  Debt-to-Income Ratio:     ${ra.debtToIncomeRatio}%`);
    lines.push(`  Financial Health Score:   ${ra.financialHealthScore}/100`);
    lines.push('');

    if (ra.loanDecision) {
      lines.push('  LOAN ELIGIBILITY:');
      lines.push(`  Recommendation:          ${ra.loanDecision.recommendation}`);
      lines.push(`  Max Eligible Amount:     ₹${ra.loanDecision.maxEligibleAmount?.toLocaleString('en-IN') || '0'}`);
      lines.push(`  Suggested Interest Rate: ${ra.loanDecision.suggestedInterestRate}%`);
      lines.push(`  Max Tenure:              ${ra.loanDecision.suggestedTenureMonths} months`);
      lines.push(`  Repayment Capacity:      ₹${ra.loanDecision.repaymentCapacity?.toLocaleString('en-IN') || '0'}/month`);

      if (ra.loanDecision.approvalReasons?.length) {
        lines.push('');
        lines.push('  APPROVAL FACTORS:');
        ra.loanDecision.approvalReasons.forEach(r => lines.push(`    ✓ ${r}`));
      }
      if (ra.loanDecision.rejectionReasons?.length) {
        lines.push('');
        lines.push('  RISK FACTORS:');
        ra.loanDecision.rejectionReasons.forEach(r => lines.push(`    ✗ ${r}`));
      }
      if (ra.loanDecision.riskWarnings?.length) {
        lines.push('');
        lines.push('  WARNINGS:');
        ra.loanDecision.riskWarnings.forEach(r => lines.push(`    ⚠ ${r}`));
      }
    }
  } else {
    lines.push('  Risk assessment not completed.');
  }
  lines.push('');

  // Banking Analysis
  lines.push(hr2);
  lines.push('  SECTION 5: BANKING BEHAVIOUR ANALYSIS');
  lines.push(hr2);
  if (data.bankingAnalysis) {
    const ba = data.bankingAnalysis;
    const m = ba.financialHealthMetrics || {};
    lines.push(`  Linked Accounts:    ${ba.linkedAccounts}`);
    lines.push(`  Avg Monthly Income: ₹${(m.avgMonthlyIncome || 0).toLocaleString('en-IN')}`);
    lines.push(`  Avg Monthly Expense: ₹${(m.avgMonthlyExpense || 0).toLocaleString('en-IN')}`);
    lines.push(`  Savings Rate:       ${m.savingsRate || 0}%`);
    lines.push(`  EMI-to-Income:      ${m.emiToIncomeRatio || 0}%`);
    lines.push(`  Income Stability:   ${m.incomeStability || 0}/100`);
    lines.push(`  Cash Flow Health:   ${m.cashFlowHealth || 0}/100`);
    lines.push(`  Overall Score:      ${m.overallScore || 0}/100`);

    if (ba.recurringExpenses?.length) {
      lines.push('');
      lines.push('  RECURRING EXPENSES:');
      ba.recurringExpenses.forEach(e => {
        lines.push(`    ${e.description.padEnd(25)} ₹${e.amount.toLocaleString('en-IN').padStart(10)}  (${e.frequency})`);
      });
    }
  } else {
    lines.push('  Banking data not available. Link accounts via Account Aggregator.');
  }
  lines.push('');

  // Footer
  lines.push(hr);
  lines.push('  DISCLAIMER');
  lines.push(hr);
  lines.push('  This report is generated for informational purposes only.');
  lines.push('  Credit decisions should be validated with authorized financial');
  lines.push('  institutions. Data sourced via RBI-compliant Account Aggregator');
  lines.push('  framework with explicit user consent.');
  lines.push('');
  lines.push(`  © ${new Date().getFullYear()} CreditWise. All rights reserved.`);
  lines.push(hr);

  return lines.join('\n');
}

module.exports = {
  generateReportData,
  generateTextReport,
};
