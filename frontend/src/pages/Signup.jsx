import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim().toLowerCase().endsWith('@ems.com')) {
      return setError('Email address must end with @ems.com (e.g. user@ems.com)');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/signup', {
        username: formData.name,
        email: formData.email,
        password: formData.password
      });
      if (response.data.success) {
        navigate('/login');
      }
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      const validationError = err.response?.data?.errors?.[0]?.message;
      setError(apiMessage || validationError || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-theme-bg flex items-center justify-center p-4 relative overflow-hidden">
      
      

      <div className="bg-primary-2/90 backdrop-blur-xl border border-primary-3 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-5">
            <div className="icon-container p-4 rounded-2xl shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3M7 7h10M7 11h6m-6 4h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl leading-tight font-bold text-primary-5 w-fit mx-auto pb-2">
            Create Account
          </h1>
          <p className="text-primary-4 mt-2">Set up your admin access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-0 rounded-lg shadow-none hover:shadow-[0_8px_16px_rgba(106,74,50,0.25)] focus:ring-0 focus:outline-none focus:shadow-[0_8px_16px_rgba(106,74,50,0.25)] bg-primary-2 text-primary-5"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-0 rounded-lg shadow-none hover:shadow-[0_8px_16px_rgba(106,74,50,0.25)] focus:ring-0 focus:outline-none focus:shadow-[0_8px_16px_rgba(106,74,50,0.25)] bg-primary-2 text-primary-5"
              placeholder="admin@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-0 rounded-lg shadow-none hover:shadow-[0_8px_16px_rgba(106,74,50,0.25)] focus:ring-0 focus:outline-none focus:shadow-[0_8px_16px_rgba(106,74,50,0.25)] bg-primary-2 text-primary-5 transition-all pr-12"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-4 hover:text-primary-5 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-0 rounded-lg shadow-none hover:shadow-[0_8px_16px_rgba(106,74,50,0.25)] focus:ring-0 focus:outline-none focus:shadow-[0_8px_16px_rgba(106,74,50,0.25)] bg-primary-2 text-primary-5 transition-all pr-12"
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-4 hover:text-primary-5 transition-colors focus:outline-none"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center font-semibold"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-5 border-t border-primary-3">
          <p className="text-sm text-primary-4">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-4 hover:text-primary-3 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
