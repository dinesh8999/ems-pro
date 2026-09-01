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

/* ── Donut Chart ─────────────────────────────────────────────────────────────── */
const DonutChart = ({ present, onLeave, absent, total }) => {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const r = 54, circ = 2 * Math.PI * r;
  const pA = (present / Math.max(total, 1)) * circ;
  const lA = (onLeave / Math.max(total, 1)) * circ;
  const aA = (absent / Math.max(total, 1)) * circ;
  return (
    <div className="dc-donut">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" />
        <circle cx="75" cy="75" r={r} fill="none" stroke="#EF4444" strokeWidth="16"
          strokeDasharray={`${aA} ${circ - aA}`} strokeDashoffset={-pA - lA} transform="rotate(-90 75 75)" strokeLinecap="round" />
        <circle cx="75" cy="75" r={r} fill="none" stroke="#F59E0B" strokeWidth="16"
          strokeDasharray={`${lA} ${circ - lA}`} strokeDashoffset={-pA} transform="rotate(-90 75 75)" strokeLinecap="round" />
        <circle cx="75" cy="75" r={r} fill="none" stroke="#7C3AED" strokeWidth="16"
          strokeDasharray={`${pA} ${circ - pA}`} strokeDashoffset="0" transform="rotate(-90 75 75)" strokeLinecap="round" />
        <text x="75" y="70" textAnchor="middle" fontSize="24" fontWeight="800" fill="#fff">{pct}%</text>
        <text x="75" y="88" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)">Attendance</text>
      </svg>
      <div className="dc-donut-leg">
        <div className="dc-leg-row"><span className="dc-dot" style={{ background: '#7C3AED' }} /><span>{present} Present</span></div>
        <div className="dc-leg-row"><span className="dc-dot" style={{ background: '#F59E0B' }} /><span>{onLeave} On Leave</span></div>
        <div className="dc-leg-row"><span className="dc-dot" style={{ background: '#EF4444' }} /><span>{absent} Absent</span></div>
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
    <span className="dc-stat-icon" style={{ color }}>{icon}</span>
    <div>
      <p className="dc-stat-val">{value}</p>
      <p className="dc-stat-lbl">{label}</p>
    </div>
  </div>
);

/* ── STYLES ──────────────────────────────────────────────────────────────────── */
const DASH_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* Root */
.dc-root {
  min-height:100vh;
  background:#F8FAFC;
  font-family:'Inter',sans-serif;
}
.dc-wrap {
  padding:28px 32px 32px;
  max-width:1680px;
  margin:0 auto;
  display:flex; flex-direction:column; gap:22px;
}

/* ── Top Bar ── */
.dc-topbar {
  display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:14px;
  animation:dcFade 0.4s ease;
}
.dc-title { font-size:28px; font-weight:800; color:#0F172A; letter-spacing:-0.6px; margin:0; }
.dc-subtitle { font-size:13px; color:#64748B; margin:2px 0 0; }
.dc-topbar-right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

/* Code chip */
.dc-code-chip {
  display:flex; align-items:center; gap:10px;
  background:#fff; border:1px solid #E2E8F0; border-radius:14px; padding:8px 14px;
  box-shadow:0 2px 8px rgba(15,23,42,0.06);
}
.dc-code-lbl { font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:#64748B; font-weight:700; }
.dc-code-val { font-size:16px; font-weight:800; font-family:monospace; color:#0F172A; letter-spacing:0.05em; }
.dc-code-copy {
  background:#18181B; color:#fff; border:none;
  border-radius:8px; padding:5px 11px; font-size:14px; font-weight:700; cursor:pointer;
  transition:background 0.15s, transform 0.15s;
  box-shadow:0 1px 4px rgba(24,24,27,0.2);
}
.dc-code-copy:hover { background:#27272A; transform:scale(1.04); }

/* Add Employee btn */
.dc-add-btn {
  background:#18181B;
  color:#fff; border:none; cursor:pointer; border-radius:12px;
  padding:11px 22px; font-size:14px; font-weight:700;
  box-shadow:0 2px 8px rgba(24,24,27,0.25);
  transition:background 0.2s, transform 0.15s, box-shadow 0.2s;
}
.dc-add-btn:hover { background:#27272A; transform:translateY(-1px); box-shadow:0 4px 14px rgba(24,24,27,0.35); }
.dc-dots {
  background:#fff; border:1px solid #E4E4E7; color:#71717A;
  border-radius:12px; padding:10px 14px; font-size:18px; cursor:pointer;
  transition:background 0.2s; letter-spacing:2px; line-height:1;
}
.dc-dots:hover { background:#F4F4F5; color:#18181B; }

/* ── Stat pills row ── */
.dc-stats-row {
  display:grid; grid-template-columns:repeat(4,1fr); gap:14px;
  animation:dcFade 0.45s ease 0.05s both;
}
.dc-stat {
  background:#fff; border-radius:16px; padding:14px 16px;
  display:flex; align-items:center; gap:12px;
  border:1px solid #E4E4E7; box-shadow:0 2px 8px rgba(24,24,27,0.04);
  border-left:4px solid var(--sc,#18181B);
  transition:transform 0.2s,box-shadow 0.2s;
}
.dc-stat:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(15,23,42,0.08); }
.dc-stat-icon { font-size:26px; }
.dc-stat-val { font-size:22px; font-weight:800; color:#0F172A; line-height:1; }
.dc-stat-lbl { font-size:11px; color:#64748B; font-weight:600; margin-top:2px; }

/* ── Main layout ── */
.dc-main {
  display:grid; grid-template-columns:1fr 290px; gap:20px;
  align-items:stretch; animation:dcFade 0.5s ease 0.1s both;
}
.dc-cols { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; align-items:stretch; height:100%; }

/* ── Column ── */
.dc-col {
  background:#fff; border-radius:22px;
  border:1px solid #E2E8F0;
  box-shadow:0 2px 12px rgba(15,23,42,0.04);
  display:flex; flex-direction:column; overflow:hidden;
  height:100%;
}
.dc-col-hdr {
  padding:18px 18px 12px;
  border-bottom:1px solid #E2E8F0;
  background:#F8FAFC;
  display:flex; align-items:center; justify-content:space-between;
}
.dc-col-title { font-size:15px; font-weight:800; color:#0F172A; margin-right:8px; }
.dc-col-cnt { font-size:12px; font-weight:700; border-radius:20px; padding:3px 10px; }
.dc-col-body {
  flex:1; padding:12px 12px 4px; display:flex; flex-direction:column; gap:9px;
  overflow-y:auto;
  scrollbar-width:thin; scrollbar-color:rgba(24,24,27,0.2) transparent;
}
.dc-col-add {
  margin:auto 12px 14px; margin-top:auto; background:none;
  border:1.5px dashed #D4D4D8; border-radius:12px;
  padding:10px; color:#71717A; font-size:13px; font-weight:600; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:6px;
  transition:border-color 0.2s,color 0.2s,background 0.2s;
  flex-shrink:0;
}
.dc-col-add:hover { border-color:var(--acc,#18181B); color:var(--acc,#18181B); background:rgba(24,24,27,0.04); }

/* ── Card ── */
.dc-card {
  background:#FAFAFA; border:1px solid #E4E4E7; border-radius:16px;
  padding:12px; cursor:pointer; transition:transform 0.15s,box-shadow 0.15s,border-color 0.15s;
}
.dc-card:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(24,24,27,0.06); border-color:var(--acc,#18181B); background:#fff; }
.dc-card-row { display:flex; align-items:center; gap:10px; }
.dc-av { width:38px; height:38px; border-radius:12px; font-size:13px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.dc-ci { flex:1; min-width:0; }
.dc-cn { font-size:13px; font-weight:700; color:#0F172A; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dc-cp { font-size:11px; color:#64748B; margin:1px 0 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dc-badge { font-size:10px; font-weight:700; border-radius:20px; padding:3px 8px; flex-shrink:0; }
.dc-extra { font-size:10px; color:#64748B; font-weight:500; margin:6px 0 0; padding-top:6px; border-top:1px solid #E2E8F0; }
.dc-empty { text-align:center; color:#94A3B8; font-size:12px; padding:24px 12px; font-style:italic; }

/* ── Right Panel ── */
.dc-panel { display:flex; flex-direction:column; gap:16px; }
.dc-pcard {
  background:#fff; border-radius:22px; padding:18px;
  border:1px solid #E2E8F0;
  box-shadow:0 2px 12px rgba(15,23,42,0.04);
}

/* Donut card: dark bg */
.dc-pcard.dark {
  background:#0F172A;
  border-color:#1E293B;
}
.dc-pcard-lbl { font-size:13px; font-weight:700; color:#0F172A; margin:0 0 14px; }
.dc-donut { display:flex; flex-direction:column; align-items:center; gap:14px; }
.dc-donut-leg { width:100%; }
.dc-leg-row { display:flex; align-items:center; gap:8px; font-size:12px; color:rgba(255,255,255,0.7); padding:3px 0; font-weight:500; }
.dc-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }

/* Dept rows */
.dc-dept-row { display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid rgba(124,58,237,0.07); }
.dc-dept-row:last-child { border-bottom:none; }
.dc-dept-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
.dc-dept-nm { flex:1; font-size:12px; color:#5B4D8A; font-weight:500; }
.dc-dept-cnt { font-size:12px; font-weight:800; color:#1E1147; }

/* ── Calendar ── */
.dc-cal { width:100%; }
.dc-cal-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.dc-cal-mon { font-size:14px; font-weight:800; color:#0F172A; }
.dc-cal-nav { background:#F4F4F5; border:none; cursor:pointer; border-radius:8px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:17px; color:#18181B; font-weight:700; transition:background 0.2s; }
.dc-cal-nav:hover { background:#18181B; color:#fff; }
.dc-cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; }
.dc-cal-dow { text-align:center; font-size:10px; font-weight:700; color:#A1A1AA; padding:3px 0; text-transform:uppercase; }
.dc-cal-day { text-align:center; font-size:11px; font-weight:600; color:#18181B; padding:6px 2px; border-radius:8px; cursor:pointer; position:relative; transition:all 0.15s; }
.dc-cal-day.empty { color:transparent; pointer-events:none; cursor:default; }
.dc-cal-day.selected { background:#18181B !important; color:#fff !important; font-weight:800; box-shadow:0 3px 10px rgba(24,24,27,0.3); transform:scale(1.05); }
.dc-cal-day.today:not(.selected) { border:2px solid #18181B; color:#18181B; font-weight:800; }
.dc-cal-day.att:not(.selected)::after { content:''; position:absolute; bottom:2px; left:50%; transform:translateX(-50%); width:4px; height:4px; border-radius:50%; background:#0D9488; }
.dc-cal-day.leave:not(.selected)::after { content:''; position:absolute; bottom:2px; left:50%; transform:translateX(-50%); width:4px; height:4px; border-radius:50%; background:#D97706; }
.dc-cal-day:not(.empty):not(.selected):hover { background:#F4F4F5; color:#18181B; }

/* ── Attendance Code Banner ── */
.dc-code-banner {
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;
  padding:18px 24px;
  border-radius:20px;
  background:#FAFAFA;
  border:2px dashed #D4D4D8;
  box-shadow:0 2px 8px rgba(24,24,27,0.04);
  animation:dcFade 0.4s ease 0.02s both;
  transition:all 0.3s;
}
.dc-code-banner.active {
  background:#FEF3C7;
  border-color:#F59E0B;
  box-shadow:0 4px 18px rgba(217,119,6,0.15);
  animation:dcFade 0.4s ease 0.02s both, codePulse 3s ease-in-out infinite;
}
.dc-code-banner-left { display:flex; align-items:center; gap:14px; }
.dc-code-banner-icon { font-size:28px; filter:drop-shadow(0 2px 6px rgba(217,119,6,0.3)); }
.dc-code-banner-label { font-size:15px; font-weight:800; color:#18181B; margin:0 0 2px; }
.dc-code-banner-sub   { font-size:11px; color:#71717A; margin:0; }
.dc-code-banner-right { display:flex; align-items:center; gap:12px; }
.dc-code-banner-val {
  font-size:26px; font-weight:900; font-family:'Courier New',monospace;
  color:#B45309; letter-spacing:0.12em;
  background:#FEF3C7; padding:8px 20px; border-radius:12px;
  border:1px solid #FDE68A;
  text-shadow:0 1px 8px rgba(217,119,6,0.2);
  min-width:180px; text-align:center;
}
.dc-code-banner-copy {
  background:#7C3AED; color:#fff;
  border:none; cursor:pointer; border-radius:12px; padding:10px 20px;
  font-size:14px; font-weight:700;
  box-shadow:0 2px 8px rgba(124,58,237,0.25);
  transition:background 0.2s, transform 0.15s;
  white-space:nowrap;
}
.dc-code-banner-copy:hover { background:#6D28D9; transform:translateY(-1px); }
@keyframes codePulse {
  0%,100% { box-shadow:0 4px 24px rgba(124,58,237,0.15); }
  50%      { box-shadow:0 4px 32px rgba(124,58,237,0.32); }
}

/* ── Dots dropdown ── */
.dc-menu-wrap { position:relative; }
.dc-dots.active { background:#F0EEFF; color:#7C3AED; border-color:#C4B5FD; }
.dc-dropdown {
  position:absolute; top:calc(100% + 10px); right:0;
  background:#fff; border-radius:18px;
  border:1px solid rgba(124,58,237,0.15);
  box-shadow:0 16px 48px rgba(124,58,237,0.18),0 4px 16px rgba(0,0,0,0.08);
  padding:10px; min-width:210px; z-index:200;
  animation:dropIn 0.18s cubic-bezier(0.16,1,0.3,1);
}
.dc-dropdown-title {
  font-size:10px; font-weight:800; color:#C4B5FD;
  text-transform:uppercase; letter-spacing:0.12em;
  padding:4px 10px 8px; margin:0;
  border-bottom:1px solid rgba(124,58,237,0.08); margin-bottom:6px;
}
.dc-dropdown-item {
  display:flex; align-items:center; gap:10px;
  width:100%; padding:10px 12px; border:none; background:none;
  border-radius:12px; cursor:pointer; text-align:left;
  font-size:13px; font-weight:600; color:#1E1147;
  transition:background 0.15s,transform 0.1s;
}
.dc-dropdown-item:hover { background:#F0EEFF; color:#7C3AED; transform:translateX(3px); }
.dc-dropdown-icon { font-size:16px; width:22px; text-align:center; flex-shrink:0; }
@keyframes dropIn { from{opacity:0;transform:translateY(-8px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }

/* Animation */
@keyframes dcFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

/* Responsive */
@media(max-width:1100px){ .dc-main{grid-template-columns:1fr;} .dc-panel{flex-direction:row;flex-wrap:wrap;} .dc-pcard{flex:1;min-width:220px;} }
@media(max-width:800px){ .dc-stats-row{grid-template-columns:repeat(2,1fr);} }
@media(max-width:700px){ .dc-cols{grid-template-columns:1fr;} .dc-wrap{padding:16px;} }
`;

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
      <style>{DASH_STYLES}</style>
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
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28, color: '#D97706' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
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

            {/* Donut — dark card */}
            <div className="dc-pcard dark">
              <DonutChart present={present} onLeave={lvCnt} absent={absent} total={total || 1} />
            </div>

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
