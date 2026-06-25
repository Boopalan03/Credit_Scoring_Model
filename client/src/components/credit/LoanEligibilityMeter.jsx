import React from 'react';
import { motion } from 'framer-motion';

const LoanEligibilityMeter = ({ maxAmount = 0, suggestedRate = 0, tenure = 0, repaymentCapacity = 0, recommendation = '' }) => {
  const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;
  
  const recColors = {
    'Strong Approve': 'bg-emerald-500 text-white',
    'Approve': 'bg-green-500 text-white',
    'Conditional Approve': 'bg-yellow-500 text-gray-900',
    'Review Required': 'bg-orange-500 text-white',
    'Decline': 'bg-red-500 text-white',
  };

  // Scale for the meter (max 1 crore)
  const maxMeter = 10000000;
  const percentage = Math.min(100, (maxAmount / maxMeter) * 100);

  return (
    <div className="space-y-5">
      {/* Recommendation badge */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Loan Eligibility</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${recColors[recommendation] || 'bg-gray-500 text-white'}`}>
          {recommendation}
        </span>
      </div>

      {/* Max amount display */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Maximum Eligible Amount</p>
        <motion.p
          className="text-4xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {formatCurrency(maxAmount)}
        </motion.p>
      </div>

      {/* Meter bar */}
      <div>
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          {/* Markers */}
          {[25, 50, 75].map(pct => (
            <div key={pct} className="absolute top-0 bottom-0 w-px bg-white/30" style={{ left: `${pct}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>₹0</span>
          <span>₹25L</span>
          <span>₹50L</span>
          <span>₹75L</span>
          <span>₹1Cr</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Interest Rate</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{suggestedRate}%</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Max Tenure</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{tenure}m</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">EMI Capacity</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(repaymentCapacity)}</p>
        </div>
      </div>
    </div>
  );
};

export default LoanEligibilityMeter;
