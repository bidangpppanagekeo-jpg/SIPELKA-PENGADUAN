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

// Salted SHA-256 Officer Credential Verification (No plaintext username/password stored in bundle)
const OFFICER_CREDENTIAL_SALT = '08eb8f3c42accec9e63286745dc28abf';
const OFFICER_USERNAME_HASH = '1af43ababfff40dd63399983881288d13bbc1023fea52a65846e8b37fa390967';
const OFFICER_PASSWORD_HASH = 'b400de727b38653bb2e88ec7b6c7b3029a2da9b720da381a3c1e22253737748b';

const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

const sha256Fallback = (ascii: string): string => {
  const rightRotate = (value: number, amount: number) => (value >>> amount) | (value << (32 - amount));
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash.unshift((temp1 + temp2) | 0);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }
    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
};

const sha256Hex = async (text: string): Promise<string> => {
  const bytes = new TextEncoder().encode(text);
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return sha256Fallback(binary);
};

export const verifyOfficerCredentials = async (username: string, password: string): Promise<boolean> => {
  if (!username || !password) return false;
  const userHash = await sha256Hex(`${OFFICER_CREDENTIAL_SALT}:u:${username.trim()}`);
  const passHash = await sha256Hex(`${OFFICER_CREDENTIAL_SALT}:p:${password}`);
  return (
    constantTimeEqual(userHash, OFFICER_USERNAME_HASH) &&
    constantTimeEqual(passHash, OFFICER_PASSWORD_HASH)
  );
};

