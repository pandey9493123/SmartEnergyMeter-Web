import { useEffect, useState } from 'react';

function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const savedTheme = window.localStorage.getItem('sem-theme');

  if (savedTheme === 'dark') {
    return true;
  }

  if (savedTheme === 'light') {
    return false;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(getInitialDarkMode);

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextThemeIsDark = !isDark;

    setIsDark(nextThemeIsDark);
    window.localStorage.setItem(
      'sem-theme',
      nextThemeIsDark ? 'dark' : 'light',
    );
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        padding: '8px 10px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--surface-control)',
        fontSize: '0.8rem',
        fontWeight: 600,
      }}
    >
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  );
}