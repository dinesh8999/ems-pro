// Loading skeleton component for better UX
const LoadingSkeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="icon-container rounded bg-[length:200%_100%] animate-shimmer"></div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-primary-2 rounded-2xl p-6 shadow-lg">
      <LoadingSkeleton className="h-4 w-24 mb-3" />
      <LoadingSkeleton className="h-8 w-32 mb-2" />
      <LoadingSkeleton className="h-3 w-20" />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-primary-2 rounded-2xl p-6 shadow-lg">
      <LoadingSkeleton className="h-8 w-48 mb-6" />
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <LoadingSkeleton className="h-12 flex-1" />
            <LoadingSkeleton className="h-12 w-32" />
            <LoadingSkeleton className="h-12 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-primary-2 rounded-2xl p-6 shadow-lg">
      <LoadingSkeleton className="h-6 w-40 mb-6" />
      <div className="flex items-end gap-2 h-64">
        {[...Array(7)].map((_, i) => (
          <LoadingSkeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${Math.random() * 100 + 50}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;

