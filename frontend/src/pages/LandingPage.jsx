import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [timeTheme, setTimeTheme] = useState({
    period: 'Afternoon',
    greeting: 'Good Afternoon',
    icon: '☀️',
    accentColor: '#0D9488',
    themeBadge: 'Midday Edition · Active Shift Management'
  });

  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setTimeTheme({
          period: 'Morning',
          greeting: 'Good Morning',
          icon: '🌅',
          accentColor: '#D97706',
          themeBadge: 'Sunrise Edition · Morning Operational Focus'
        });
      } else if (hour >= 12 && hour < 17) {
        setTimeTheme({
          period: 'Afternoon',
          greeting: 'Good Afternoon',
          icon: '☀️',
          accentColor: '#0D9488',
          themeBadge: 'Midday Edition · Active Shift Management'
        });
      } else if (hour >= 17 && hour < 21) {
        setTimeTheme({
          period: 'Evening',
          greeting: 'Good Evening',
          icon: '🌇',
          accentColor: '#7C3AED',
          themeBadge: 'Twilight Edition · End-of-Day EOD Sync'
        });
      } else {
        setTimeTheme({
          period: 'Night',
          greeting: 'Good Night',
          icon: '🌙',
          accentColor: '#2563EB',
          themeBadge: 'Night Edition · Off-Shift Security'
        });
      }
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: 'Attendance Tracking',
      description: 'Track daily check-in and check-out with secure department codes.',
      icon: (
        <svg className="w-6 h-6" style={{ color: timeTheme.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Leave Management',
      description: 'Approve and monitor leave requests with transparent status updates.',
      icon: (
        <svg className="w-6 h-6" style={{ color: timeTheme.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Employee Directory',
      description: 'Manage workforce records with fast filters and editable profiles.',
      icon: (
        <svg className="w-6 h-6" style={{ color: timeTheme.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      title: 'Payroll Insights',
      description: 'View salary trends and departmental payroll distribution in one place.',
      icon: (
        <svg className="w-6 h-6" style={{ color: timeTheme.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Analytics Reports',
      description: 'Generate comprehensive reports for attendance, salary, and leaves.',
      icon: (
        <svg className="w-6 h-6" style={{ color: timeTheme.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: 'Role-based Access',
      description: 'Keep data secure with admin and employee-specific access control.',
      icon: (
        <svg className="w-6 h-6" style={{ color: timeTheme.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative overflow-hidden font-sans">
      
      {/* Header Solid Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="EMS Pro Logo" className="h-11 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105" />
            <div>
              <span className="text-xl font-black text-[#0F172A] tracking-tight">EMS<span style={{ color: timeTheme.accentColor }}>.pro</span></span>
              <span className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Workforce OS</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Admin Signup</span>
              <svg className="w-4 h-4" style={{ color: timeTheme.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 md:pt-20 pb-14 text-center">
          
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-wider mb-6 shadow-xs"
            style={{ backgroundColor: `${timeTheme.accentColor}12`, borderColor: `${timeTheme.accentColor}35`, color: timeTheme.accentColor }}
          >
            <span>{timeTheme.icon}</span>
            <span>{timeTheme.greeting} · {timeTheme.themeBadge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#0F172A] tracking-tight leading-[1.1]">
            Manage People With{' '}
            <span style={{ color: timeTheme.accentColor }}>
              Clarity And Speed
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 mt-6 leading-relaxed font-medium">
            A complete employee management system for attendance, leaves, salary analytics,
            and daily operations across admin and employee workflows.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3.5 rounded-xl bg-[#0F172A] text-white text-sm font-bold shadow-md hover:bg-[#1E293B] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Get Started</span>
              <svg className="w-4 h-4" style={{ color: timeTheme.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <button
              onClick={() => navigate('/employee-register')}
              className="px-8 py-3.5 rounded-xl bg-white border border-slate-300 text-[#0F172A] text-sm font-bold shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Employee Registration
            </button>
          </div>
        </section>

        {/* Portal Gateway Cards */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Admin Portal Card */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-8 transition-all hover:border-slate-300 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-md mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" style={{ color: timeTheme.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">Admin Portal</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                Manage employees, approvals, analytics, and operational insights.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0F172A] text-white text-sm font-bold shadow-md hover:bg-[#1E293B] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go To Admin Login</span>
                <svg className="w-4 h-4" style={{ color: timeTheme.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Employee Portal Card */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-8 transition-all hover:border-slate-300 relative overflow-hidden group">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mb-6 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: `${timeTheme.accentColor}15`, color: timeTheme.accentColor }}
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">Employee Portal</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                Register with your work email and manage attendance plus leave requests.
              </p>
              <button
                onClick={() => navigate('/employee-register')}
                className="w-full py-3.5 px-6 rounded-xl text-white text-sm font-bold shadow-md transition-all cursor-pointer"
                style={{ backgroundColor: timeTheme.accentColor }}
              >
                Complete Registration
              </button>
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">Everything You Need</h3>
            <p className="text-slate-500 text-sm sm:text-base mt-2 font-medium">Purpose-built tools for daily workforce operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-200 rounded-2xl p-7 shadow-md hover:border-slate-300 transition-all duration-200 group"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: `${timeTheme.accentColor}12` }}
                >
                  {feature.icon}
                </div>
                <h4 className="text-lg font-extrabold text-[#0F172A] mb-2">{feature.title}</h4>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs font-semibold py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#0F172A]">EMS.pro</span>
            <span>&copy; 2026 Workforce Operations System. All rights reserved.</span>
          </div>
          <p className="text-slate-400 font-medium">Designed for modern HR and operations teams.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
