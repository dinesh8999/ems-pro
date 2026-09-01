// Generate meaningful daily attendance code
const generateDailyCode = () => {
  const adjectives = [
    'Swift', 'Bright', 'Bold', 'Clever', 'Dynamic', 'Elite', 'Focus', 'Great',
    'Happy', 'Ideal', 'Keen', 'Lively', 'Mighty', 'Noble', 'Prime', 'Quick',
    'Ready', 'Smart', 'Vital', 'Wise', 'Agile', 'Brave', 'Clear', 'Direct'
  ];
  
  const nouns = [
    'Eagle', 'Tiger', 'Phoenix', 'Dragon', 'Falcon', 'Lion', 'Hawk', 'Wolf',
    'Bear', 'Panther', 'Cheetah', 'Warrior', 'Champion', 'Leader', 'Victor',
    'Master', 'Hero', 'Knight', 'Ranger', 'Scout', 'Pioneer', 'Achiever'
  ];
  
  const today = new Date();
  const dayNumber = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  
  // Use day of year to generate consistent code for the day
  const adjIndex = dayNumber % adjectives.length;
  const nounIndex = (dayNumber * 7) % nouns.length;
  const number = (today.getDate() * today.getMonth() + today.getFullYear()) % 100;
  
  return `${adjectives[adjIndex]}-${nouns[nounIndex]}-${number}`;
};

// Get today's attendance code
export const getTodayCode = () => {
  return generateDailyCode();
};

// Validate attendance code
export const validateAttendanceCode = (code) => {
  const todayCode = getTodayCode();
  return code.toUpperCase() === todayCode.toUpperCase();
};

// Department-specific code words (legacy - no longer used)
export const DEPARTMENT_CODES = {
  'Engineering': ['CODE-ENG-2026', 'TECH-ALPHA', 'DEV-SECURE'],
  'HR': ['HR-PEOPLE-2026', 'HUMAN-CONNECT', 'TEAM-CULTURE'],
  'Sales': ['SALES-WIN-2026', 'DEAL-CLOSER', 'TARGET-ACHIEVED'],
  'Marketing': ['MARKET-BRAND-2026', 'CREATIVE-WAVE', 'PROMO-MAGIC'],
  'Finance': ['FIN-SECURE-2026', 'MONEY-TRACK', 'AUDIT-READY'],
  'Operations': ['OPS-FLOW-2026', 'PROCESS-SMOOTH', 'EXECUTE-NOW'],
  'Other': ['GENERAL-ACCESS', 'WORK-DAY', 'OFFICE-2026']
};

// Get codes for a department (legacy)
export const getDepartmentCodes = (department) => {
  return DEPARTMENT_CODES[department] || DEPARTMENT_CODES['Other'];
};

export default { DEPARTMENT_CODES, validateAttendanceCode, getDepartmentCodes, getTodayCode };
