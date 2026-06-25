import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from 'react-toastify';
import { 
  CheckCircle, XCircle, AlertTriangle, Download, 
  ChevronRight, ArrowLeft, Landmark, Award, ShieldAlert, Sparkles, RefreshCw 
} from 'lucide-react';

const PredictionResult = () => {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const data = await applicationService.getById(id);
        setApp(data);
      } catch (error) {
        toast.error('Failed to retrieve credit report.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] space-y-4">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400">Analyzing applicant credit profile...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-12 space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Credit Report Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400">The requested application ID does not exist or you do not have permission to view it.</p>
        <Link to="/dashboard">
          <Button className="bg-slate-800 hover:bg-slate-700">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Score Color Mapping
  const getScoreColor = (score) => {
    if (score >= 751) return '#16A34A'; // Emerald Green
    if (score >= 651) return '#2563EB'; // Blue
    if (score >= 501) return '#EAB308'; // Yellow
    if (score >= 301) return '#EA580C'; // Orange
    return '#DC2626'; // Red
  };

  const getScoreCategory = (score) => {
    if (score >= 751) return { text: 'Excellent', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 651) return { text: 'Good', textClass: 'text-blue-400', bgClass: 'bg-blue-500/10 border-blue-500/20' };
    if (score >= 501) return { text: 'Medium Risk', textClass: 'text-yellow-400', bgClass: 'bg-yellow-500/10 border-yellow-500/20' };
    if (score >= 301) return { text: 'High Risk', textClass: 'text-orange-400', bgClass: 'bg-orange-500/10 border-orange-500/20' };
    return { text: 'Very High Risk', textClass: 'text-red-400', bgClass: 'bg-red-500/10 border-red-500/20' };
  };

  const scoreInfo = getScoreCategory(app.creditScore);

  // SVG Gauge calculations
  // Scale score from 300 (0%) to 900 (100%)
  const percentage = Math.max(0, Math.min(100, ((app.creditScore - 300) / 600) * 100));
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 251.3; // Half circumference of radius 80 (PI * R)
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Generate dynamic tips based on report parameters
  const generateImprovementTips = () => {
    const tips = [];
    if (app.previousDefaults > 0) {
      tips.push({
        title: 'Avoid Future Loan Defaults',
        desc: 'Ensure 100% on-time EMI repayments. A single late payment can penalize your CIBIL score by up to 50 points.'
      });
    }
    if (app.creditUtilization > 30) {
      tips.push({
        title: 'Reduce Credit Utilization below 30%',
        desc: `Your current utilization is ${app.creditUtilization}%. Pay off card outstanding balances before the bill generation date to lower your ratio.`
      });
    } else {
      tips.push({
        title: 'Maintain Credit Utilization below 30%',
        desc: 'Continue keeping card utilization low to signal healthy, non-credit-hungry behavior.'
      });
    }
    if (app.existingEmi > app.monthlyIncome * 0.3) {
      tips.push({
        title: 'Reduce EMI / Debt Consolidation',
        desc: 'Your existing EMIs consume a high share of income. Pay off smaller unsecured personal loans to improve your debt-to-income (DTI) ratio.'
      });
    } else {
      tips.push({
        title: 'Avoid Taking On Excess EMIs',
        desc: 'Keep existing EMIs low to maintain high borrowing capacity for major requirements (like Home Loans).'
      });
    }
    if (app.activeLoans > 3) {
      tips.push({
        title: 'Close Active Loan Accounts',
        desc: 'Having multiple active loans lowers score due to high leverage. Pre-close smaller loans where possible.'
      });
    }
    if (app.creditHistoryLength < 3) {
      tips.push({
        title: 'Build Credit History Length',
        desc: 'Keep your oldest credit card active. A longer credit history builds deep institutional trust.'
      });
    }
    return tips.slice(0, 3); // Return top 3 tips
  };

  const improvementTips = generateImprovementTips();

  // Print Report trigger (which will trigger a clean PDF download dialog via browser print styles)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 text-slate-800 dark:text-slate-100 print:bg-white print:text-black print:p-0">
      
      {/* Header navigation bar - hidden in print */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-800 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Credit Report</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Application Reference ID: <span className="font-mono text-slate-700 dark:text-slate-300">{app._id || app.id}</span></p>
          </div>
        </div>

        <Button 
          onClick={handlePrint}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 font-semibold text-sm rounded-xl h-10 px-5 flex items-center gap-2 text-slate-800 dark:text-white"
        >
          <Download className="h-4 w-4" />
          Download Report PDF
        </Button>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:flex flex-col border-b border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">CreditScoreAI Banking Report</h1>
        <p className="text-sm text-gray-600">Applicant: {app.fullName} | Date: {new Date().toLocaleDateString('en-IN')}</p>
        <p className="text-xs text-gray-500 font-mono">Reference ID: {app._id || app.id}</p>
      </div>

      {/* Fraud Alert Notification (Hidden in normal print unless wanted, but shown on screen) */}
      {app.isFraudFlagged && (
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/50 text-red-400 text-sm flex gap-3 shadow-lg">
          <ShieldAlert className="h-6 w-6 flex-shrink-0 text-red-500" />
          <div className="space-y-1">
            <h4 className="font-bold">Security Alert: Flagged for Manual Fraud Review</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{app.fraudReason}</p>
          </div>
        </div>
      )}

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:flex print:flex-col print:gap-4">
        
        {/* Left Column: Credit Score circular gauge */}
        <Card className="shadow-2xl flex flex-col items-center justify-center p-6 text-center print:border print:border-solid print:border-slate-300 print:break-inside-avoid">
          <CardContent className="space-y-4 pt-4 flex flex-col items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Credit Score Gauge</h3>
            
            {/* Custom SVG Gauge */}
            <div className="relative w-44 h-24 flex items-end justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 110">
                {/* Background Track Arc */}
                <path
                  d="M20,100 A80,80 0 0,1 180,100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  className="text-slate-200 dark:text-slate-800"
                />
                {/* Active Colored Arc */}
                <path
                  d="M20,100 A80,80 0 0,1 180,100"
                  fill="none"
                  stroke={getScoreColor(app.creditScore)}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={251.3}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              
              {/* Score text in center */}
              <div className="absolute bottom-0 flex flex-col items-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{app.creditScore}</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">out of 900</span>
              </div>
            </div>

            {/* Score Band Badge */}
            <div className={`px-4 py-1.5 rounded-xl border font-bold text-xs ${scoreInfo.bgClass} ${scoreInfo.textClass}`}>
              {scoreInfo.text.toUpperCase()}
            </div>

            {/* Risk Meter Label */}
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              Risk Level: <span className={`font-black ${(app.riskLevel || '').includes('LOW') ? 'text-emerald-400' : (app.riskLevel || '').includes('MEDIUM') ? 'text-yellow-400' : 'text-red-400'}`}>{app.riskLevel || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Loan parameters and approval status */}
        <Card className="shadow-2xl md:col-span-2 p-6 print:border print:border-solid print:border-slate-300 print:break-inside-avoid">
          <CardContent className="h-full flex flex-col justify-between space-y-6 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Loan Eligibility decision</h3>
                <h2 className={`text-2xl font-black flex items-center gap-2 ${app.approved ? 'text-emerald-400' : 'text-red-500'}`}>
                  {app.approved ? (
                    <>
                      <CheckCircle className="h-6 w-6 flex-shrink-0" />
                      Eligible / Approved
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 flex-shrink-0" />
                      Not Eligible / Rejected
                    </>
                  )}
                </h2>
              </div>
              
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/40 dark:bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 print:border-slate-300 print:text-slate-700">
                <Landmark className="h-4 w-4 text-blue-400" />
                <span>Bank Verification: <strong className={app.bankVerified ? 'text-emerald-400' : 'text-red-400'}>{app.bankVerified ? '✔ SUCCESSFUL' : '✘ FAILED'}</strong></span>
              </div>
            </div>

            {/* Loan parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-200 dark:border-slate-200 dark:border-slate-800/80">
              <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-100/40 dark:bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-200 dark:border-slate-200 dark:border-slate-800/80 print:border-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Maximum Eligible Loan Limit</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  ₹{app.maxLoanAmount ? app.maxLoanAmount.toLocaleString('en-IN') : '0'}
                </p>
                <span className="text-[10px] text-slate-500 block mt-1">Based on monthly repayment capacity</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-100/40 dark:bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-200 dark:border-slate-200 dark:border-slate-800/80 print:border-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recommended Interest Rate</span>
                <p className="text-2xl font-black text-blue-400 mt-1">
                  {app.recommendedInterest ? `${app.recommendedInterest}%` : 'N/A'}
                </p>
                <span className="text-[10px] text-slate-500 block mt-1">Risk-adjusted annual rate (p.a.)</span>
              </div>
            </div>

            {/* Quick Summary */}
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              *Disclaimer: This score represents an AI prediction based on Indian banking algorithms. Recommended loan amounts and interest rates are illustrative limits. The final lending authority remains with the partner bank.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lower Section: Explainable AI reasons & Credit Improvement tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:flex print:flex-col print:gap-4">
        
        {/* Explainable AI (XAI) Reasons Checklist */}
        <Card className="shadow-2xl p-6 print:border print:border-solid print:border-slate-300 print:break-inside-avoid">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Explainable AI (XAI) Decision Factors</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our machine learning pipeline analyzed your financial parameters against 10,000 reference portfolios. The decision was determined by these specific factors:
            </p>

            <div className="space-y-2.5 pt-2">
              {app.reasons && app.reasons.map((r, idx) => {
                const isPositive = r.startsWith('✔');
                return (
                  <div key={idx} className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold border ${
                    isPositive 
                      ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 text-emerald-700 dark:text-emerald-400 print:border-emerald-300 print:text-emerald-800' 
                      : 'bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10 text-red-700 dark:text-red-400 print:border-red-300 print:text-red-800'
                  }`}>
                    <span className="text-sm leading-none flex-shrink-0 mt-0.5">{isPositive ? '✔' : '✘'}</span>
                    <span>{r.substring(2)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Credit Improvement Tips */}
        <Card className="shadow-2xl p-6 print:hidden">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Award className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Credit Score Improvement Tips</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Based on your specific credit factors, our credit engine recommends the following action plan to optimize your score:
            </p>

            <div className="space-y-3 pt-2">
              {improvementTips.map((tip, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs">
                  <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 dark:text-white">{tip.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Footer navigation */}
      <div className="flex justify-between items-center pt-4 print:hidden">
        <Link to="/dashboard">
          <Button variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
            Back to Dashboard
          </Button>
        </Link>
        
        <Link to="/apply">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            Apply for New Loan
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PredictionResult;
