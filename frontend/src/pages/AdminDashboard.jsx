import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

/* ── Color palette ──────────────────────────────────────────────────────────── */
const DEPT_COLORS = {
  Engineering: '#dc380fff', HR: '#f25f2aff', Sales: '#349a05ff',
  Marketing: '#F59E0B', Finance: '#3B82F6', Operations: '#F97316', Other: '#8B5CF6',
};
const deptColor = (d) => DEPT_COLORS[d] || '#7C3AED';
const avatar = (n = '') => (n || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--';

/* ── Mini Calendar ───────────────────────────────────────────────────────────── */
const MiniCalendar = ({ selectedDate, onSelectDate, attendanceDays = [], leaveDays = [] }) => {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() });

  useEffect(() => {
    setCursor({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() });
  }, [selectedDate]);

  const firstDay = new Date(cursor.year, cursor.month, 1).getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();

  const prev = () => setCursor(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
  const next = () => setCursor(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const isToday = d => d === today.getDate() && cursor.month === today.getMonth() && cursor.year === today.getFullYear();
  const isSelected = d => d === selectedDate.getDate() && cursor.month === selectedDate.getMonth() && cursor.year === selectedDate.getFullYear();

  const getDateStr = (d) => `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const hasAtt = d => attendanceDays.includes(getDateStr(d));
  const hasLeave = d => leaveDays.includes(getDateStr(d));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="dc-cal">
      <div className="dc-cal-hdr">
        <button className="dc-cal-nav" onClick={prev}>&#8249;</button>
        <span className="dc-cal-mon">{MONTHS[cursor.month]} {cursor.year}</span>
        <button className="dc-cal-nav" onClick={next}>&#8250;</button>
      </div>
      <div className="dc-cal-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="dc-cal-dow">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="dc-cal-day empty" />;
          const sel = isSelected(d);
          const tdy = isToday(d);
          const att = hasAtt(d);
          const lve = hasLeave(d);

          return (
            <div
              key={i}
              onClick={() => onSelectDate(new Date(cursor.year, cursor.month, d))}
              className={`dc-cal-day${sel ? ' selected' : ''}${tdy ? ' today' : ''}${att ? ' att' : ''}${lve ? ' leave' : ''}`}
              title={`${MONTHS[cursor.month]} ${d}, ${cursor.year}${tdy ? ' (Today)' : ''}${sel ? ' (Selected)' : ''}`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Donut Chart (Interactive 3D Flip Card) ─────────────────────────────────── */
const DonutChart = ({ present, onLeave, absent, total }) => {
  const [flipped, setFlipped] = useState(false);

  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const leavePct = total > 0 ? Math.round((onLeave / total) * 100) : 0;
  const absentPct = total > 0 ? Math.round((absent / total) * 100) : 0;

  const r = 54, circ = 2 * Math.PI * r;
  const pA = (present / Math.max(total, 1)) * circ;
  const lA = (onLeave / Math.max(total, 1)) * circ;
  const aA = (absent / Math.max(total, 1)) * circ;

  return (
    <div
      className={`dc-flip-card ${flipped ? 'flipped' : ''}`}
      onClick={() => setFlipped(!flipped)}
      title="Click or hover to flip card"
    >
      <div className="dc-flip-inner">
        {/* ── FRONT SIDE: DIAGRAM ONLY ── */}
        <div className="dc-flip-front dc-pcard">
          <div className="dc-flip-top">
            <span className="dc-flip-title">Attendance Rate</span>
            <span className="dc-flip-badge">
              <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Data
            </span>
          </div>

          <div className="dc-flip-diagram-wrap">
            <svg width="170" height="170" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r={r} fill="none" stroke="#F1F5F9" strokeWidth="16" />
              <circle cx="75" cy="75" r={r} fill="none" stroke="#EF4444" strokeWidth="16"
                strokeDasharray={`${aA} ${circ - aA}`} strokeDashoffset={-pA - lA} transform="rotate(-90 75 75)" strokeLinecap="round" />
              <circle cx="75" cy="75" r={r} fill="none" stroke="#F59E0B" strokeWidth="16"
                strokeDasharray={`${lA} ${circ - lA}`} strokeDashoffset={-pA} transform="rotate(-90 75 75)" strokeLinecap="round" />
              <circle cx="75" cy="75" r={r} fill="none" stroke="#0D9488" strokeWidth="16"
                strokeDasharray={`${pA} ${circ - pA}`} strokeDashoffset="0" transform="rotate(-90 75 75)" strokeLinecap="round" />
              <text x="75" y="70" textAnchor="middle" fontSize="24" fontWeight="800" fill="#0F172A">{pct}%</text>
              <text x="75" y="88" textAnchor="middle" fontSize="11" fontWeight="600" fill="#64748B">Attendance</text>
            </svg>
          </div>

          <p className="dc-flip-hint">Tap/hover to view data breakdown ➔</p>
        </div>

        {/* ── BACK SIDE: TEXT DATA ONLY ── */}
        <div className="dc-flip-back dc-pcard">
          <div className="dc-flip-top">
            <span className="dc-flip-title">Attendance Details</span>
            <span className="dc-flip-badge active">
              <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Chart
            </span>
          </div>

          <div className="dc-flip-data-wrap">
            <div className="dc-data-item">
              <div className="dc-data-label-wrap">
                <span className="dc-dot" style={{ background: '#0D9488' }} />
                <span className="dc-data-name">Present</span>
              </div>
              <span className="dc-data-badge green">{present} <small>({pct}%)</small></span>
            </div>

            <div className="dc-data-item">
              <div className="dc-data-label-wrap">
                <span className="dc-dot" style={{ background: '#F59E0B' }} />
                <span className="dc-data-name">On Leave</span>
              </div>
              <span className="dc-data-badge amber">{onLeave} <small>({leavePct}%)</small></span>
            </div>

            <div className="dc-data-item">
              <div className="dc-data-label-wrap">
                <span className="dc-dot" style={{ background: '#EF4444' }} />
                <span className="dc-data-name">Absent</span>
              </div>
              <span className="dc-data-badge red">{absent} <small>({absentPct}%)</small></span>
            </div>

            <div className="dc-data-total">
              <span>Total Workforce</span>
              <strong>{total} Employees</strong>
            </div>
          </div>

          <p className="dc-flip-hint">Tap/hover to view chart ➔</p>
        </div>
      </div>
    </div>
  );
};

/* ── Employee Card ───────────────────────────────────────────────────────────── */
const EmpCard = ({ name, position, department, extra, accent, colBg, onClick }) => (
  <div className="dc-card" style={{ '--acc': accent, '--cbg': colBg }} onClick={onClick}>
    <div className="dc-card-row">
      <div className="dc-av" style={{ background: accent + '33', color: accent }}>{avatar(name)}</div>
      <div className="dc-ci">
        <p className="dc-cn">{name}</p>
        <p className="dc-cp">{position}</p>
      </div>
      <span className="dc-badge" style={{ background: accent + '22', color: accent }}>{department}</span>
    </div>
    {extra && <p className="dc-extra">{extra}</p>}
  </div>
);

/* ── Column ──────────────────────────────────────────────────────────────────── */
const Column = ({ title, count, accent, bg, children, onAdd, addLabel }) => (
  <div className="dc-col" style={{ '--col-bg': bg, '--col-acc': accent }}>
    <div className="dc-col-hdr">
      <div>
        <span className="dc-col-title">{title}</span>
        <span className="dc-col-cnt" style={{ background: accent + '33', color: accent }}>{count}</span>
      </div>
    </div>
    <div className="dc-col-body">{children}</div>
    {onAdd && (
      <button className="dc-col-add" onClick={onAdd} style={{ '--acc': accent }}>
        <span>+</span> {addLabel}
      </button>
    )}
  </div>
);

/* ── Stat Pill ───────────────────────────────────────────────────────────────── */
const StatPill = ({ label, value, icon, color }) => (
  <div className="dc-stat" style={{ '--sc': color }}>
    <div className="dc-stat-icon-wrap" style={{ backgroundColor: `${color}15`, color: color }}>
      {icon}
    </div>
    <div className="dc-stat-content">
      <p className="dc-stat-val">{value}</p>
      <p className="dc-stat-lbl">{label}</p>
    </div>
  </div>
);
/* ── MAIN COMPONENT ─────────────────────────────────────────────────────────── */

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const iRef = useRef(null);
  const menuRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [analytics, setAnalytics] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [todayAtt, setTodayAtt] = useState([]);
  const [recentEmps, setRecentEmps] = useState([]);
  const [onLeave, setOnLeave] = useState([]);
  const [todayCode, setTodayCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [attendanceDays, setAttendanceDays] = useState([]);
  const [leaveDays, setLeaveDays] = useState([]);
  const [selectedLeaveModal, setSelectedLeaveModal] = useState(null);

  const toYMD = (d) => {
    if (!d) return '';
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return '';
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayYMD = toYMD(new Date());
  const selectedYMD = toYMD(selectedDate);
  const isTodaySelected = selectedYMD === todayYMD;

  const fetchDashboardData = async (targetDateObj, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const targetYMD = toYMD(targetDateObj || selectedDate);

      const [aRes, attRes, cRes, lRes, allAttRes] = await Promise.all([
        api.get('/analytics'),
        api.get(`/attendance?startDate=${targetYMD}&endDate=${targetYMD}`),
        api.get('/attendance/today-code'),
        api.get('/leaves?status=Approved'),
        api.get('/attendance')
      ]);

      if (aRes.data.success) {
        setAnalytics(aRes.data.data);
        setRecentEmps(aRes.data.data.recentEmployees || []);
      }
      if (attRes.data.success) setTodayAtt(attRes.data.data || []);
      if (cRes.data.success) {
        const r = cRes.data.data;
        setTodayCode(typeof r === 'string' ? r : r?.code || null);
      }

      if (lRes.data.success) {
        const allApproved = lRes.data.data || [];
        // Filter approved leaves covering targetYMD (inclusive range check)
        const activeLeavesOnTarget = allApproved.filter(l => {
          const s = toYMD(l.startDate);
          const e = toYMD(l.endDate);
          return s && e && s <= targetYMD && targetYMD <= e;
        });
        setOnLeave(activeLeavesOnTarget);

        // Build list of dates with leaves for calendar markers
        const lDays = [];
        allApproved.forEach(l => {
          const s = new Date(l.startDate);
          const e = new Date(l.endDate);
          if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
            let curr = new Date(s);
            while (curr <= e) {
              lDays.push(toYMD(curr));
              curr.setDate(curr.getDate() + 1);
            }
          }
        });
        setLeaveDays(lDays);
      }

      if (allAttRes.data.success) {
        const allAtt = allAttRes.data.data || [];
        const attDates = allAtt.map(r => toYMD(r.date || r.checkIn)).filter(Boolean);
        setAttendanceDays(attDates);
      }

    } catch (e) {
      console.error('Error loading dashboard:', e);
      if (!silent) toast.error('Failed to load dashboard data');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedDate);
    iRef.current = setInterval(() => fetchDashboardData(selectedDate, true), 30000);
    return () => clearInterval(iRef.current);
  }, [selectedDate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectDate = (newDate) => {
    setSelectedDate(newDate);
    fetchDashboardData(newDate, false);
  };

  const copy = () => {
    if (!todayCode) return;
    navigator.clipboard.writeText(todayCode).then(() => {
      setCodeCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  const IcoRefresh = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
  const IcoUsers = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const IcoLeaf = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
  const IcoClipboard = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
  const IcoChart = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

  const menuActions = [
    { icon: IcoRefresh, label: 'Refresh Dashboard', action: () => { fetchDashboardData(selectedDate); toast.success('Dashboard refreshed!'); } },
    { icon: IcoUsers, label: 'View All Employees', action: () => navigate('/employees') },
    { icon: IcoLeaf, label: 'Manage Leaves', action: () => navigate('/leaves') },
    { icon: IcoClipboard, label: 'Attendance Records', action: () => navigate('/attendance') },
    { icon: IcoChart, label: 'View Reports', action: () => navigate('/reports') },
  ];

  const total = analytics?.overview?.totalEmployees || 0;
  const present = todayAtt.filter(r => ['Present', 'Late', 'Half-Day'].includes(r.status)).length;
  const lvCnt = onLeave.length;
  const absent = Math.max(total - present - lvCnt, 0);
  const active = recentEmps.filter(e => e.status === 'active' || !e.status);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar /><Loading />
    </div>
  );

  return (
    <div className="dc-root">
      <Navbar />
      <div className="dc-wrap">

        {/* ── Top bar ── */}
        <div className="dc-topbar">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="dc-title">EMS Dashboard</h1>
              {!isTodaySelected && (
                <button
                  onClick={() => handleSelectDate(new Date())}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  title="Return to Today"
                >
                  <span>← Back to Today</span>
                </button>
              )}
            </div>
            <p className="dc-subtitle">
              {isTodaySelected ? (
                `Today · ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              ) : (
                `Viewing Overview for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              )}
            </p>
          </div>
          <div className="dc-topbar-right">
            <button className="dc-add-btn" onClick={() => navigate('/employees')}>+ Add Employee</button>
            <div className="dc-menu-wrap" ref={menuRef}>
              <button className={`dc-dots${showMenu ? ' active' : ''}`} onClick={() => setShowMenu(v => !v)} title="Quick Actions">•••</button>
              {showMenu && (
                <div className="dc-dropdown">
                  <p className="dc-dropdown-title">Quick Actions</p>
                  {menuActions.map((item, i) => (
                    <button key={i} className="dc-dropdown-item" onClick={() => { item.action(); setShowMenu(false); }}>
                      <span className="dc-dropdown-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Attendance Code Banner ── */}
        <div className={`dc-code-banner${todayCode ? ' active' : ''}`}>
          <div className="dc-code-banner-left">
            <div className="dc-code-banner-icon">
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, color: '#D97706' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <div>
              <p className="dc-code-banner-label">Today's Attendance Code</p>
              <p className="dc-code-banner-sub">Share this code with employees for check-in</p>
            </div>
          </div>
          <div className="dc-code-banner-right">
            <span className="dc-code-banner-val">{todayCode || 'Not Generated Yet'}</span>
            {todayCode && (
              <button className="dc-code-banner-copy" onClick={copy}>
                {codeCopied ? '✓ Copied!' : 'Copy Code'}
              </button>
            )}
          </div>
        </div>

        {/* ── Stat pills row ── */}
        <div className="dc-stats-row">
          <StatPill label="Total Workforce" value={total} color="#18181B" icon={<svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
          <StatPill label={isTodaySelected ? "Present Today" : "Present"} value={present} color="#0D9488" icon={<svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatPill label={isTodaySelected ? "On Leave Today" : "On Leave"} value={lvCnt} color="#D97706" icon={<svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
          <StatPill label={isTodaySelected ? "Absent Today" : "Absent"} value={absent} color="#EF4444" icon={<svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>

        {/* ── Main ── */}
        <div className="dc-main">
          <div className="dc-cols">

            {/* Col 1 */}
            <Column title="Active Employees" count={active.length || total} accent="#18181B"
              onAdd={() => navigate('/employees')} addLabel="Add Employee">
              {(active.length > 0 ? active : []).slice(0, 6).map(e => (
                <EmpCard key={e._id} name={e.name} position={e.position} department={e.department}
                  extra={`Joined ${fmtDate(e.joinDate || e.createdAt)}`} accent={deptColor(e.department)}
                  onClick={() => navigate('/employees')} />
              ))}
              {active.length === 0 && <div className="dc-empty">No active employees found.</div>}
            </Column>

            {/* Col 2 */}
            <Column title={isTodaySelected ? "On Leave" : `On Leave (${fmtDate(selectedDate)})`} count={lvCnt} accent="#D97706"
              onAdd={() => navigate('/leaves')} addLabel="Manage Leaves">
              {onLeave.slice(0, 6).map(l => (
                <EmpCard key={l._id} name={l.employee?.name || 'Unknown'} position={l.leaveType}
                  department={l.employee?.department || '—'}
                  extra={`${fmtDate(l.startDate)} → ${fmtDate(l.endDate)}`} accent="#D97706"
                  onClick={() => setSelectedLeaveModal(l)} />
              ))}
              {lvCnt === 0 && <div className="dc-empty">No employees on leave on this date.</div>}
            </Column>

            {/* Col 3 */}
            <Column title={isTodaySelected ? "Checked In Today" : `Checked In (${fmtDate(selectedDate)})`} count={todayAtt.length} accent="#10B981"
              onAdd={() => navigate('/attendance')} addLabel="View All">
              {todayAtt.slice(0, 6).map(r => (
                <EmpCard key={r._id} name={r.employee?.name || 'Unknown'} position={r.employee?.position || '—'}
                  department={r.status}
                  extra={`In: ${fmtTime(r.checkIn)}${r.checkOut ? '  ·  Out: ' + fmtTime(r.checkOut) : ''}`}
                  accent={r.status === 'Present' ? '#10B981' : r.status === 'Late' ? '#F59E0B' : '#EF4444'}
                  onClick={() => navigate('/attendance')} />
              ))}
              {todayAtt.length === 0 && <div className="dc-empty">No check-ins recorded on this date.</div>}
            </Column>

          </div>

          {/* ── Right panel ── */}
          <div className="dc-panel">

            {/* 3D Flip Donut Chart Card */}
            <DonutChart present={present} onLeave={lvCnt} absent={absent} total={total || 1} />

            {/* Departments */}
            <div className="dc-pcard">
              <p className="dc-pcard-lbl">Departments</p>
              {(analytics?.employeesByDepartment || []).slice(0, 6).map(d => (
                <div key={d.department} className="dc-dept-row">
                  <span className="dc-dept-dot" style={{ background: deptColor(d.department) }} />
                  <span className="dc-dept-nm">{d.department}</span>
                  <span className="dc-dept-cnt">{d.count}</span>
                </div>
              ))}
            </div>

            {/* Interactive Calendar */}
            <div className="dc-pcard">
              <p className="dc-pcard-lbl" style={{ marginBottom: 8 }}>Calendar Explorer</p>
              <MiniCalendar
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                attendanceDays={attendanceDays}
                leaveDays={leaveDays}
              />
            </div>

          </div>
        </div>
      </div>

      {/* ── Leave Request Details Modal Pop-up ── */}
      {selectedLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-all text-slate-800">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <div>
                <h3 className="text-xl font-bold text-[#1E1147]">Leave Request Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Submitted by {selectedLeaveModal.employee?.name || 'Employee'}</p>
              </div>
              <button
                onClick={() => setSelectedLeaveModal(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors text-2xl font-bold px-2 py-0.5 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Employee</p>
                  <p className="font-bold text-[#1E1147] text-base mt-0.5">{selectedLeaveModal.employee?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Department</p>
                  <p className="font-medium text-slate-600 mt-0.5">{selectedLeaveModal.employee?.department || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Leave Type</p>
                  <p className="font-bold text-[#1E1147] mt-0.5">{selectedLeaveModal.leaveType}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Duration</p>
                  <p className="font-bold text-[#1E1147] mt-0.5">{selectedLeaveModal.duration} day(s)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Start Date</p>
                  <p className="font-medium text-slate-600 mt-0.5">
                    {selectedLeaveModal.startDate && !isNaN(new Date(selectedLeaveModal.startDate).getTime())
                      ? new Date(selectedLeaveModal.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">End Date</p>
                  <p className="font-medium text-slate-600 mt-0.5">
                    {selectedLeaveModal.endDate && !isNaN(new Date(selectedLeaveModal.endDate).getTime())
                      ? new Date(selectedLeaveModal.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '-'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Reason</p>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-sm leading-relaxed max-h-32 overflow-y-auto">
                  {selectedLeaveModal.reason || 'No reason provided.'}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Current Status:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${selectedLeaveModal.status === 'Approved'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : selectedLeaveModal.status === 'Rejected'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {selectedLeaveModal.status || 'Approved'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
