/**
 * TrickFunda Video Sniffer — Background Service Worker
 * 
 * Core sniffer engine that intercepts browser network requests,
 * pattern-matches media URLs, and clones request headers.
 * Works like 1DM's video detection on Android.
 */

// ── Config ──────────────────────────────────────────────────
const MEDIA_EXTENSIONS = /\.(m3u8|mp4|ts|mkv|webm|mpd|f4m|flv|avi|mov|wmv|m4v|m4s|aac|opus)(\?|$|#)/i;

const MEDIA_KEYWORDS = /master\.m3u8|index\.m3u8|playlist\.m3u8|chunklist|manifest|video[\-_]?(sd|hd|uhd)|media[\-_]?\d|\.m3u8\?|\.mpd\?|segment[\-_]?\d|init\.mp4|dash[\/\-]|hls[\/\-]/i;

const MEDIA_MIME_TYPES = [
  'application/vnd.apple.mpegurl',
  'application/x-mpegurl',
  'application/dash+xml',
  'video/mp4',
  'video/webm',
  'video/x-flv',
  'video/x-matroska',
  'application/octet-stream',
  'video/mp2t'
];

const QUALITY_PATTERNS = {
  '4K': /4k|2160p|uhd|ultra[\-_]?hd/i,
  'HD': /1080p|720p|hd|high/i,
  'SD': /480p|360p|240p|sd|low|video[\-_]sd/i
};

const SKIP_DOMAINS = [
  'google.com', 'googleapis.com', 'gstatic.com',
  'facebook.com', 'fbcdn.net',
  'doubleclick.net', 'googlesyndication.com',
  'googleadservices.com', 'google-analytics.com',
  'amazon-adsystem.com'
];

const IMPORTANT_HEADERS = [
  'cookie', 'user-agent', 'referer', 'origin',
  'authorization', 'x-requested-with', 'accept',
  'x-csrf-token', 'x-auth-token'
];

const DEDUP_WINDOW_MS = 5000;
const TS_RATE_LIMIT_MS = 10000;
const MAX_STORED_URLS = 200;
const CLEANUP_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── State ───────────────────────────────────────────────────
const recentUrls = new Map(); // urlHash -> timestamp (for dedup)
const tsTracker = new Map();  // domain+tabId -> { count, firstUrl, lastTime }
const pendingHeaders = new Map(); // requestId -> headers
let snifferEnabled = true;

// ── Initialize ──────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ snifferEnabled: true, sniffedUrls: [] });
  console.log('[TrickFunda Sniffer] Extension installed');
});

chrome.storage.local.get('snifferEnabled', (data) => {
  snifferEnabled = data.snifferEnabled !== false;
});

// Clean old entries on startup
cleanupOldEntries();

// ── Header Capture ──────────────────────────────────────────
chrome.webRequest.onSendHeaders.addListener(
  (details) => {
    if (!snifferEnabled) return;
    if (!details.requestHeaders) return;

    // Store headers keyed by requestId for later use
    const headers = {};
    for (const header of details.requestHeaders) {
      if (IMPORTANT_HEADERS.includes(header.name.toLowerCase())) {
        headers[header.name] = header.value;
      }
    }
    if (Object.keys(headers).length > 0) {
      pendingHeaders.set(details.requestId, headers);
      // Auto-cleanup after 30 seconds
      setTimeout(() => pendingHeaders.delete(details.requestId), 30000);
    }
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders', 'extraHeaders']
);

// ── Request Interception ────────────────────────────────────
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!snifferEnabled) return;
    if (details.type === 'main_frame') return; // Skip page navigations

    const url = details.url;
    
    // Skip ad/tracking domains
    try {
      const hostname = new URL(url).hostname;
      if (SKIP_DOMAINS.some(d => hostname.endsWith(d))) return;
    } catch { return; }

    // Check if this is a media URL
    const isMediaExt = MEDIA_EXTENSIONS.test(url);
    const isMediaKeyword = MEDIA_KEYWORDS.test(url);

    if (!isMediaExt && !isMediaKeyword) return;

    // Dedup check
    const urlHash = getUrlHash(url, details.tabId);
    const now = Date.now();
    if (recentUrls.has(urlHash) && (now - recentUrls.get(urlHash)) < DEDUP_WINDOW_MS) {
      return;
    }
    recentUrls.set(urlHash, now);

    // Rate limit .ts segments
    const mediaType = detectMediaType(url);
    if (mediaType === 'ts') {
      const tsKey = getDomain(url) + ':' + details.tabId;
      const tracker = tsTracker.get(tsKey);
      if (tracker && (now - tracker.lastTime) < TS_RATE_LIMIT_MS) {
        tracker.count++;
        tracker.lastTime = now;
        tsTracker.set(tsKey, tracker);
        return; // Skip this .ts segment
      }
      tsTracker.set(tsKey, { count: 1, firstUrl: url, lastTime: now });
    }

    // Build the sniffed result
    const headers = pendingHeaders.get(details.requestId) || {};
    pendingHeaders.delete(details.requestId);

    const result = {
      id: generateId(),
      url: url,
      type: mediaType,
      quality: detectQuality(url),
      domain: getDomain(url),
      tabTitle: '',
      headers: headers,
      tokens: extractTokens(url),
      timestamp: now,
      tabId: details.tabId
    };

    // Get tab title
    if (details.tabId > 0) {
      chrome.tabs.get(details.tabId, (tab) => {
        if (chrome.runtime.lastError) {
          result.tabTitle = 'Unknown Tab';
        } else {
          result.tabTitle = tab?.title || 'Unknown Tab';
        }
        processResult(result);
      });
    } else {
      result.tabTitle = 'Background Request';
      processResult(result);
    }
  },
  { urls: ['<all_urls>'] }
);

// ── Also check response headers for MIME type ───────────────
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (!snifferEnabled) return;
    if (details.type === 'main_frame') return;

    const contentType = details.responseHeaders?.find(
      h => h.name.toLowerCase() === 'content-type'
    )?.value?.toLowerCase() || '';

    const isMediaMime = MEDIA_MIME_TYPES.some(m => contentType.includes(m));
    if (!isMediaMime) return;

    // Only process if we haven't already caught this via URL pattern
    const urlHash = getUrlHash(details.url, details.tabId);
    if (recentUrls.has(urlHash)) return;
    recentUrls.set(urlHash, Date.now());

    const headers = pendingHeaders.get(details.requestId) || {};
    pendingHeaders.delete(details.requestId);

    const result = {
      id: generateId(),
      url: details.url,
      type: detectMediaType(details.url) || mimeToType(contentType),
      quality: detectQuality(details.url),
      domain: getDomain(details.url),
      tabTitle: '',
      headers: headers,
      tokens: extractTokens(details.url),
      timestamp: Date.now(),
      tabId: details.tabId
    };

    if (details.tabId > 0) {
      chrome.tabs.get(details.tabId, (tab) => {
        if (chrome.runtime.lastError) {
          result.tabTitle = 'Unknown Tab';
        } else {
          result.tabTitle = tab?.title || 'Unknown Tab';
        }
        processResult(result);
      });
    } else {
      result.tabTitle = 'Background Request';
      processResult(result);
    }
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

// ── Process & Store Result ──────────────────────────────────
function processResult(result) {
  // Store in chrome.storage.local
  chrome.storage.local.get('sniffedUrls', (data) => {
    let urls = data.sniffedUrls || [];
    urls.unshift(result); // Add to front
    if (urls.length > MAX_STORED_URLS) {
      urls = urls.slice(0, MAX_STORED_URLS);
    }
    chrome.storage.local.set({ sniffedUrls: urls });
  });

  // Update badge
  chrome.storage.local.get('sniffedUrls', (data) => {
    const count = (data.sniffedUrls || []).length;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
  });

  // Send to content script (which bridges to dashboard)
  if (result.tabId > 0) {
    chrome.tabs.sendMessage(result.tabId, {
      type: 'SNIFFER_RESULT',
      data: result
    }).catch(() => {
      // Content script may not be loaded on this tab
    });
  }

  // Also broadcast to ALL tabs (in case dashboard is on a different tab)
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.id && tab.id !== result.tabId) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SNIFFER_RESULT',
          data: result
        }).catch(() => {});
      }
    }
  });

  console.log(`[TrickFunda Sniffer] Found: ${result.type.toUpperCase()} | ${result.quality} | ${result.domain}`);
}

// ── Message Handler (from popup / content script) ───────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_ALL_RESULTS':
      chrome.storage.local.get('sniffedUrls', (data) => {
        sendResponse({ urls: data.sniffedUrls || [] });
      });
      return true; // async response

    case 'GET_TAB_RESULTS':
      chrome.storage.local.get('sniffedUrls', (data) => {
        const urls = (data.sniffedUrls || []).filter(u => u.tabId === message.tabId);
        sendResponse({ urls });
      });
      return true;

    case 'CLEAR_RESULTS':
      chrome.storage.local.set({ sniffedUrls: [] });
      chrome.action.setBadgeText({ text: '' });
      // Notify all tabs
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'SNIFFER_CLEARED' }).catch(() => {});
          }
        }
      });
      sendResponse({ success: true });
      return true;

    case 'TOGGLE_SNIFFER':
      snifferEnabled = message.enabled;
      chrome.storage.local.set({ snifferEnabled: message.enabled });
      sendResponse({ enabled: snifferEnabled });
      return true;

    case 'GET_STATUS':
      sendResponse({ enabled: snifferEnabled, version: '1.0.0' });
      return true;

    case 'PING':
      sendResponse({ pong: true, version: '1.0.0' });
      return true;
  }
});

// ── Helper Functions ────────────────────────────────────────

function detectMediaType(url) {
  const lower = url.toLowerCase();
  if (/\.m3u8(\?|$|#)/i.test(lower)) return 'm3u8';
  if (/\.mp4(\?|$|#)/i.test(lower)) return 'mp4';
  if (/\.ts(\?|$|#)/i.test(lower)) return 'ts';
  if (/\.mpd(\?|$|#)/i.test(lower)) return 'mpd';
  if (/\.webm(\?|$|#)/i.test(lower)) return 'mp4';
  if (/\.mkv(\?|$|#)/i.test(lower)) return 'mp4';
  if (/\.m4s(\?|$|#)/i.test(lower)) return 'ts';
  return 'other';
}

function mimeToType(mime) {
  if (mime.includes('mpegurl')) return 'm3u8';
  if (mime.includes('mp4')) return 'mp4';
  if (mime.includes('mp2t')) return 'ts';
  if (mime.includes('dash')) return 'mpd';
  if (mime.includes('webm')) return 'mp4';
  return 'other';
}

function detectQuality(url) {
  for (const [quality, pattern] of Object.entries(QUALITY_PATTERNS)) {
    if (pattern.test(url)) return quality;
  }
  return 'Unknown';
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

function getUrlHash(url, tabId) {
  // Strip query params for dedup (but keep path)
  try {
    const u = new URL(url);
    return u.origin + u.pathname + ':' + tabId;
  } catch {
    return url + ':' + tabId;
  }
}

function extractTokens(url) {
  const tokens = {};
  try {
    const params = new URL(url).searchParams;
    const tokenKeys = ['Signature', 'Expires', 'Key-Pair-Id', 'Policy', 'token', 'key', 'auth', 'sig', 'exp', 'hash'];
    for (const key of tokenKeys) {
      // Case-insensitive search
      for (const [k, v] of params.entries()) {
        if (k.toLowerCase() === key.toLowerCase() && v) {
          tokens[k] = v;
        }
      }
    }
  } catch {}
  return tokens;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function cleanupOldEntries() {
  chrome.storage.local.get('sniffedUrls', (data) => {
    const urls = data.sniffedUrls || [];
    const cutoff = Date.now() - CLEANUP_AGE_MS;
    const cleaned = urls.filter(u => u.timestamp > cutoff);
    if (cleaned.length !== urls.length) {
      chrome.storage.local.set({ sniffedUrls: cleaned });
      console.log(`[TrickFunda Sniffer] Cleaned ${urls.length - cleaned.length} old entries`);
    }
  });

  // Also clean the dedup map
  const now = Date.now();
  for (const [key, time] of recentUrls.entries()) {
    if (now - time > 60000) recentUrls.delete(key);
  }
}

// Periodic cleanup every 5 minutes
setInterval(cleanupOldEntries, 5 * 60 * 1000);
