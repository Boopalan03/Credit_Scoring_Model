const dataService = require('../dataService');

// Get admin statistics and fraud alerts
const getAdminStats = async (req, res) => {
  try {
    const allApps = await dataService.getAllApplications();

    const totalApplicants = allApps.length;
    const approved = allApps.filter(app => app.approved === true).length;
    const rejected = allApps.filter(app => app.approved === false).length;
    
    // Total Loan Amount
    const totalLoanAmount = allApps.reduce((sum, app) => sum + (app.loanAmount || 0), 0);
    
    // Average Credit Score
    const appsWithScore = allApps.filter(app => typeof app.creditScore === 'number');
    const avgCreditScore = appsWithScore.length > 0
      ? Math.round(appsWithScore.reduce((sum, app) => sum + app.creditScore, 0) / appsWithScore.length)
      : 0;

    // Fraud Alerts
    const fraudAlerts = allApps.filter(app => app.isFraudFlagged === true);

    // Dynamic Chart Data Calculations
    // 1. Credit Score Distribution: Excellent (751+), Good (651-750), Medium (501-650), High/Very High (<=500)
    const scoreBuckets = {
      excellent: allApps.filter(app => app.creditScore >= 751).length,
      good: allApps.filter(app => app.creditScore >= 651 && app.creditScore <= 750).length,
      medium: allApps.filter(app => app.creditScore >= 501 && app.creditScore <= 650).length,
      highRisk: allApps.filter(app => app.creditScore <= 500).length
    };

    // 2. Loan Purpose Breakdown
    const purposeCounts = {};
    allApps.forEach(app => {
      purposeCounts[app.loanPurpose] = (purposeCounts[app.loanPurpose] || 0) + 1;
    });

    res.json({
      totalApplicants,
      approved,
      rejected,
      avgCreditScore,
      totalLoanAmount,
      fraudCount: fraudAlerts.length,
      fraudAlerts,
      charts: {
        scoreBuckets,
        purposeCounts
      }
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ error: 'Server error fetching statistics.' });
  }
};

// Get all applications for the admin dashboard grid
const getAllApplicants = async (req, res) => {
  try {
    const allApps = await dataService.getAllApplications();
    res.json(allApps);
  } catch (error) {
    console.error('Error fetching all applicants:', error);
    res.status(500).json({ error: 'Server error fetching applicants.' });
  }
};

module.exports = {
  getAdminStats,
  getAllApplicants
};
