// Popup UI Controller for Kahoot AI Solver

function updateStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.background = isError ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)';

  setTimeout(() => {
    status.style.background = 'rgba(255, 255, 255, 0.1)';
  }, 3000);
}

function sendMessageToContent(action, data = {}) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {action, ...data}, function(response) {
        if (chrome.runtime.lastError) {
          updateStatus('Error: Not on a Kahoot page', true);
          console.error(chrome.runtime.lastError);
        } else if (response) {
          updateStatus(response.message || 'Action completed');
        }
      });
    }
  });
}

// Save Settings
document.getElementById('saveSettings').addEventListener('click', function() {
  const aiProvider = document.getElementById('aiProvider').value;
  const apiKey = document.getElementById('apiKey').value;

  if (!apiKey) {
    updateStatus('Please enter an API key', true);
    return;
  }

  chrome.storage.sync.set({
    aiProvider: aiProvider,
    apiKey: apiKey
  }, function() {
    updateStatus('✅ Settings saved!');
    // Clear the API key field for security
    setTimeout(() => {
      document.getElementById('apiKey').value = '';
    }, 1000);
  });
});

// Solve Now
document.getElementById('solveNow').addEventListener('click', function() {
  // First check if API key is configured
  chrome.storage.sync.get(['apiKey'], function(result) {
    if (!result.apiKey) {
      updateStatus('⚠️ Please configure API key first', true);
      return;
    }

    updateStatus('🤖 Processing question...');
    sendMessageToContent('solveNow');
  });
});

// Clear Highlights
document.getElementById('clearHighlights').addEventListener('click', function() {
  updateStatus('Clearing highlights...');
  sendMessageToContent('clearHighlights');
});

// Debug Toggle
document.getElementById('debugToggle').addEventListener('change', function(e) {
  sendMessageToContent('toggleDebug', {enabled: e.target.checked});
  updateStatus(e.target.checked ? 'Debug panel enabled' : 'Debug panel disabled');
  chrome.storage.sync.set({debugMode: e.target.checked});
});

// Load saved settings on popup open
chrome.storage.sync.get(['aiProvider', 'debugMode'], function(result) {
  if (result.aiProvider) {
    document.getElementById('aiProvider').value = result.aiProvider;
  }
  document.getElementById('debugToggle').checked = result.debugMode || false;
});

// Show current provider status
chrome.storage.sync.get(['aiProvider', 'apiKey'], function(result) {
  if (result.apiKey) {
    const provider = result.aiProvider || 'openai';
    updateStatus(`✅ ${provider.toUpperCase()} configured`);
  } else {
    updateStatus('⚠️ Please configure API key');
  }
});
