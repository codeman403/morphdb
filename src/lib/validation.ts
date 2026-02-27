/**
 * Email validation using RFC 5322 simplified regex
 * Rejects invalid patterns like test@.com, test@@domain.com, etc.
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Additional checks
  if (!emailRegex.test(email)) return false;
  if (email.length > 254) return false; // RFC 5321
  if (email.startsWith('.') || email.endsWith('.')) return false;
  if (email.includes('..')) return false;
  
  const [localPart] = email.split('@');
  if (localPart.length > 64) return false; // RFC 5321
  
  return true;
}

/**
 * Password strength validation
 * Requires: min 8 chars, uppercase, lowercase, number, and symbol
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Name validation
 */
export function validateName(name: string): boolean {
  if (!name || name.length < 2) return false;
  if (name.length > 100) return false;
  // Only allow letters, spaces, hyphens, and apostrophes
  return /^[a-zA-Z\s\-']+$/.test(name);
}

/**
 * Company validation
 */
export function validateCompany(company: string): boolean {
  if (!company) return true; // Optional
  if (company.length > 100) return false;
  return true;
}
