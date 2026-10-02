import { URL } from 'url';

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^localhost$/i,
  /^::1$/i,
];

export function isUnsafeUrl(input: string) {
  try {
    let value = input.trim();
    if (!/^https?:\/\//i.test(value)) {
      value = 'https://' + value;
    }
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return true;
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '0.0.0.0') return true;
    if (parsed.hostname.includes('localhost')) return true;
    if (parsed.hostname.startsWith('127.')) return true;
    if (parsed.hostname.startsWith('10.')) return true;
    if (parsed.hostname.startsWith('192.168.')) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(parsed.hostname)) return true;
    if (parsed.hostname === '169.254.169.254') return true;
    if (parsed.hostname.includes('metadata.google.internal')) return true;
    if (parsed.hostname.includes('internal')) return true;
    return false;
  } catch {
    return true;
  }
}

export function validateUserInputUrl(input: string) {
  let value = input.trim();
  if (!value) return 'URL is required.';
  if (!/^https?:\/\//i.test(value)) {
    value = 'https://' + value;
  }
  if (isUnsafeUrl(value)) return 'This URL is not allowed for security reasons.';
  return null;
}

export function parseAndValidateUrl(input: string) {
  let value = input.trim();
  if (!/^https?:\/\//i.test(value)) {
    value = 'https://' + value;
  }
  const error = validateUserInputUrl(value);
  if (error) throw new Error(error);
  const url = new URL(value);
  return url;
}
