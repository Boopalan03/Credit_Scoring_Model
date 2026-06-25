import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const getScoreColor = (score) => {
  if (score >= 750) return { start: '#10b981', end: '#34d399', text: '#10b981', label: 'Excellent' };
  if (score >= 650) return { start: '#3b82f6', end: '#60a5fa', text: '#3b82f6', label: 'Good' };
  if (score >= 550) return { start: '#f59e0b', end: '#fbbf24', text: '#f59e0b', label: 'Fair' };
  return { start: '#ef4444', end: '#f87171', text: '#ef4444', label: 'Poor' };
};

const ScoreGauge = ({ score = 0, maxScore = 900, minScore = 300, size = 220, label = 'Credit Score' }) => {
  const [animatedScore, setAnimatedScore] = useState(minScore);
  const colors = getScoreColor(score);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const range = maxScore - minScore;
  const percentage = Math.max(0, Math.min(1, (animatedScore - minScore) / range));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Semi-circle
  const dashOffset = circumference * (1 - percentage);
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`}>
        <defs>
          <linearGradient id={`gauge-gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="65%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
          strokeLinecap="round"
        />
        
        {/* Score arc */}
        <motion.path
          d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
          fill="none"
          stroke={`url(#gauge-gradient-${score})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
        
        {/* Score text */}
        <motion.text
          x={center}
          y={center - 10}
          textAnchor="middle"
          className="font-bold fill-gray-900 dark:fill-white"
          fontSize="36"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {animatedScore}
        </motion.text>
        
        {/* Label */}
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          className="fill-gray-500 dark:fill-gray-400"
          fontSize="13"
        >
          {label}
        </text>
        
        {/* Rating badge */}
        <text
          x={center}
          y={center + 36}
          textAnchor="middle"
          fill={colors.text}
          fontSize="14"
          fontWeight="600"
        >
          {colors.label}
        </text>
        
        {/* Min/Max labels */}
        <text x={strokeWidth / 2 + 4} y={center + 20} className="fill-gray-400 dark:fill-gray-500" fontSize="11">{minScore}</text>
        <text x={size - strokeWidth / 2 - 4} y={center + 20} textAnchor="end" className="fill-gray-400 dark:fill-gray-500" fontSize="11">{maxScore}</text>
      </svg>
    </div>
  );
};

export default ScoreGauge;
