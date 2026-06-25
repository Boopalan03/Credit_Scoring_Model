import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

const riskConfig = {
  Low: {
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    pulse: 'bg-emerald-400',
    label: 'Low Risk',
    description: 'Strong financial profile with minimal risk indicators.',
  },
  Medium: {
    icon: ShieldAlert,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    pulse: 'bg-amber-400',
    label: 'Medium Risk',
    description: 'Moderate risk factors detected. Some areas need improvement.',
  },
  High: {
    icon: ShieldX,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    pulse: 'bg-red-400',
    label: 'High Risk',
    description: 'Significant risk factors present. Careful evaluation needed.',
  },
};

const RiskIndicator = ({ category = 'Medium', score = 50, showDetails = true }) => {
  const config = riskConfig[category] || riskConfig.Medium;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-xl border ${config.border} ${config.bg} p-5`}
    >
      <div className="flex items-center gap-4">
        {/* Pulsing icon */}
        <div className="relative">
          <div className={`absolute inset-0 ${config.pulse} rounded-full animate-ping opacity-20`} />
          <div className={`relative ${config.bg} p-3 rounded-full`}>
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className={`font-bold text-lg ${config.color}`}>{config.label}</h3>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}/100</span>
          </div>
          {showDetails && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{config.description}</p>
          )}
        </div>
      </div>

      {/* Risk score bar */}
      <div className="mt-4">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              category === 'Low' ? 'bg-emerald-500' :
              category === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>High Risk</span>
          <span>Low Risk</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RiskIndicator;
