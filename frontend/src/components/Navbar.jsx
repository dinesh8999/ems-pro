import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.nb-sidebar {
  position:fixed; left:0; top:0; height:100vh; z-index:40;
  display:flex; flex-direction:column;
  background: #09090B;
  transition: width 0.35s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 4px 0 24px rgba(0,0,0,0.3);
  overflow:visible;
  font-family:'Inter',sans-serif;
}
.nb-sidebar.expanded { width:240px; }
.nb-sidebar.collapsed { width:72px; }

/* Collapse toggle */
.nb-toggle {
  position:absolute; right:-14px; top:36px;
  width:28px; height:28px; border-radius:50%;
  background:#D97706; border:3px solid #18181B;
  color:#fff; display:flex; align-items:center; justify-content:center;
  cursor:pointer; z-index:50; transition:background 0.2s,transform 0.2s;
  box-shadow:0 2px 8px rgba(0,0,0,0.4);
}
.nb-toggle:hover { background:#B45309; transform:scale(1.1); }
.nb-toggle svg { transition:transform 0.35s; }
.nb-toggle.flipped svg { transform:rotate(180deg); }

/* Brand */
.nb-brand {
  display:flex; flex-direction:column; align-items:center;
  padding:28px 0 20px; cursor:pointer; gap:10px;
  transition:all 0.3s; user-select:none;
}
.nb-logo-ring {
  width:52px; height:52px; border-radius:16px;
  background:#D97706;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 14px rgba(217,119,6,0.35);
  transition:transform 0.3s,box-shadow 0.3s;
  flex-shrink:0;
}
.nb-brand:hover .nb-logo-ring { transform:scale(1.07) rotate(4deg); box-shadow:0 6px 22px rgba(217,119,6,0.5); }
.nb-brand-text { text-align:center; }
.nb-brand-name { font-size:18px; font-weight:800; color:#fff; letter-spacing:-0.3px; line-height:1.1; }
.nb-brand-tag  { font-size:10px; color:rgba(255,255,255,0.45); font-weight:500; letter-spacing:0.15em; text-transform:uppercase; }

/* Divider */
.nb-divider { height:1px; background:rgba(255,255,255,0.08); margin:0 16px 16px; }

/* Nav items */
.nb-nav { flex:1; padding:0 10px; display:flex; flex-direction:column; gap:4px; overflow-y:auto; overflow-x:hidden; }
.nb-nav::-webkit-scrollbar { width:0; }
.nb-item {
  display:flex; align-items:center; gap:12px;
  border-radius:14px; padding:11px 12px;
  cursor:pointer; transition:background 0.2s,transform 0.15s;
  color:rgba(255,255,255,0.55); font-size:14px; font-weight:600;
  position:relative; border:none; background:none; width:100%; text-align:left;
  white-space:nowrap; overflow:hidden;
}
.nb-item:hover { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.9); transform:translateX(2px); }
.nb-item.active {
  background:rgba(217,119,6,0.25);
  color:#fff;
  box-shadow:0 2px 10px rgba(217,119,6,0.2);
}
.nb-item.active::before {
  content:'';
  position:absolute; left:0; top:20%; height:60%; width:3px;
  background:#F59E0B;
  border-radius:0 3px 3px 0;
}
.nb-item-icon { width:20px; height:20px; flex-shrink:0; }
.nb-item-label { transition:opacity 0.25s,transform 0.25s; }
.collapsed .nb-item-label { opacity:0; pointer-events:none; width:0; overflow:hidden; }

/* Bottom section */
.nb-bottom { padding:12px 10px 16px; border-top:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:6px; }
.nb-profile {
  display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:14px;
  background:rgba(255,255,255,0.06); cursor:pointer;
  transition:background 0.2s; border:none; width:100%; text-align:left;
  overflow:hidden;
}
.nb-profile:hover { background:rgba(255,255,255,0.11); }
.nb-avatar {
  width:36px; height:36px; border-radius:10px; flex-shrink:0;
  background:#D97706;
  display:flex; align-items:center; justify-content:center;
  font-size:14px; font-weight:800; color:#fff;
  box-shadow:0 2px 6px rgba(217,119,6,0.3);
}
.nb-profile-info { flex:1; min-width:0; }
.nb-profile-name { font-size:13px; font-weight:700; color:#fff; truncate; display:block; }
.nb-profile-role { font-size:10px; color:rgba(255,255,255,0.45); display:block; }
.nb-logout {
  display:flex; align-items:center; gap:10px; justify-content:center;
  padding:10px 12px; border-radius:14px;
  background:rgba(239,68,68,0.12); color:rgba(239,68,68,0.85);
  cursor:pointer; transition:background 0.2s,color 0.2s;
  border:none; width:100%; font-size:13px; font-weight:700;
  overflow:hidden; white-space:nowrap;
}
.nb-logout:hover { background:rgba(239,68,68,0.25); color:#fff; }
.collapsed .nb-profile-info,
.collapsed .nb-logout-text { display:none; }
.collapsed .nb-item { justify-content:center; padding:12px; }
.collapsed .nb-profile { justify-content:center; }
.collapsed .nb-logout { justify-content:center; }
`;

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
      <style>{NAV_STYLES}</style>
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
          <div className="nb-logo-ring">
            <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          {!isCollapsed && (
            <div className="nb-brand-text">
              <div className="nb-brand-name">EMS Pro</div>
              <div className="nb-brand-tag">Employee System</div>
            </div>
          )}
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
