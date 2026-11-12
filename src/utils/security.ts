/**
 * Cybersecurity & Data Protection Engine for SI-PELKA UPTD PPA Nagekeo
 * Enforcing Zero-Trust, Anti-Injection, Anti-Tampering, Anti-Brute-Force & Victim Privacy
 */

/**
 * Sanitizes user input string against SQL Injection patterns, script injection, and XSS payloads.
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  let cleaned = input
    // Remove HTML tags, script tags, iframe, object, embed
    .replace(/<[^>]*>?/gm, '')
    // Remove inline event handlers (e.g. onerror=, onclick=)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '')
    // Neutralize standard SQL injection attack keywords & statements
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|XP_|SYS\.)\b)/gi, '')
    // Neutralize dangerous database operators & comment characters
    .replace(/(--|;|\/\*|\*\/|@@|@|\|\|)/g, '')
    .trim();

  return cleaned;
};

/**
 * Validates whether an input string contains potential SQL injection or attack signatures.
 */
export const detectMaliciousInput = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  const sqlAttackPattern = /(\b(SELECT|UNION|DROP|INSERT|DELETE|UPDATE|EXEC|TRUNCATE)\b|--|;|\/\*|\*\/)/i;
  const xssPattern = /(<script|javascript:|onerror\s*=|onload\s*=|onclick\s*=|document\.cookie)/i;
  return sqlAttackPattern.test(input) || xssPattern.test(input);
};

/**
 * Masks victim's full name for display privacy protection.
 */
export const maskVictimName = (fullName: string): string => {
  if (!fullName) return 'Korban Dirahasiakan';
  const parts = fullName.trim().split(' ');
  return parts.map(part => {
    if (part.length <= 1) return '*';
    return part[0] + '*'.repeat(Math.max(1, part.length - 1));
  }).join(' ');
};

/**
 * Masks contact phone number for display privacy.
 */
export const maskPhoneNumber = (phone: string): string => {
  if (!phone || phone.length < 6) return '****-****';
  const visibleStart = phone.slice(0, 4);
  const visibleEnd = phone.slice(-3);
  const maskedMiddle = '*'.repeat(Math.max(3, phone.length - 7));
  return `${visibleStart}${maskedMiddle}${visibleEnd}`;
};

/**
 * Rate Limiter for Public Complaint Submissions:
 * Prevents automated bots / denial of service spam flooding.
 * Enforces minimum 30 seconds interval between submissions on the same browser session.
 */
const SUBMISSION_COOLDOWN_MS = 30 * 1000;
const SUBMISSION_KEY = 'sipelka_last_submission_ts';

export const checkSubmissionRateLimit = (): { allowed: boolean; remainingSeconds: number } => {
  try {
    const lastStr = sessionStorage.getItem(SUBMISSION_KEY);
    if (!lastStr) return { allowed: true, remainingSeconds: 0 };
    
    const lastTime = parseInt(lastStr, 10);
    const now = Date.now();
    const diff = now - lastTime;
    
    if (diff < SUBMISSION_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((SUBMISSION_COOLDOWN_MS - diff) / 1000);
      return { allowed: false, remainingSeconds };
    }
  } catch {
    // Fallback allow if sessionStorage restricted
  }
  return { allowed: true, remainingSeconds: 0 };
};

export const recordSubmissionTimestamp = () => {
  try {
    sessionStorage.setItem(SUBMISSION_KEY, Date.now().toString());
  } catch {}
};

/**
 * Brute-Force Defense for Admin Officer Portal:
 * Maximum 5 failed attempts before a 5-minute lockout.
 */
const ADMIN_MAX_ATTEMPTS = 5;
const ADMIN_LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes
const ATTEMPTS_KEY = 'sipelka_admin_failed_attempts';
const LOCKOUT_KEY = 'sipelka_admin_lockout_until';

export const checkAdminLoginRateLimit = (): { locked: boolean; remainingMinutes: number } => {
  try {
    const lockoutUntilStr = localStorage.getItem(LOCKOUT_KEY);
    if (lockoutUntilStr) {
      const lockoutUntil = parseInt(lockoutUntilStr, 10);
      const now = Date.now();
      if (now < lockoutUntil) {
        const remainingMinutes = Math.ceil((lockoutUntil - now) / 60000);
        return { locked: true, remainingMinutes };
      } else {
        localStorage.removeItem(LOCKOUT_KEY);
        localStorage.removeItem(ATTEMPTS_KEY);
      }
    }
  } catch {}
  return { locked: false, remainingMinutes: 0 };
};

export const recordFailedAdminLogin = (): { locked: boolean; remainingAttempts: number; remainingMinutes: number } => {
  try {
    const currentAttempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
    localStorage.setItem(ATTEMPTS_KEY, currentAttempts.toString());

    if (currentAttempts >= ADMIN_MAX_ATTEMPTS) {
      const lockoutUntil = Date.now() + ADMIN_LOCKOUT_MS;
      localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString());
      return { locked: true, remainingAttempts: 0, remainingMinutes: 5 };
    }

    return { 
      locked: false, 
      remainingAttempts: ADMIN_MAX_ATTEMPTS - currentAttempts, 
      remainingMinutes: 0 
    };
  } catch {
    return { locked: false, remainingAttempts: 3, remainingMinutes: 0 };
  }
};

export const resetAdminLoginAttempts = () => {
  try {
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
  } catch {}
};

/**
 * Emergency Quick-Exit & Privacy Wiper:
 * Safely navigates away to a neutral page without retaining form history or draft in back button.
 */
export const executeEmergencyExit = () => {
  try {
    // Clear any sensitive draft entries
    sessionStorage.removeItem('sipelka_draft_victim');
    sessionStorage.removeItem('sipelka_draft_story');
  } catch {}
  // Replace current history entry so pressing back won't expose victim form
  window.location.replace('https://www.google.com/search?q=prakiraan+cuaca+mbay+nagekeo+ntt');
};

/**
 * Anti-Tampering & Anti-Inspection Shield:
 * Protects page from unauthorized source code inspection and console tampering.
 */
export const attachSecurityShield = (enabled: boolean) => {
  if (!enabled) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    // Block DevTools shortcuts: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
    ) {
      e.preventDefault();
      console.warn('SI-PELKA Cybersecurity: Inspeksi kode sumber & Developer Tools dibatasi untuk perlindungan data korban.');
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};
