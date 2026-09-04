import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#0D9488]/20 selection:text-[#0D9488]">
      {/* Background Decorator Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none overflow-hidden opacity-60">
        <div className="absolute top-[-100px] left-[20%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#0D9488]/20 to-[#2563EB]/10 blur-3xl"></div>
        <div className="absolute top-[-50px] right-[20%] w-[380px] h-[380px] rounded-full bg-gradient-to-bl from-[#6D28D9]/15 to-[#D97706]/10 blur-3xl"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-900/5 w-full max-w-2xl relative z-10 animate-fade-in p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex justify-center mb-4 cursor-pointer group" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="EMS Pro Logo" className="h-20 sm:h-24 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-md" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Select Your Portal
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">Choose your account role to access your dedicated workspace</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Selector */}
          <div
            onClick={() => navigate('/admin-login')}
            className="group cursor-pointer bg-white rounded-2xl p-7 border border-slate-200 hover:border-[#0D9488] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0D9488]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0F172A] text-[#0D9488] flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] mb-2">Administrator</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">Manage workforce records, approve leaves, generate attendance codes, and review payroll analytics.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D9488] group-hover:translate-x-1 transition-transform">
              <span>Admin Login</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

          {/* Employee Selector */}
          <div
            onClick={() => navigate('/employee-login')}
            className="group cursor-pointer bg-white rounded-2xl p-7 border border-slate-200 hover:border-[#6D28D9] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#6D28D9]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#6D28D9] text-white flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] mb-2">Employee</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">Check in daily, submit leave applications, review attendance status, and update profile data.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#6D28D9] group-hover:translate-x-1 transition-transform">
              <span>Employee Login</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center pt-6 border-t border-slate-100 space-y-2">
          <p className="text-xs text-slate-600 font-medium">
            Haven't registered your employee account?{' '}
            <Link to="/employee-register" className="font-bold text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
              Employee Registration
            </Link>
          </p>
          <p className="text-xs text-slate-600 font-medium">
            Setting up a new organization?{' '}
            <Link to="/signup" className="font-bold text-[#0D9488] hover:text-[#0F766E] transition-colors">
              Create Admin Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
