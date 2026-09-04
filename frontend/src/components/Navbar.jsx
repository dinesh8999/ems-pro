import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const isEmployee = user.role === 'employee';
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    document.body.style.paddingLeft = isCollapsed ? '72px' : '240px';
    document.body.style.transition = 'padding-left 0.35s cubic-bezier(0.4,0,0.2,1)';
    return () => { document.body.style.paddingLeft = '0px'; };
  }, [isCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: (
      <svg className="nb-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    )},
    { label: 'Employees', path: '/employees', hidden: isEmployee, icon: (
      <svg className="nb-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    )},
    { label: 'Leaves', path: '/leaves', icon: (
      <svg className="nb-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
    )},
    { label: 'Attendance', path: '/attendance', icon: (
      <svg className="nb-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
    )},
    { label: 'Reports', path: '/reports', hidden: isEmployee, icon: (
      <svg className="nb-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
    )},
    { label: 'Profile', path: '/profile', icon: (
      <svg className="nb-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
    )},
  ].filter(item => !item.hidden);

  const nameForInitials = user.name || user.username || user.email || 'User';
  const initials = nameForInitials.charAt(0).toUpperCase();

  return (
    <>
      <aside className={`nb-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`nb-toggle ${isCollapsed ? 'flipped' : ''}`}
          title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Brand Header */}
        <div className="nb-brand" onClick={() => navigate('/dashboard')}>
          <div className={`bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center transition-all hover:scale-105 ${isCollapsed ? 'w-12 h-12 p-1.5' : 'w-25 h-20 p-2'}`}>
            <img src="/logo.png" alt="EMS Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="nb-divider" />

        {/* Nav */}
        <nav className="nb-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : ''}
              className={`nb-item${isActive(item.path) ? ' active' : ''}`}
            >
              {item.icon}
              <span className="nb-item-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="nb-bottom">
          <button className="nb-profile" onClick={() => navigate('/profile')} title={isCollapsed ? 'Profile' : ''}>
            <div className="nb-avatar flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                initials
              )}
            </div>
            <div className="nb-profile-info">
              <span className="nb-profile-name">{user.name || user.email?.split('@')[0] || 'User'}</span>
              <span className="nb-profile-role">{isEmployee ? 'Employee' : 'Administrator'}</span>
            </div>
          </button>
          <button className="nb-logout" onClick={handleLogout} title={isCollapsed ? 'Logout' : ''}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{flexShrink:0}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span className="nb-logout-text">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
