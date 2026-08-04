/**
 * TrickFunda Video Sniffer — Popup Script
 * 
 * Manages the extension popup UI: loads sniffed URLs,
 * handles toggle, clear, and dashboard navigation.
 */

// ── DOM Elements ────────────────────────────────────────────
const snifferToggle = document.getElementById('snifferToggle');
const urlCount = document.getElementById('urlCount');
const domainCount = document.getElementById('domainCount');
const statusIndicator = document.getElementById('statusIndicator');
const urlList = document.getElementById('urlList');
const emptyState = document.getElementById('emptyState');
const openDashboard = document.getElementById('openDashboard');
const clearAll = document.getElementById('clearAll');

// ── Initialize ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Get sniffer status
  try {
    const status = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
    snifferToggle.checked = status.enabled !== false;
    updateStatusIndicator(status.enabled !== false);
  } catch (err) {
    console.error('Error getting status:', err);
  }

  // Load URLs for current tab
  loadUrls();
});

// ── Load URLs ───────────────────────────────────────────────
async function loadUrls() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_ALL_RESULTS' });
    const urls = response?.urls || [];
    renderUrls(urls);
  } catch (err) {
    console.error('Error loading URLs:', err);
  }
}

// ── Render URLs ─────────────────────────────────────────────
function renderUrls(urls) {
  // Update counts
  urlCount.textContent = urls.length;
  const domains = new Set(urls.map(u => u.domain));
  domainCount.textContent = domains.size;

  // Clear list
  urlList.innerHTML = '';

  if (urls.length === 0) {
    urlList.innerHTML = `
      <div class="empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>No media URLs detected yet</p>
        <span>Browse a page with video content</span>
      </div>
    `;
    return;
  }

  // Show max 15 most recent URLs
  const displayUrls = urls.slice(0, 15);

  for (const item of displayUrls) {
    const el = createUrlItem(item);
    urlList.appendChild(el);
  }

  if (urls.length > 15) {
    const moreEl = document.createElement('div');
    moreEl.style.cssText = 'text-align:center;padding:8px;font-size:11px;color:rgba(255,255,255,0.3)';
    moreEl.textContent = `+${urls.length - 15} more — Open Dashboard to see all`;
    urlList.appendChild(moreEl);
  }
}

// ── Create URL Item ─────────────────────────────────────────
function createUrlItem(item) {
  const div = document.createElement('div');
  div.className = 'url-item';
  div.style.animationDelay = '0ms';

  // Truncate URL for display
  let displayUrl = item.url;
  try {
    const u = new URL(item.url);
    displayUrl = u.pathname + (u.search ? u.search.substring(0, 30) + '...' : '');
  } catch {
    displayUrl = item.url.substring(0, 60) + '...';
  }

  div.innerHTML = `
    <span class="type-badge ${item.type}">${item.type}</span>
    <div class="url-info">
      <div class="url-text" title="${escapeHtml(item.url)}">${escapeHtml(displayUrl)}</div>
      <div class="url-domain">${escapeHtml(item.domain)} · ${getRelativeTime(item.timestamp)}</div>
    </div>
    <button class="url-copy-btn" title="Copy URL">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    </button>
  `;

  // Copy button handler
  const copyBtn = div.querySelector('.url-copy-btn');
  copyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url).then(() => {
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        `;
      }, 1500);
    });
  });

  return div;
}

// ── Toggle Handler ──────────────────────────────────────────
snifferToggle.addEventListener('change', async () => {
  const enabled = snifferToggle.checked;
  try {
    await chrome.runtime.sendMessage({ type: 'TOGGLE_SNIFFER', enabled });
    updateStatusIndicator(enabled);
  } catch (err) {
    console.error('Toggle error:', err);
  }
});

// ── Clear All Handler ───────────────────────────────────────
clearAll.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ type: 'CLEAR_RESULTS' });
    loadUrls();
  } catch (err) {
    console.error('Clear error:', err);
  }
});

// ── Open Dashboard Handler ──────────────────────────────────
openDashboard.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://trickfunda.com/tools/video-sniffer' });
  // Fallback to localhost for dev
  // chrome.tabs.create({ url: 'http://localhost:3000/tools/video-sniffer' });
});

// ── Status Indicator ────────────────────────────────────────
function updateStatusIndicator(enabled) {
  const dot = statusIndicator.querySelector('.status-dot');
  const text = statusIndicator.querySelector('.status-text');
  
  if (enabled) {
    dot.className = 'status-dot active';
    text.textContent = 'Scanning';
  } else {
    dot.className = 'status-dot';
    text.textContent = 'Paused';
  }
}

// ── Helpers ─────────────────────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

// ── Listen for real-time updates ────────────────────────────
chrome.storage.onChanged.addListener((changes) => {
  if (changes.sniffedUrls) {
    renderUrls(changes.sniffedUrls.newValue || []);
  }
});
