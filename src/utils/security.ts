/**
 * Cybersecurity & Data Protection Utilities for SI-PELKA UPTD PPA Nagekeo
 * - Anti SQL Injection & XSS Sanitization
 * - Victim Data Privacy Masking
 * - Inspection & Tampering Deterrent
 */

/**
 * Sanitizes user input string against SQL Injection patterns and XSS payload injection.
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  let cleaned = input
    // Remove HTML tags / script injection
    .replace(/<[^>]*>?/gm, '')
    // Neutralize common SQL injection keywords and operators
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/gi, '')
    .replace(/(--|;|\/\*|\*\/|@@|@)/g, '')
    .trim();

  return cleaned;
};

/**
 * Validates whether an input string contains potential SQL injection or attack signatures.
 */
export const detectMaliciousInput = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  const sqlAttackPattern = /(\b(SELECT|UNION|DROP|INSERT|DELETE|UPDATE|--|;|\/\*)\b)/i;
  const xssPattern = /(<script|javascript:|onerror=|onload=)/i;
  return sqlAttackPattern.test(input) || xssPattern.test(input);
};

/**
 * Masks victim's full name for privacy protection (e.g., "Maria Goreti" -> "M**** G*****")
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
 * Masks contact phone number for privacy (e.g., "081234567890" -> "0812****7890")
 */
export const maskPhoneNumber = (phone: string): string => {
  if (!phone || phone.length < 6) return '****-****';
  const visibleStart = phone.slice(0, 4);
  const visibleEnd = phone.slice(-3);
  const maskedMiddle = '*'.repeat(Math.max(3, phone.length - 7));
  return `${visibleStart}${maskedMiddle}${visibleEnd}`;
};

/**
 * Hook or helper to attach inspection / anti-tampering listeners
 */
export const attachSecurityShield = (enabled: boolean) => {
  if (!enabled) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      console.warn('SI-PELKA Cybersecurity: Inspeksi kode sumber & Developer Tools dibatasi untuk perlindungan data korban.');
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    // Optional right-click restriction on sensitive areas
    // e.preventDefault();
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('contextmenu', handleContextMenu);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('contextmenu', handleContextMenu);
  };
};
