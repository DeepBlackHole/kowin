// Popup UI Controller

function updateStatus(message) {
  document.getElementById('status').textContent = message;
}

function sendMessageToContent(action, data = {}) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {action, ...data}, function(response) {
        if (chrome.runtime.lastError) {
          updateStatus('Error: Extension not loaded on this page');
          console.error(chrome.runtime.lastError);
        } else if (response) {
          updateStatus(response.message || 'Action completed');
        }
      });
    }
  });
}

// Highlight Now button
document.getElementById('highlightNow').addEventListener('click', function() {
  updateStatus('Highlighting questions...');
  sendMessageToContent('highlightNow');
});

// Inspect Mode button
document.getElementById('inspectMode').addEventListener('click', function() {
  updateStatus('Inspect mode activated!');
  sendMessageToContent('inspectMode');
});

// Highlight ALL Text button
document.getElementById('highlightAll').addEventListener('click', function() {
  updateStatus('Highlighting all text elements...');
  sendMessageToContent('highlightAll');
});

// Clear Highlights button
document.getElementById('clearHighlights').addEventListener('click', function() {
  updateStatus('Cleared all highlights');
  sendMessageToContent('clearHighlights');
});

// Debug Toggle
document.getElementById('debugToggle').addEventListener('change', function(e) {
  sendMessageToContent('toggleDebug', {enabled: e.target.checked});
  updateStatus(e.target.checked ? 'Debug panel enabled' : 'Debug panel disabled');
});

// Auto-scan Toggle
document.getElementById('autoScanToggle').addEventListener('change', function(e) {
  sendMessageToContent('toggleAutoScan', {enabled: e.target.checked});
  updateStatus(e.target.checked ? 'Auto-scan enabled' : 'Auto-scan disabled');
});

// Load saved settings
chrome.storage.sync.get(['debugMode', 'autoScan'], function(result) {
  document.getElementById('debugToggle').checked = result.debugMode !== false;
  document.getElementById('autoScanToggle').checked = result.autoScan !== false;
});
