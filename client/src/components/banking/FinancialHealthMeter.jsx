import React from 'react';
import { motion } from 'framer-motion';

const FinancialHealthMeter = ({ score = 0, metrics = {} }) => {
  const getScoreColor = (s) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-blue-500';
    if (s >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBgColor = (s) => {
    if (s >= 80) return 'bg-emerald-500';
    if (s >= 60) return 'bg-blue-500';
    if (s >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Central Score Circle */}
      <div className="relative w-40 h-40 mb-8">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={getScoreColor(score)}
            strokeDasharray={`${2 * Math.PI * 45}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - score / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{score}</span>
          <span className="text-xs text-gray-500 font-medium">Health Score</span>
        </div>
      </div>

      {/* Component breakdown bars */}
      <div className="w-full space-y-4">
        {[
          { label: 'Savings Rate', value: metrics.savingsRate || 0, max: 40, weight: '25%' },
          { label: 'Income Stability', value: metrics.incomeStability || 0, max: 100, weight: '25%' },
          { label: 'Cash Flow Health', value: metrics.cashFlowHealth || 0, max: 100, weight: '20%' },
          { label: 'Expense Consistency', value: metrics.expenseConsistency || 0, max: 100, weight: '15%' },
        ].map((item, idx) => (
          <div key={idx} className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {item.value}{item.max === 100 ? '/100' : '%'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getBgColor(item.value > 100 ? 100 : (item.value / item.max) * 100)}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }}
                transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialHealthMeter;
