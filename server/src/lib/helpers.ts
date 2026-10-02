import axios from 'axios';
import { URL } from 'url';

export function normalizeUrl(input: string) {
  let value = input.trim();
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  const parsed = new URL(value);
  const normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname || '/'}`;
  return normalized.replace(/\/$/, '') || `${parsed.protocol}//${parsed.host}`;
}

export function getDomainFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

export function getFaviconUrl(url: string) {
  try {
    const parsed = new URL(url);
    const domain = parsed.origin;
    return `${domain}/favicon.ico`;
  } catch {
    return '';
  }
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

export async function safeFetchHtml(url: string) {
  const response = await axios.get(url, {
    validateStatus: () => true,
    timeout: 20000,
    headers: {
      'User-Agent': 'Mozilla/5.0 CheckMySite/1.0',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  return response;
}
