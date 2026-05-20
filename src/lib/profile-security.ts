import { Platform } from 'react-native';

export type SavedProfile = {
  themeName: string;
  html: string;
  css: string;
  js?: string;
  mode?: 'simple' | 'advanced';
};

export type ModerationStatus = 'approved' | 'flagged' | 'blocked' | 'pending';
export type ImageModerationResult = {
  status: ModerationStatus;
  reason?: string;
};

export type ReportReason =
  | 'nudity_or_sexual_content'
  | 'hate_symbol_or_extremist_content'
  | 'scam_or_malicious_link'
  | 'harassment'
  | 'violent_or_graphic_content'
  | 'other';

export type ProfileReport = {
  id: string;
  profileHandle: string;
  reason: ReportReason;
  details?: string;
  createdAt: string;
  status: 'open' | 'reviewed';
};

export const PROFILE_STORAGE_KEY = 'sori.profile.customization';
export const PROFILE_VERSION_KEY = 'sori.profile.versions';
export const PROFILE_SAFE_MODE_KEY = 'sori.profile.safeMode';
export const PROFILE_REPORTS_KEY = 'sori.profile.reports';
export const PROFILE_HIDDEN_KEY = 'sori.profile.hiddenPendingReview';
export const PROFILE_MAX_HTML_CHARS = 50000;
export const PROFILE_MAX_CSS_CHARS = 50000;
export const PROFILE_MAX_JS_CHARS = 35000;
export const PROFILE_MAX_REPORTS_BEFORE_HIDE = 3;

export const fallbackProfile: SavedProfile = {
  themeName: 'Neon Orbit',
  html: '',
  css: '',
  js: '',
  mode: 'advanced',
};

export const FRAME_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline' https://fonts.googleapis.com",
  "img-src http: https: data: blob:",
  "media-src http: https: data: blob:",
  "font-src https://fonts.gstatic.com data:",
  "connect-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "worker-src 'none'",
].join('; ');

const blockedTags = [
  'object',
  'embed',
  'iframe',
  'base',
  'form',
  'input',
  'textarea',
  'button',
  'select',
  'option',
  'meta',
];

const reportReasonLabels: Record<ReportReason, string> = {
  nudity_or_sexual_content: 'Nudity or sexual content',
  hate_symbol_or_extremist_content: 'Hate symbol or extremist content',
  scam_or_malicious_link: 'Scam or malicious link',
  harassment: 'Harassment',
  violent_or_graphic_content: 'Violent or graphic content',
  other: 'Other',
};

export const reportReasons = Object.entries(reportReasonLabels).map(([id, label]) => ({
  id: id as ReportReason,
  label,
}));

export function canUseProfileStorage() {
  return Platform.OS === 'web' && typeof window !== 'undefined';
}

export function enforceProfileLimits(profile: SavedProfile) {
  return {
    ...profile,
    html: profile.html.slice(0, PROFILE_MAX_HTML_CHARS),
    css: profile.css.slice(0, PROFILE_MAX_CSS_CHARS),
    js: (profile.js ?? '').slice(0, PROFILE_MAX_JS_CHARS),
  };
}

export function readSavedProfile(): SavedProfile {
  if (!canUseProfileStorage()) {
    return fallbackProfile;
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    const profile = raw ? ({ ...fallbackProfile, ...JSON.parse(raw) } as SavedProfile) : fallbackProfile;
    return enforceProfileLimits(profile);
  } catch {
    return fallbackProfile;
  }
}

export function readProfileVersions() {
  if (!canUseProfileStorage()) {
    return [];
  }

  try {
    const versions = JSON.parse(window.localStorage.getItem(PROFILE_VERSION_KEY) || '[]') as SavedProfile[];
    return Array.isArray(versions) ? versions.map(enforceProfileLimits) : [];
  } catch {
    return [];
  }
}

export function saveProfile(profile: SavedProfile) {
  if (!canUseProfileStorage()) {
    return;
  }

  const limitedProfile = enforceProfileLimits(profile);
  const current = readSavedProfile();
  const versions = [current, ...readProfileVersions()].slice(0, 10);
  window.localStorage.setItem(PROFILE_VERSION_KEY, JSON.stringify(versions));
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(limitedProfile));
  window.localStorage.setItem(PROFILE_SAFE_MODE_KEY, 'false');
}

export function resetProfile() {
  if (!canUseProfileStorage()) {
    return;
  }

  const current = readSavedProfile();
  const versions = [current, ...readProfileVersions()].slice(0, 10);
  window.localStorage.setItem(PROFILE_VERSION_KEY, JSON.stringify(versions));
  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  window.localStorage.setItem(PROFILE_SAFE_MODE_KEY, 'false');
}

export function sanitizeProfileHtml(html: string) {
  let sanitized = html;

  blockedTags.forEach((tag) => {
    const pairedTag = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    const selfClosingOrOpen = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    sanitized = sanitized.replace(pairedTag, '').replace(selfClosingOrOpen, '');
  });

  sanitized = sanitized
    .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s+srcdoc\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+srcdoc\s*=\s*'[^']*'/gi, '')
    .replace(/<link\b[^>]*rel\s*=\s*["']?import["']?[^>]*>/gi, '');

  return sanitized;
}

export function validateExternalUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const protocol = url.protocol.toLowerCase();
    const host = url.hostname.toLowerCase();

    if (protocol !== 'http:' && protocol !== 'https:') {
      return { allowed: false, reason: 'Only http:// and https:// links are allowed.' };
    }

    if (isInternalHost(host)) {
      return { allowed: false, reason: 'Local and private network links are blocked.' };
    }

    return { allowed: true, url: url.toString(), domain: host };
  } catch {
    return { allowed: false, reason: 'Malformed link blocked.' };
  }
}

function isInternalHost(host: string) {
  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.endsWith('.local')
  ) {
    return true;
  }

  const match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) {
    return false;
  }

  const [a, b] = match.slice(1).map(Number);
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

export function moderateImage(source: string): ImageModerationResult {
  const lower = source.toLowerCase();
  const blockedTerms = ['porn', 'nude', 'nudity', 'gore', 'blood', 'nazi', 'swastika', 'isis', 'extremist'];
  const flaggedTerms = ['violent', 'weapon', 'adult', 'hate'];

  if (blockedTerms.some((term) => lower.includes(term))) {
    return {
      status: 'blocked',
      reason: 'Mock moderation blocked this image based on unsafe filename or URL terms.',
    };
  }

  if (flaggedTerms.some((term) => lower.includes(term))) {
    return {
      status: 'pending',
      reason: 'Mock moderation queued this image for review.',
    };
  }

  // TODO: Replace this localhost mock with AWS Rekognition, Google Vision SafeSearch,
  // Hive, Sightengine, or OpenAI vision moderation before production launch.
  return { status: 'approved' };
}

export function readProfileReports() {
  if (!canUseProfileStorage()) {
    return [];
  }

  try {
    const reports = JSON.parse(window.localStorage.getItem(PROFILE_REPORTS_KEY) || '[]') as ProfileReport[];
    return Array.isArray(reports) ? reports : [];
  } catch {
    return [];
  }
}

export function addProfileReport(report: Omit<ProfileReport, 'id' | 'createdAt' | 'status'>) {
  if (!canUseProfileStorage()) {
    return [];
  }

  const nextReport: ProfileReport = {
    ...report,
    id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'open',
  };
  const reports = [nextReport, ...readProfileReports()];
  window.localStorage.setItem(PROFILE_REPORTS_KEY, JSON.stringify(reports));

  const profileReportCount = reports.filter((item) => item.profileHandle === report.profileHandle).length;
  if (profileReportCount >= PROFILE_MAX_REPORTS_BEFORE_HIDE) {
    window.localStorage.setItem(PROFILE_HIDDEN_KEY, 'true');
  }

  return reports;
}

export function isProfileHiddenPendingReview() {
  return canUseProfileStorage() && window.localStorage.getItem(PROFILE_HIDDEN_KEY) === 'true';
}

export function getSandboxGuardScript() {
  return `
(() => {
  const blockedProtocols = /^(javascript:|data:|vbscript:|file:|blob:)/i;
  const privateHosts = /^(localhost|0\\.0\\.0\\.0|127\\.0\\.0\\.1|::1)$/i;
  const privateIpv4 = /^(10\\.|127\\.|169\\.254\\.|192\\.168\\.|172\\.(1[6-9]|2\\d|3[01])\\.)/;
  const blockedTags = ['object','embed','iframe','base','form','input','textarea','button','select'];

  function cleanUrl(raw) {
    try {
      const url = new URL(String(raw), location.href);
      if (blockedProtocols.test(url.href)) return null;
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      if (privateHosts.test(url.hostname) || privateIpv4.test(url.hostname)) return null;
      return url.href;
    } catch {
      return null;
    }
  }

  function hardenLinks(root = document) {
    root.querySelectorAll('a[href]').forEach((link) => {
      const href = cleanUrl(link.getAttribute('href'));
      if (!href) {
        link.removeAttribute('href');
        link.setAttribute('data-sori-blocked-link', 'true');
        return;
      }
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer nofollow ugc';
    });
  }

  function moderateImages(root = document) {
    root.querySelectorAll('img[src]').forEach((image) => {
      const src = image.getAttribute('src') || '';
      const lower = src.toLowerCase();
      if (/(porn|nude|nudity|gore|blood|nazi|swastika|isis|extremist)/.test(lower)) {
        const replacement = document.createElement('div');
        replacement.textContent = 'This image was removed for violating Sori safety rules.';
        replacement.style.cssText = 'display:grid;place-items:center;min-height:180px;padding:18px;border-radius:16px;background:#1f1020;color:#fecaca;font:700 14px system-ui;text-align:center;';
        image.replaceWith(replacement);
      } else if (/(violent|weapon|adult|hate)/.test(lower)) {
        image.style.filter = 'blur(18px)';
        image.style.opacity = '0.65';
        image.title = 'Image pending moderation review';
      }
    });
  }

  function removeDangerousNodes(root = document) {
    blockedTags.forEach((tag) => root.querySelectorAll(tag).forEach((node) => node.remove()));
    root.querySelectorAll('[srcdoc]').forEach((node) => node.removeAttribute('srcdoc'));
  }

  Object.defineProperty(window, 'open', {
    value: () => null,
    configurable: false,
    writable: false,
  });

  document.addEventListener('click', (event) => {
    const link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    const href = cleanUrl(link.getAttribute('href'));
    if (!href) {
      parent.postMessage({ type: 'SORI_BLOCKED_LINK', reason: 'Unsafe link blocked.' }, '*');
      return;
    }
    parent.postMessage({ type: 'SORI_EXTERNAL_LINK_REQUEST', href }, '*');
  }, true);

  document.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    parent.postMessage({ type: 'SORI_BLOCKED_FORM', reason: 'Forms are blocked inside custom profiles.' }, '*');
  }, true);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        removeDangerousNodes(node);
        hardenLinks(node);
        moderateImages(node);
      });
    });
  });

  addEventListener('DOMContentLoaded', () => {
    removeDangerousNodes();
    hardenLinks();
    moderateImages();
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
})();
`;
}

export const securityTestCases = [
  'JavaScript animation runs inside iframe',
  'Canvas effects run inside iframe',
  'Parent document access fails',
  'Main app cookies/localStorage/sessionStorage are unavailable',
  'Parent redirect attempt is blocked by sandbox',
  'External links trigger Sori warning',
  'javascript: links are blocked',
  'data: links are blocked',
  'localhost/private IP links are blocked',
  'iframe injection is removed',
  'form phishing is removed/blocked',
  'popup attempts return null',
  'Unsafe image placeholder appears',
  'Report profile flow stores a moderation report',
];
