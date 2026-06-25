import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { applicationService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from 'react-toastify';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  Tooltip as RechartsTooltip, Legend as RechartsLegend 
} from 'recharts';
import { 
  PlusCircle, FileText, Landmark, ShieldCheck, 
  HelpCircle, Sparkles, RefreshCw, DollarSign, Calculator, Download 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestApp, setLatestApp] = useState(null);

  // EMI Calculator State
  const [emiLoan, setEmiLoan] = useState(500000);
  const [emiInterest, setEmiInterest] = useState(9.5);
  const [emiYears, setEmiYears] = useState(3);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationService.getMyApplications();
        setApplications(data);
        if (data && data.length > 0) {
          // The API returns sorted by date descending, so the first is the latest
          setLatestApp(data[0]);
          
          // Pre-populate EMI calculator with their approved loan parameters if approved
          if (data[0].approved) {
            setEmiLoan(data[0].maxLoanAmount || 500000);
            setEmiInterest(data[0].recommendedInterest || 9.5);
          }
        }
      } catch (error) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] space-y-4">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400">Loading your applicant portal...</p>
      </div>
    );
  }

  // EMI Calculations
  const calculateEMI = () => {
    const P = emiLoan;
    const r = emiInterest / 12 / 100;
    const n = emiYears * 12;
    
    if (r === 0) {
      const emi = P / n;
      return { emi: Math.round(emi), totalPayable: P, totalInterest: 0 };
    }
    
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - P;
    
    return {
      emi: Math.round(emi),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(totalInterest)
    };
  };

  const emiResult = calculateEMI();

  // Salary Analysis Pie Chart Data
  const getPieChartData = () => {
    if (!latestApp) return [];
    
    const income = latestApp.monthlyIncome || 0;
    const expenses = latestApp.monthlyExpenses || 0;
    const emi = latestApp.existingEmi || 0;
    const savings = Math.max(0, income - expenses - emi);
    
    return [
      { name: 'Expenses', value: expenses, color: '#EA580C' }, // Orange
      { name: 'Existing EMI', value: emi, color: '#DC2626' },   // Red
      { name: 'Savings Capacity', value: savings, color: '#16A34A' } // Green
    ];
  };

  const pieData = getPieChartData();
  const COLORS = pieData.map(d => d.color);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-800 dark:text-slate-100 pb-12">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Applicant Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your loan requests and monitor your credit profile.</p>
        </div>
        
        <Link to="/apply">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15">
            <PlusCircle className="h-4 w-4" />
            Apply for New Loan
          </Button>
        </Link>
      </div>

      {!latestApp ? (
        /* Empty State: Prompt user to apply */
        <Card className="shadow-2xl p-8 text-center max-w-xl mx-auto space-y-6">
          <CardContent className="space-y-4 pt-4">
            <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">No Active Credit Profile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              You haven't submitted any loan applications yet. Create an account profile and complete our secure form to assess your credit score, check eligibility, and get instant recommendations.
            </p>
            <Link to="/apply" className="inline-block pt-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white font-semibold rounded-xl h-11 px-8 shadow-lg shadow-blue-500/20">
                Start Free Credit Check
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Dashboard Layout: Left 2/3 and Right 1/3 */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2/3 COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Latest Application Status Card */}
            <Card className="shadow-2xl p-5">
              <CardContent className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Latest Loan Application</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Submitted: {new Date(latestApp.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  
                  <div className={`px-3.5 py-1.5 rounded-xl font-black text-xs border ${
                    latestApp.approved 
                      ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {latestApp.approved ? 'ELIGIBLE / APPROVED' : 'NOT ELIGIBLE / REJECTED'}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-100/40 dark:bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-200 dark:border-slate-200 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Credit Score</span>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{latestApp.creditScore}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-100/40 dark:bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-200 dark:border-slate-200 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Risk Level</span>
                    <p className={`text-sm font-black mt-1.5 ${
                      (latestApp.riskLevel || '').includes('LOW') 
                        ? 'text-emerald-400' 
                        : (latestApp.riskLevel || '').includes('MEDIUM') 
                        ? 'text-yellow-400' 
                        : 'text-red-400'
                    }`}>{latestApp.riskLevel || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-100/40 dark:bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-200 dark:border-slate-200 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Requested Loan</span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">₹{(latestApp.loanAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-100/40 dark:bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-200 dark:border-slate-200 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Purpose</span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">{latestApp.loanPurpose || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Link to={`/prediction/${latestApp._id || latestApp.id}`}>
                    <Button variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs rounded-lg h-9 px-4">
                      View Full Credit Report
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Salary Analysis Chart */}
            <Card className="shadow-2xl p-5">
              <CardContent className="space-y-4 pt-2">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Salary Analysis & Budget Ratios</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Visualizing your Monthly Income (₹{(latestApp.monthlyIncome || 0).toLocaleString('en-IN')}) allocation</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-around gap-6 pt-2">
                  {/* Recharts Pie Chart */}
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                          contentStyle={{ backgroundColor: 'var(--bg-root)', borderColor: 'var(--border-default)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend Grid */}
                  <div className="space-y-3 flex-1 max-w-sm">
                    {pieData.map((item, idx) => {
                      const percentage = latestApp.monthlyIncome ? ((item.value / latestApp.monthlyIncome) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-100/50 dark:bg-slate-100/40 dark:bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-200 dark:border-slate-200 dark:border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-slate-900 dark:text-white block">₹{(item.value || 0).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-slate-500">{percentage}% of Net Income</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Interactive EMI Calculator */}
            <Card className="shadow-2xl p-5">
              <CardContent className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <Calculator className="h-5 w-5 text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Interactive Loan EMI Calculator</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Sliders Input Column */}
                  <div className="space-y-4">
                    {/* Loan Amount */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">Principal Loan Amount</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">₹{emiLoan.toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        type="range"
                        min="50000"
                        max="7500000"
                        step="50000"
                        value={emiLoan}
                        onChange={(e) => setEmiLoan(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">Annual Interest Rate</span>
                        <span className="text-blue-400 font-extrabold">{emiInterest}%</span>
                      </div>
                      <input
                        type="range"
                        min="6.5"
                        max="18"
                        step="0.1"
                        value={emiInterest}
                        onChange={(e) => setEmiInterest(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    {/* Loan Tenure */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">Tenure (Years)</span>
                        <span className="text-emerald-400 font-extrabold">{emiYears} {emiYears === 1 ? 'Year' : 'Years'}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={emiYears}
                        onChange={(e) => setEmiYears(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>

                  {/* Calculations Output Column */}
                  <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-100/40 dark:bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-200 dark:border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-4">
                    <div className="text-center py-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Calculated Monthly EMI</span>
                      <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">₹{emiResult.emi.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">Total Interest</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">₹{emiResult.totalInterest.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block">Total Payment</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">₹{emiResult.totalPayable.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT 1/3 COLUMN */}
          <div className="space-y-6">
            
            {/* Quick Loan Recommendations */}
            <Card className="shadow-2xl p-5">
              <CardContent className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Loan Recommendation</h3>
                </div>

                {latestApp.approved ? (
                  <div className="space-y-4 text-xs">
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Based on your AI credit assessment, you are eligible for the following customized credit products:
                    </p>
                    
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-100/40 dark:bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-200 dark:border-slate-200 dark:border-slate-800/80 space-y-1">
                        <h4 className="font-bold text-slate-900 dark:text-white">{latestApp.loanPurpose || 'N/A'} Credit Line</h4>
                        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          <span>Max Capital:</span>
                          <span className="font-bold text-slate-900 dark:text-white">₹{(latestApp.maxLoanAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Rate (p.a.):</span>
                          <span className="font-bold text-blue-400">{latestApp.recommendedInterest}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <Link to={`/prediction/${latestApp._id || latestApp.id}`} className="block">
                      <Button className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white rounded-lg h-9 flex items-center justify-center gap-2">
                        <Download className="h-3.5 w-3.5" />
                        Download Report PDF
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center py-4">
                    <p>
                      Your credit scoring profile is currently not eligible for loan approval due to elevated risk indicators.
                    </p>
                    <p>
                      Please review your CIBIL explainable AI reasons and follow the suggested <strong>Credit Improvement Tips</strong> on your Credit Report page to optimize your parameters.
                    </p>
                    <Link to={`/prediction/${latestApp._id || latestApp.id}`} className="inline-block pt-1">
                      <Button variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs h-9 px-4 rounded-lg">
                        View Improvement Plan
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Credit Improvement Widget */}
            <Card className="shadow-2xl p-5">
              <CardContent className="space-y-3 pt-2 text-xs">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Credit Score Tips</h3>
                </div>
                <div className="space-y-3 pt-1">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <p className="text-slate-500 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">Reduce EMI</strong>: Limit new loans to bring DTI ratio under 40%.</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                    <p className="text-slate-500 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">Increase Savings</strong>: Maintaining higher account balances boosts lender trust.</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                    <p className="text-slate-500 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">Avoid Defaults</strong>: Pay outstanding cards on time, 100% of the time.</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                    <p className="text-slate-500 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">Low Card Utilization</strong>: Maintain card outstanding below 30% of limit.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      )}

    </div>
  );
};

export default Dashboard;
