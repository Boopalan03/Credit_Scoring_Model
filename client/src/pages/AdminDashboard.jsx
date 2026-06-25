import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from 'react-toastify';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  Users, CheckCircle2, XCircle, Award, Landmark, 
  AlertTriangle, ShieldAlert, Search, Filter, RefreshCw, Eye 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAdminData = async () => {
    try {
      const statsData = await adminService.getStats();
      setStats(statsData);
      const applicantsList = await adminService.getAllApplicants();
      setApplicants(applicantsList);
    } catch (error) {
      toast.error('Failed to load administrative analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] space-y-4">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400">Loading admin portal analytics...</p>
      </div>
    );
  }

  // Filter applicants based on search & eligibility status
  const filteredApplicants = applicants.filter((app) => {
    const searchString = searchTerm.toLowerCase();
    const nameMatch = app.fullName?.toLowerCase().includes(searchString);
    const panMatch = app.panNumber?.toLowerCase().includes(searchString);
    const emailMatch = app.email?.toLowerCase().includes(searchString);
    const matchesSearch = nameMatch || panMatch || emailMatch;

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'approved') return matchesSearch && app.approved === true;
    if (statusFilter === 'rejected') return matchesSearch && app.approved === false;
    if (statusFilter === 'fraud') return matchesSearch && app.isFraudFlagged === true;
    return matchesSearch;
  });

  // Prepare Credit Score Distribution Chart Data
  const getScoreChartData = () => {
    if (!stats || !stats.charts || !stats.charts.scoreBuckets) return [];
    const b = stats.charts.scoreBuckets;
    return [
      { name: 'Excellent (751+)', count: b.excellent, color: '#16A34A' },
      { name: 'Good (651-750)', count: b.good, color: '#2563EB' },
      { name: 'Medium (501-650)', count: b.medium, color: '#EAB308' },
      { name: 'High Risk (<=500)', count: b.highRisk, color: '#DC2626' }
    ];
  };

  // Prepare Loan Purpose Chart Data
  const getPurposeChartData = () => {
    if (!stats || !stats.charts || !stats.charts.purposeCounts) return [];
    const p = stats.charts.purposeCounts;
    return Object.keys(p).map((key) => ({
      name: key,
      count: p[key],
      color: '#6366F1' // Indigo
    }));
  };

  const scoreChartData = getScoreChartData();
  const purposeChartData = getPurposeChartData();

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-800 dark:text-slate-100 pb-12">
      
      {/* Welcome & Header */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Administrative Portal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Consolidated analytics, security alerts, and credit reviews.</p>
        </div>
        
        <Button 
          onClick={fetchAdminData}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white h-9 px-4 rounded-lg flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Data
        </Button>
      </div>

      {/* Aggregate Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Applicants</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.totalApplicants}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Approved Loans</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.approved}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Rejected Loans</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.rejected}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Avg Credit Score</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.avgCreditScore} / 900</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3.5 col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">Total Capital Volume</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">₹{(stats.totalLoanAmount || 0).toLocaleString('en-IN')}</p>
            </div>
          </Card>
        </div>
      )}
      {/* Security alerts panel: Fraud Detection */}
      {stats && stats.fraudCount > 0 && (
        <Card className="border-red-200 dark:border-red-900/30 bg-gradient-to-r from-red-50/85 to-rose-100/30 dark:from-red-950/10 dark:to-slate-950/20 p-5">
          <CardContent className="space-y-4 pt-1">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <ShieldAlert className="h-5 w-5 text-red-500 animate-bounce" />
              <h3 className="text-sm font-bold text-red-800 dark:text-red-400">Security Alerts: Fraud Engine Detections</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600/20 text-red-400 rounded-full border border-red-500/25">
                {stats.fraudCount} RISK DETECTED
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40">
              <table className="min-w-full text-xs text-left text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100/80 dark:bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Applicant Name</th>
                    <th className="px-4 py-3">Monthly Income</th>
                    <th className="px-4 py-3">Requested Loan</th>
                    <th className="px-4 py-3">Fraud Reason / Flag Details</th>
                    <th className="px-4 py-3 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-900">
                  {stats.fraudAlerts.map((app) => (
                    <tr key={app._id || app.id} className="hover:bg-slate-100/30 dark:bg-slate-900/40">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{app.fullName}</td>
                      <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-bold">₹{(app.monthlyIncome || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-red-600 dark:text-red-400 font-bold">₹{(app.loanAmount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm truncate">{app.fraudReason}</td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/prediction/${app._id || app.id}`}>
                          <Button variant="ghost" className="h-7 px-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Report
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Credit Score Distribution */}
        <Card className="shadow-xl p-5">
          <CardContent className="space-y-4 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">Credit Score distribution</h3>
            
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-root)', borderColor: 'var(--border-default)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {scoreChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Loan Purpose breakdown */}
        <Card className="shadow-xl p-5">
          <CardContent className="space-y-4 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">Loan Purpose breakdown</h3>
            
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purposeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-root)', borderColor: 'var(--border-default)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Applicants Grid Table */}
      <Card className="shadow-xl p-5">
        <CardContent className="space-y-4 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Applicant Records</h3>
            
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name, PAN, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 w-64 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-1.5 text-xs bg-slate-100/80 dark:bg-slate-100/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Eligible / Approved</option>
                  <option value="rejected">Not Eligible</option>
                  <option value="fraud">Fraud Flagged</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applicants Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full text-xs text-left text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100/80 dark:bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Applicant details</th>
                  <th className="px-4 py-3.5">PAN Number</th>
                  <th className="px-4 py-3.5">Income</th>
                  <th className="px-4 py-3.5">Requested Loan</th>
                  <th className="px-4 py-3.5">Purpose</th>
                  <th className="px-4 py-3.5 text-center">Score</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Fraud</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-900">
                {filteredApplicants.length > 0 ? (
                  filteredApplicants.map((app) => (
                    <tr key={app._id || app.id} className="hover:bg-slate-100/80 dark:bg-slate-950/20">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900 dark:text-white">{app.fullName}</p>
                        <p className="text-[10px] text-slate-500">{app.email}</p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{app.panNumber}</td>
                      <td className="px-4 py-3.5 text-blue-600 dark:text-blue-400 font-semibold">₹{(app.monthlyIncome || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">₹{(app.loanAmount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{app.loanPurpose}</td>
                      <td className="px-4 py-3.5 text-center font-black text-slate-800 dark:text-slate-200">{app.creditScore}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          app.approved
                            ? 'bg-emerald-600/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-600/15 border-red-500/20 text-red-600 dark:text-red-400'
                        }`}>
                          {app.approved ? 'APPROVED' : 'REJECTED'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {app.isFraudFlagged ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-950/30 border border-red-900/40 text-red-400 animate-pulse">
                            ALERT
                          </span>
                        ) : (
                          <span className="text-slate-600 font-bold">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link to={`/prediction/${app._id || app.id}`}>
                          <Button 
                            variant="ghost" 
                            className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 border border-slate-300 dark:border-slate-700"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Report
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-slate-500 italic">
                      No applicant records matched your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};

export default AdminDashboard;
