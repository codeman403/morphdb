/**
 * PII (Personally Identifiable Information) Utilities
 *
 * Provides functions for hashing, anonymizing, and masking sensitive data
 * in logs and audit trails to ensure GDPR/compliance compliance.
 */

import { createHash } from 'crypto'

const HASH_SALT = process.env.PII_HASH_SALT || 'morphdb-pii-salt-v1'

/**
 * Hash email address using SHA-256
 * Used to protect PII in audit logs and database records
 *
 * @param email - Email address to hash
 * @returns Hashed email (shortened to 16 chars for readability)
 */
export function hashEmail(email: string): string {
  try {
    const hash = createHash('sha256')
      .update(email.toLowerCase() + HASH_SALT)
      .digest('hex')
    return 'email_' + hash.substring(0, 12)
  } catch (error) {
    console.error('Error hashing email:', error)
    return 'email_error'
  }
}

/**
 * Anonymize IP address to CIDR block (e.g., 192.168.1.0/24)
 * Preserves geographic relevance while protecting user privacy
 *
 * @param ip - IPv4 or IPv6 address
 * @returns Anonymized CIDR block, or undefined if invalid
 */
export function anonymizeIpAddress(ip?: string): string | undefined {
  if (!ip) return undefined

  try {
    // Handle IPv4
    if (ip.includes('.')) {
      const parts = ip.split('.')
      if (parts.length === 4) {
        // Convert last octet to 0 for /24 CIDR block
        return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`
      }
    }

    // Handle IPv6 (simplify to first 4 groups)
    if (ip.includes(':')) {
      const parts = ip.split(':').slice(0, 4).join(':')
      return `${parts}::/64`
    }

    // Return original if invalid format
    return ip
  } catch (error) {
    console.error('Error anonymizing IP:', error)
    return undefined
  }
}

/**
 * Mask user agent string to remove PII and device fingerprinting
 * Keeps browser info but removes OS details, device model, etc.
 *
 * @param userAgent - Full user agent string
 * @returns Masked user agent (browser name only)
 */
export function maskUserAgent(userAgent?: string): string | undefined {
  if (!userAgent) return undefined

  try {
    // Extract browser name without version or OS details
    if (userAgent.includes('Chrome')) {
      return 'Mozilla/5.0 Chrome'
    } else if (userAgent.includes('Safari')) {
      return 'Mozilla/5.0 Safari'
    } else if (userAgent.includes('Firefox')) {
      return 'Mozilla/5.0 Firefox'
    } else if (userAgent.includes('Edge')) {
      return 'Mozilla/5.0 Edge'
    } else if (userAgent.includes('Opera')) {
      return 'Mozilla/5.0 Opera'
    }

    // Default for unknown browsers
    return 'Mozilla/5.0 Unknown'
  } catch (error) {
    console.error('Error masking user agent:', error)
    return undefined
  }
}

/**
 * Generic SHA-256 hash function for PII protection
 * Used for email, phone, SSN, or any sensitive string
 *
 * @param data - Data to hash
 * @param salt - Optional custom salt (defaults to global PII_HASH_SALT)
 * @returns Hashed value
 */
export function hashPII(data: string, salt: string = HASH_SALT): string {
  try {
    const hash = createHash('sha256').update(data + salt).digest('hex')
    return hash.substring(0, 16)
  } catch (error) {
    console.error('Error hashing PII:', error)
    return 'error'
  }
}

/**
 * Mask sensitive object fields in logs
 * Used to prevent accidental PII leakage in structured logs
 *
 * @param obj - Object to mask
 * @param fieldsToMask - List of field names to mask
 * @returns New object with masked fields
 */
export function maskSensitiveFields(
  obj: Record<string, unknown>,
  fieldsToMask: string[] = ['email', 'password', 'apiKey', 'token', 'phoneNumber', 'ssn']
): Record<string, unknown> {
  if (!obj) return obj

  const masked = { ...obj }

  fieldsToMask.forEach(field => {
    if (field in masked && masked[field]) {
      if (typeof masked[field] === 'string') {
        masked[field] = `[REDACTED_${field.toUpperCase()}]`
      } else if (typeof masked[field] === 'object') {
        masked[field] = '[REDACTED_OBJECT]'
      }
    }
  })

  return masked
}

/**
 * Redact email address for display in logs
 * Shows first 3 chars and domain: john***@example.com
 *
 * @param email - Email to redact
 * @returns Partially redacted email
 */
export function redactEmail(email?: string): string | undefined {
  if (!email) return undefined

  const [localPart, domain] = email.split('@')
  if (!domain) return email

  const visible = localPart.substring(0, 3)
  const stars = '*'.repeat(Math.max(1, localPart.length - 3))
  return `${visible}${stars}@${domain}`
}

/**
 * Redact phone number for display: +1-555-***-4567
 *
 * @param phone - Phone number to redact
 * @returns Partially redacted phone
 */
export function redactPhoneNumber(phone?: string): string | undefined {
  if (!phone) return undefined

  // Remove non-digits
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return phone

  // Show last 4 digits, hide rest
  const visible = digits.slice(-4)
  const hidden = '*'.repeat(digits.length - 4)
  return `+${hidden}${visible}`
}

/**
 * Check if string contains PII patterns (email, phone, SSN)
 * Used to warn if PII is being logged
 *
 * @param str - String to check
 * @returns true if PII pattern detected
 */
export function containsPII(str: string): boolean {
  if (!str || typeof str !== 'string') return false

  // Email pattern
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(str)) {
    return true
  }

  // Phone pattern (basic)
  if (/(\+1|1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/.test(str)) {
    return true
  }

  // SSN pattern
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(str)) {
    return true
  }

  // Credit card pattern
  if (/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/.test(str)) {
    return true
  }

  return false
}
