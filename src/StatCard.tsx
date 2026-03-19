import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'amber';
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 border-emerald-100',
    blue: 'bg-blue-50 border-blue-100',
    amber: 'bg-amber-50 border-amber-100',
  }[color];

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-black text-zinc-900 tracking-tight">
        ₱{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}
