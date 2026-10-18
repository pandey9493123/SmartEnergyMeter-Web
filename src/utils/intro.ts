const INTRO_SEEN_KEY = 'sem-intro-seen';

export function shouldShowIntro(): boolean {
  try {
    if (sessionStorage.getItem(INTRO_SEEN_KEY)) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    /* ignore */
  }
}
