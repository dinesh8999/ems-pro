import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
const ACTIVE_THEME = 'sunset-pop';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme] = useState(ACTIVE_THEME);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Remove any previously applied theme-* classes before setting the active one.
    [root, body].forEach((el) => {
      [...el.classList]
        .filter((className) => className.startsWith('theme-'))
        .forEach((className) => el.classList.remove(className));
    });

    root.classList.add(`theme-${theme}`);
    body.classList.add(`theme-${theme}`);
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Keep API compatibility for existing components.
  const toggleTheme = () => {};
  const setTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes: [ACTIVE_THEME] }}>
      {children}
    </ThemeContext.Provider>
  );
};