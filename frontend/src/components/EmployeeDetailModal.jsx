import { useState } from 'react';

const EmployeeDetailModal = ({ employee, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('personal');
  
  if (!employee) return null;

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'leaves', label: 'Leaves', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'attendance', label: 'Attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'performance', label: 'Performance', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl rounded-xl shadow-2xl bg-primary-2/95 border border-primary-3 text-[var(--text-main)] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-strong)]">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full icon-container flex items-center justify-center text-white text-2xl font-bold">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-main)]">{employee.name}</h2>
              <p className="text-[var(--text-muted)]">{employee.position} • {employee.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-strong)] overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary-4 border-b-2 border-primary-4'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Email</label>
                <p className="text-[var(--text-main)]">{employee.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Department</label>
                <p className="text-[var(--text-main)]">{employee.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Position</label>
                <p className="text-[var(--text-main)]">{employee.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Salary</label>
                <p className="text-[var(--text-main)]">${employee.salary?.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Join Date</label>
                <p className="text-[var(--text-main)]">{new Date(employee.joinDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Employee ID</label>
                <p className="text-[var(--text-main)]">{employee._id?.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-[var(--text-muted)]">Leave history will appear here</p>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-[var(--text-muted)]">Attendance records will appear here</p>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-[var(--text-muted)]">Performance reviews will appear here</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-[var(--border-strong)]">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[var(--border-strong)] rounded-lg text-[var(--text-main)] hover:bg-primary-2/5 transition-all duration-300"
          >
            Close
          </button>
          <button
            onClick={() => onUpdate(employee)}
            className="btn-primary"
          >
            Edit Employee
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;






