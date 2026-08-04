/**
 * TrickFunda Video Sniffer — Content Script
 * 
 * Bridge between the Chrome Extension background service worker
 * and the TrickFunda dashboard page. Handles message passing
 * in both directions via window.postMessage.
 */

// ── Listen for messages from Background Service Worker ──────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'SNIFFER_RESULT':
      // Forward sniffed URL to the page (dashboard listens for this)
      window.postMessage({
        type: 'TRICKFUNDA_SNIFFER_RESULT',
        data: message.data,
        source: 'trickfunda-sniffer-extension'
      }, '*');
      break;

    case 'SNIFFER_CLEARED':
      window.postMessage({
        type: 'TRICKFUNDA_SNIFFER_CLEARED',
        source: 'trickfunda-sniffer-extension'
      }, '*');
      break;
  }
});

// ── Listen for messages from the TrickFunda Dashboard Page ──
window.addEventListener('message', async (event) => {
  // Only accept messages from the same page
  if (event.source !== window) return;
  if (!event.data || event.data.source === 'trickfunda-sniffer-extension') return;

  switch (event.data.type) {
    case 'TRICKFUNDA_SNIFFER_PING':
      // Dashboard is checking if extension is installed
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
        window.postMessage({
          type: 'TRICKFUNDA_SNIFFER_PONG',
          data: {
            connected: true,
            version: response?.version || '1.0.0',
            enabled: response?.enabled !== false
          },
          source: 'trickfunda-sniffer-extension'
        }, '*');
      } catch (err) {
        window.postMessage({
          type: 'TRICKFUNDA_SNIFFER_PONG',
          data: { connected: false, error: err.message },
          source: 'trickfunda-sniffer-extension'
        }, '*');
      }
      break;

    case 'TRICKFUNDA_SNIFFER_GET_ALL':
      // Dashboard requests all stored URLs
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_ALL_RESULTS' });
        window.postMessage({
          type: 'TRICKFUNDA_SNIFFER_ALL_RESULTS',
          data: response?.urls || [],
          source: 'trickfunda-sniffer-extension'
        }, '*');
      } catch (err) {
        window.postMessage({
          type: 'TRICKFUNDA_SNIFFER_ALL_RESULTS',
          data: [],
          error: err.message,
          source: 'trickfunda-sniffer-extension'
        }, '*');
      }
      break;

    case 'TRICKFUNDA_SNIFFER_CLEAR':
      // Dashboard requests clearing all results
      try {
        await chrome.runtime.sendMessage({ type: 'CLEAR_RESULTS' });
        window.postMessage({
          type: 'TRICKFUNDA_SNIFFER_CLEARED',
          source: 'trickfunda-sniffer-extension'
        }, '*');
      } catch (err) {
        console.error('[TrickFunda Sniffer] Clear error:', err);
      }
      break;

    case 'TRICKFUNDA_SNIFFER_TOGGLE':
      // Dashboard toggles sniffer on/off
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'TOGGLE_SNIFFER',
          enabled: event.data.enabled
        });
        window.postMessage({
          type: 'TRICKFUNDA_SNIFFER_STATUS',
          data: { enabled: response?.enabled },
          source: 'trickfunda-sniffer-extension'
        }, '*');
      } catch (err) {
        console.error('[TrickFunda Sniffer] Toggle error:', err);
      }
      break;
  }
});

// ── Auto-announce on load ───────────────────────────────────
// Let the page know the extension is present (useful if dashboard loads first)
setTimeout(() => {
  window.postMessage({
    type: 'TRICKFUNDA_SNIFFER_READY',
    data: { version: '1.0.0' },
    source: 'trickfunda-sniffer-extension'
  }, '*');
}, 500);
