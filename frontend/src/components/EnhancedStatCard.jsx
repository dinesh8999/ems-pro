// Enhanced stat card with glassmorphism and animations
const EnhancedStatCard = ({ icon, title, value, subtitle, trend, gradient = 'from-secondary-4 to-secondary-4', delay = 0, iconBg }) => {
  const getTrendColor = () => {
    if (!trend) return '';
    return trend.startsWith('+') ? 'text-primary-4' : 'text-red-400';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.startsWith('+') ? (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div
      className="group bg-primary-2/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-primary-3 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient orb effect */}
      
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 ${iconBg || 'icon-container'} rounded-xl group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
            {typeof icon === 'string' ? (
              <span className="text-3xl drop-shadow-md">{icon}</span>
            ) : (
              <div>{icon}</div>
            )}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 font-semibold text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trend}</span>
            </div>
          )}
        </div>

        <h3 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-[0.14em]">
          {title}
        </h3>
        
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-primary-5 leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-primary-4">
              {subtitle}
            </p>
          )}
        </div>


      </div>
    </div>
  );
};

export default EnhancedStatCard;






