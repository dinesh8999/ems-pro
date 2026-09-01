import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Attendance Tracking',
      description: 'Track daily check-in and check-out with secure department codes.',
      icon: (
        <svg className="w-6 h-6 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-[#0D9488]/10 text-[#0D9488]'
    },
    {
      title: 'Leave Management',
      description: 'Approve and monitor leave requests with transparent status updates.',
      icon: (
        <svg className="w-6 h-6 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: 'bg-[#D97706]/10 text-[#D97706]'
    },
    {
      title: 'Employee Directory',
      description: 'Manage workforce records with fast filters and editable profiles.',
      icon: (
        <svg className="w-6 h-6 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      iconBg: 'bg-[#2563EB]/10 text-[#2563EB]'
    },
    {
      title: 'Payroll Insights',
      description: 'View salary trends and departmental payroll distribution in one place.',
      icon: (
        <svg className="w-6 h-6 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-[#6D28D9]/10 text-[#6D28D9]'
    },
    {
      title: 'Analytics Reports',
      description: 'Generate comprehensive reports for attendance, salary, and leaves.',
      icon: (
        <svg className="w-6 h-6 text-[#0284C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconBg: 'bg-[#0284C7]/10 text-[#0284C7]'
    },
    {
      title: 'Role-based Access',
      description: 'Keep data secure with admin and employee-specific access control.',
      icon: (
        <svg className="w-6 h-6 text-[#E11D48]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      iconBg: 'bg-[#E11D48]/10 text-[#E11D48]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative overflow-hidden font-sans selection:bg-[#0D9488]/20 selection:text-[#0D9488]">
      
      {/* Background Decorator Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-70 z-0">
        <div className="absolute top-[-120px] left-[15%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#0D9488]/25 to-[#0F172A]/10 blur-3xl"></div>
        <div className="absolute top-[-60px] right-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-[#6D28D9]/20 to-[#0D9488]/15 blur-3xl"></div>
      </div>

      {/* Header Glass Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0F172A] to-[#1E293B] text-white flex items-center justify-center shadow-lg shadow-slate-900/15 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-black text-[#0F172A] tracking-tight">EMS<span className="text-[#0D9488]">.pro</span></span>
              <span className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Workforce OS</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-md shadow-slate-900/10 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Admin Signup</span>
              <svg className="w-4 h-4 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-14 text-center animate-fade-in">
          
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D9488]/10 border border-[#0D9488]/20 text-xs font-extrabold text-[#0D9488] uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse"></span>
            Workforce Operations Platform
          </p>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#0F172A] tracking-tight leading-[1.1]">
            Manage People With{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F172A] via-[#0D9488] to-[#2563EB]">
              Clarity And Speed
            </span>
          </h2>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 mt-6 leading-relaxed font-medium">
            A complete employee management system for attendance, leaves, salary analytics,
            and daily operations across admin and employee workflows.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3.5 rounded-xl bg-[#0F172A] text-white text-sm font-bold shadow-lg shadow-slate-900/15 hover:bg-[#1E293B] hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Get Started</span>
              <svg className="w-4 h-4 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <button
              onClick={() => navigate('/employee-register')}
              className="px-8 py-3.5 rounded-xl bg-white border border-slate-200/90 text-[#0F172A] text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
            >
              Employee Registration
            </button>
          </div>
        </section>

        {/* Portal Gateway Cards */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Admin Portal Card */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-900/5 p-8 transition-all hover:shadow-2xl hover:scale-[1.01] relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-[#0D9488] flex items-center justify-center shadow-lg mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">Admin Portal</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                Manage employees, approvals, analytics, and operational insights.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0F172A] text-white text-sm font-bold shadow-md shadow-slate-900/10 hover:bg-[#1E293B] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go To Admin Login</span>
                <svg className="w-4 h-4 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Employee Portal Card */}
            <div className="bg-white/90 backdrop-blur-xl border border-purple-200/80 rounded-3xl shadow-xl shadow-purple-900/5 p-8 transition-all hover:shadow-2xl hover:scale-[1.01] relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-[#6D28D9]/10 text-[#6D28D9] flex items-center justify-center shadow-lg mb-6 group-hover:scale-105 transition-transform">
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
                className="w-full py-3.5 px-6 rounded-xl bg-[#6D28D9] text-white text-sm font-bold shadow-md hover:bg-[#5B21B6] transition-all cursor-pointer"
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
                className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-7 shadow-lg shadow-slate-900/5 hover:border-[#0D9488]/40 hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-xs`}>
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
      <footer className="bg-white/80 border-t border-slate-200/80 text-slate-500 text-xs font-semibold py-8 relative z-10">
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
