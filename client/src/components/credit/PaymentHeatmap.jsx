import React from 'react';

const statusColors = {
  'On Time': 'bg-emerald-500',
  'Late 30': 'bg-yellow-500',
  'Late 60': 'bg-orange-500',
  'Late 90': 'bg-red-400',
  'Default': 'bg-red-600',
};

const PaymentHeatmap = ({ payments = [] }) => {
  // Group by month and take the worst status per month
  const monthMap = {};
  payments.forEach(p => {
    const existing = monthMap[p.month];
    const priority = ['On Time', 'Late 30', 'Late 60', 'Late 90', 'Default'];
    if (!existing || priority.indexOf(p.status) > priority.indexOf(existing.status)) {
      monthMap[p.month] = p;
    }
  });

  const months = Object.keys(monthMap).sort();

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {months.map(month => {
          const p = monthMap[month];
          const color = statusColors[p.status] || 'bg-gray-300';
          return (
            <div key={month} className="group relative">
              <div className={`w-7 h-7 rounded-md ${color} opacity-85 hover:opacity-100 transition-opacity cursor-pointer`} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {month}: {p.status}
                {p.amount && ` • ₹${p.amount.toLocaleString('en-IN')}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {Object.entries(statusColors).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHeatmap;
