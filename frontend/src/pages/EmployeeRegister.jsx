import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const EmployeeRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.name) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.email.trim().toLowerCase().endsWith('@ems.com')) {
      setError('Email address must end with @ems.com (e.g. user@ems.com)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/employee-register', {
        email: formData.email,
        password: formData.password,
        name: formData.name
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.user));
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert('Registration completed successfully. Welcome to EMS.');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-theme-bg flex items-center justify-center p-4 relative overflow-hidden">
      
      

      <div className="bg-primary-2/95 border border-primary-3 rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 relative z-10 animate-fade-in">
        <div className="text-center mb-7">
          <div className="inline-flex justify-center mb-4 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-16 h-16 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg border border-slate-200 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="EMS Pro Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl leading-tight font-bold text-primary-5 w-fit mx-auto pb-2">
            Employee Registration
          </h2>
          <p className="text-primary-4 mt-2">Complete your profile to get started</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-5 rounded-lg animate-shake text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-primary-3 bg-primary-2/90 text-primary-5 rounded-lg focus:ring-2 focus:ring-primary-4"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">
              Work Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-primary-3 bg-primary-2/90 text-primary-5 rounded-lg focus:ring-2 focus:ring-primary-4"
              placeholder="your.email@company.com"
              required
            />
            <p className="text-xs text-primary-4 mt-1">Use the email provided by your administrator</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-10 border border-primary-3 bg-primary-2/90 text-primary-5 rounded-lg focus:ring-2 focus:ring-primary-4"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 0110.122 3.937M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-10 border border-primary-3 bg-primary-2/90 text-primary-5 rounded-lg focus:ring-2 focus:ring-primary-4"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 0110.122 3.937M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-primary-4 text-sm">
            Already registered?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary-4 hover:text-primary-3 font-semibold transition-colors duration-300"
            >
              Login here
            </button>
          </p>
        </div>

        <div className="mt-6 p-4 bg-primary-1 border border-primary-3 rounded-xl">
          <p className="text-sm text-primary-4 font-semibold mb-1">Important</p>
          <p className="text-xs text-primary-4/85">
            You must use the email address that was added by your administrator.
            If your email is not on file, please contact HR.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegister;
