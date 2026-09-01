// Modern animated table component with glassmorphism
const AnimatedTable = ({ columns, data, loading = false, onRowClick, emptyMessage = "No data available" }) => {
  if (loading) {
    return (
      <div className="bg-primary-2/85 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-primary-3">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 icon-container /60 via-secondary-6/60 to-secondary-7/60 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-primary-2/85 backdrop-blur-xl rounded-2xl p-12 shadow-xl border border-primary-3 text-center">
        <div className="flex justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-primary-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-primary-4 text-lg font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-primary-2/85 backdrop-blur-xl rounded-2xl shadow-xl border border-primary-3 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="icon-container /10 via-secondary-5/10 to-secondary-3/30/20 backdrop-blur-sm">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-bold text-primary-4/85 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-2/35">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  transition-all duration-300 
                  hover:bg-gradient-to-r hover:from-secondary-6/5 hover:via-secondary-5/5 hover:to-secondary-3/30/20
                  hover:shadow-md hover:scale-[1.01] hover:z-10
                  ${onRowClick ? 'cursor-pointer' : ''}
                  animate-fade-in
                `}
                style={{ animationDelay: `${rowIndex * 50}ms` }}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-primary-5"
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnimatedTable;





