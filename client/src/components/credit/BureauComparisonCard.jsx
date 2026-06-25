import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const getBureauColor = (bureau) => {
  const colors = {
    CIBIL: { bg: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-500/20', accent: 'text-blue-500' },
    Experian: { bg: 'from-purple-500/10 to-purple-600/5', border: 'border-purple-500/20', accent: 'text-purple-500' },
    Equifax: { bg: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-500/20', accent: 'text-emerald-500' },
    CRIF: { bg: 'from-orange-500/10 to-orange-600/5', border: 'border-orange-500/20', accent: 'text-orange-500' },
  };
  return colors[bureau] || colors.CIBIL;
};

const getScoreBadge = (score) => {
  if (score >= 750) return { label: 'Excellent', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' };
  if (score >= 650) return { label: 'Good', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
  if (score >= 550) return { label: 'Fair', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
  return { label: 'Poor', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
};

const BureauComparisonCard = ({ reports = [] }) => {
  if (reports.length === 0) return null;

  // Calculate average for delta display
  const avgScore = Math.round(reports.reduce((s, r) => s + r.score, 0) / reports.length);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {reports.map((report, i) => {
        const colors = getBureauColor(report.bureau);
        const badge = getScoreBadge(report.score);
        const delta = report.score - avgScore;

        return (
          <motion.div
            key={report.bureau}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className={`relative overflow-hidden rounded-xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-5 backdrop-blur-sm`}
          >
            {/* Bureau name */}
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold text-sm ${colors.accent}`}>{report.bureau}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.class}`}>
                {badge.label}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{report.score}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">/ 900</span>
            </div>

            {/* Delta from average */}
            <div className="flex items-center gap-1 mb-4">
              {delta > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : delta < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span className={`text-xs font-medium ${delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {delta > 0 ? '+' : ''}{delta} vs avg
              </span>
            </div>

            {/* Mini stats */}
            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Active Loans</span>
                <span className="font-medium text-gray-900 dark:text-gray-200">{report.activeLoans || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Accounts</span>
                <span className="font-medium text-gray-900 dark:text-gray-200">{report.totalAccounts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Overdue</span>
                <span className={`font-medium ${(report.overdueAccounts || 0) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {report.overdueAccounts || 0}
                </span>
              </div>
            </div>

            {/* Fetched date */}
            {report.fetchedAt && (
              <div className="mt-3 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <span className="text-[10px] text-gray-400">
                  Fetched: {new Date(report.fetchedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default BureauComparisonCard;
