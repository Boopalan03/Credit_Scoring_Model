import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const StepIndicator = ({ steps = [], currentStep = 0 }) => {
  const progressPercent = (currentStep / Math.max(1, steps.length - 1)) * 100;

  return (
    <div className="relative mb-12 pt-2">
      {/* Background line */}
      <div className="absolute top-[18px] left-[16px] right-[16px] h-[3px] rounded-full" style={{ background: 'var(--border-subtle)' }} />
      
      {/* Active gradient line */}
      <motion.div 
        className="absolute top-[18px] left-[16px] h-[3px] step-gradient-line rounded-full"
        initial={{ width: '0%' }}
        animate={{ width: `${progressPercent}%` }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ maxWidth: 'calc(100% - 32px)' }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center" style={{ width: '80px' }}>
              <motion.div
                className={`step-circle w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 ${
                  isCompleted
                    ? 'completed text-white'
                    : isActive
                    ? 'active bg-white dark:bg-gray-900 text-indigo-500'
                    : 'bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500'
                } ${!isCompleted && !isActive ? 'border-gray-300 dark:border-gray-600' : ''}`}
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 1,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </motion.div>
              
              <div className="mt-3 text-center">
                <span className={`text-xs font-semibold transition-colors duration-300 ${
                  isCompleted
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : isActive 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.label}
                </span>
                {step.status && (
                  <p className={`text-[10px] mt-1 font-semibold uppercase tracking-wider ${
                    step.status === 'Verified' ? 'text-emerald-500' :
                    step.status === 'Failed' ? 'text-red-500' :
                    'text-gray-400'
                  }`}>
                    {step.status === 'Verified' ? '✓ ' : ''}{step.status}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
