/**
 * Theme management utilities
 */

const THEME_KEY = 'ethereum_tx_builder_theme';
const DEFAULT_THEME = 'light';

/**
 * Get current theme
 * @returns {string} 'light' or 'dark'
 */
export function getTheme() {
  try {
    return window.localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  } catch (e) {
    return DEFAULT_THEME;
  }
}

/**
 * Set theme
 * @param {string} theme - 'light' or 'dark'
 */
export function setTheme(theme) {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
    // eslint-disable-next-line no-use-before-define
    applyTheme(theme);
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error setting theme:', e);
    return false;
  }
}

/**
 * Apply theme to document
 * @param {string} theme - 'light' or 'dark'
 */
export function applyTheme(theme) {
  if (typeof window === 'undefined' || !document || !document.documentElement) {
    return;
  }
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark-theme');
    root.classList.remove('light-theme');
  } else {
    root.classList.add('light-theme');
    root.classList.remove('dark-theme');
  }
}

// Apply theme on DOM ready
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyTheme(getTheme());
    });
  } else {
    // DOM already loaded
    setTimeout(() => {
      applyTheme(getTheme());
    }, 0);
  }
}

