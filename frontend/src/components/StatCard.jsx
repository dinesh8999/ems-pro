import React, { useState } from 'react';

const StatCard = ({ label, value, subValue, icon, color, trend }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="p-6 bg-primary-2/90 backdrop-blur-xl border border-primary-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 bg-gradient-to-br ${color} rounded-xl text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          trend.startsWith('+') ? 'bg-secondary-4/10 text-secondary-4' : 'bg-secondary-3/10 text-secondary-3'
        }`}>
          {trend}
        </div>
      </div>
      <div>
        <p className="text-slate-500 font-semibold text-xs uppercase tracking-[0.14em] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-bold text-primary-5">{value}</p>
          {subValue && <p className="text-slate-500 font-medium">{subValue}</p>}
        </div>
      </div>
      
      <div className="mt-6 h-2 rounded-full overflow-hidden bg-primary-1">
        <div 
          className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
          style={{ width: isHovered ? '100%' : '15%' }}
        ></div>
      </div>
    </div>
  );
};

export default StatCard;