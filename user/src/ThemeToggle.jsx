import { useState, useEffect } from 'react';

const THEME_KEY = 'app_theme'; // 'light' | 'dark'
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('theme-dark');
  else root.classList.remove('theme-dark');
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch {
        console.log('error to change theme')
    }
  }, [theme]);

  return (
    <button
      aria-pressed={theme === 'dark'}
      onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
      className="theme-toggle"
      title="Chuyển giao diện"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}