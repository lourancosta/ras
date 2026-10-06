// No look-alike characters (0/O, 1/l/I), so a password is easy to read out or type.
const PASSWORD_CHARS = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const PASSWORD_MIN_LENGTH = 8 // same rule as the manage-worker function

// 12 random characters. crypto.getRandomValues is the browser's secure random source
// (Math.random isn't meant for passwords).
export function generatePassword(): string {
  const values = crypto.getRandomValues(new Uint32Array(12))
  return Array.from(values, (value) => PASSWORD_CHARS[value % PASSWORD_CHARS.length]).join('')
}
