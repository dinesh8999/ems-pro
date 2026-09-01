import { useState } from 'react';
import EmployeeDetailModal from './EmployeeDetailModal';

const EmployeeTable = ({ employees, onEdit, onDelete }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedEmployee(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(salary);
  };

  return (
    <div className="overflow-x-auto bg-primary-2/90 rounded-2xl shadow-lg border border-primary-3">
      <div className="p-6 border-b border-primary-3 flex justify-between items-center">
        <h3 className="text-3xl font-bold text-primary-5">Employee List</h3>
        <div className="flex gap-3 text-slate-500">
          <button className="p-2 rounded-lg hover:bg-secondary-3 hover:text-primary-4 transition-all duration-300" title="Filter">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 01.8 1.6l-6.4 8.53V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.87L3.2 4.6A1 1 0 013 4z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary-5/10 hover:text-secondary-5 transition-all duration-300" title="Export">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-6m3 6v-4m4 8H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary-3/10 hover:text-secondary-3 transition-all duration-300" title="Print">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
            </svg>
          </button>
        </div>
      </div>

      <table className="min-w-full divide-y divide-primary-2">
        <thead className="bg-primary-1/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Join Date</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>

        <tbody className="bg-primary-2 divide-y divide-primary-2">
          {employees.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                No employees found
              </td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr key={employee._id} className="hover:bg-secondary-3 transition-all">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-primary-5">{employee.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-primary-4">{employee.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary-3 text-primary-4">
                    {employee.department}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-4">{employee.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-5">{formatSalary(employee.salary)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-4">{formatDate(employee.joinDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onEdit(employee)}
                      className="text-slate-400 hover:text-secondary-5 p-2 rounded-lg hover:bg-secondary-5/10 transition-all"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleViewEmployee(employee)}
                      className="text-slate-400 hover:text-secondary-3 p-2 rounded-lg hover:bg-secondary-3/10 transition-all"
                      title="View"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(employee._id)}
                      className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22m-5-4v4M8 3v4" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showDetailModal && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={handleCloseModal}
          onUpdate={(emp) => {
            handleCloseModal();
            onEdit(emp);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeTable;






