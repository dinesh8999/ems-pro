import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fillDemoCredentials = () => {
    setFormData({
      email: 'chetan@ems.com',
      password: 'password123'
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim().toLowerCase().endsWith('@ems.com')) {
      setError('Email address must end with @ems.com (e.g. user@ems.com)');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { ...formData, role: 'employee' });

      if (response.data.success) {
        const userData = response.data.user || response.data.admin;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('admin', JSON.stringify(userData));
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#6D28D9]/20 selection:text-[#6D28D9]">
      {/* Background Decorator Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none overflow-hidden opacity-60">
        <div className="absolute top-[-100px] left-[20%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#6D28D9]/20 to-[#D97706]/10 blur-3xl"></div>
        <div className="absolute top-[-50px] right-[20%] w-[350px] h-[350px] rounded-full bg-gradient-to-bl from-[#0D9488]/15 to-[#6D28D9]/10 blur-3xl"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-900/5 w-full max-w-md relative z-10 animate-fade-in p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6D28D9] to-[#5B21B6] text-white flex items-center justify-center shadow-lg shadow-[#6D28D9]/20 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Employee Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Personal workforce workspace & daily check-ins</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-slate-600 mb-2">Work Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#0F172A] text-sm font-medium focus:bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/10 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="user@ems.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-600">Password</label>
              <Link to="#" className="text-xs text-[#6D28D9] hover:text-[#5B21B6] font-semibold transition-colors">Forgot Password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#0F172A] text-sm font-medium focus:bg-white focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/10 focus:outline-none transition-all pr-11 placeholder:text-slate-400"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-shake flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#6D28D9] text-white text-sm font-bold shadow-md shadow-[#6D28D9]/20 hover:bg-[#5B21B6] hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In to Employee Workspace</span>
                <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Demo Fill Chip */}
        <div className="mt-6 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-700">Demo Employee Account</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">chetan@ems.com / password123</p>
          </div>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all shadow-xs cursor-pointer"
          >
            Auto Fill
          </button>
        </div>

        {/* Navigation Links */}
        <div className="mt-6 text-center pt-5 border-t border-slate-100 space-y-2">
          <p className="text-xs text-slate-600 font-medium">
            Haven't registered your employee account yet?{' '}
            <Link to="/employee-register" className="font-bold text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
              Complete Registration
            </Link>
          </p>
          <p className="text-xs text-slate-600 font-medium">
            Are you an administrator?{' '}
            <Link to="/admin-login" className="font-bold text-slate-900 hover:text-[#0D9488] transition-colors">
              Admin Portal Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;
