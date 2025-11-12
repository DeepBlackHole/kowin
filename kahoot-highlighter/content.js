// Kahoot Question Highlighter
// This script highlights questions on Kahoot pages

(function() {
  'use strict';

  // Configuration
  const config = {
    highlightClass: 'kahoot-question-highlight',
    debugMode: true, // Enable debug mode
    // Comprehensive selectors for Kahoot question elements
    questionSelectors: [
      // Data attributes
      '[data-functional-selector*="question"]',
      '[data-testid*="question"]',

      // Class-based selectors (various patterns)
      '[class*="question__QuestionText"]',
      '[class*="question-text"]',
      '[class*="questionText"]',
      '[class*="question_text"]',
      '[class*="question-title"]',
      '[class*="questionTitle"]',
      '[class*="QuestionMain"]',
      '[class*="Question-module"]',
      '[class*="question-container"]',
      '[class*="question-wrapper"]',

      // Heading elements
      'h1[class*="question"]',
      'h2[class*="question"]',
      'h3[class*="question"]',
      'div[role="heading"]',

      // Kahoot-specific patterns
      '[class*="block__Block"]',
      '[class*="question__Question"]',
      'div[class*="styles__"]',

      // Generic fallbacks - look for large text containers
      'div[class*="text-"] > span',
      'div[class*="Text"] > span',

      // Try to find quiz/game question areas
      '[class*="quiz"]',
      '[class*="game-block"]',
      'main [class*="question"]'
    ]
  };

  // Debug panel
  let debugPanel = null;
  let debugLog = [];

  function createDebugPanel() {
    if (debugPanel) return;

    debugPanel = document.createElement('div');
    debugPanel.id = 'kahoot-debug-panel';
    debugPanel.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 400px;
      max-height: 300px;
      background: rgba(0, 0, 0, 0.9);
      color: #0f0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 15px;
      border-radius: 8px;
      border: 2px solid #0f0;
      z-index: 999999;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
    `;

    const header = document.createElement('div');
    header.style.cssText = 'font-weight: bold; margin-bottom: 10px; color: #FFD700; font-size: 14px;';
    header.textContent = '🎯 KAHOOT HIGHLIGHTER DEBUG';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 5px;
      right: 10px;
      background: transparent;
      color: #0f0;
      border: none;
      font-size: 24px;
      cursor: pointer;
      font-weight: bold;
    `;
    closeBtn.onclick = () => debugPanel.remove();

    const logContainer = document.createElement('div');
    logContainer.id = 'kahoot-debug-log';
    logContainer.style.cssText = 'max-height: 240px; overflow-y: auto;';

    debugPanel.appendChild(closeBtn);
    debugPanel.appendChild(header);
    debugPanel.appendChild(logContainer);
    document.body.appendChild(debugPanel);
  }

  function addDebugLog(message, type = 'info') {
    const colors = {
      info: '#0f0',
      success: '#FFD700',
      error: '#f00',
      warning: '#ff9900'
    };

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    debugLog.push(logEntry);
    console.log(`Kahoot Highlighter: ${message}`);

    if (config.debugMode && debugPanel) {
      const logContainer = document.getElementById('kahoot-debug-log');
      const entry = document.createElement('div');
      entry.style.cssText = `color: ${colors[type]}; margin: 5px 0; padding: 3px; border-left: 3px solid ${colors[type]}; padding-left: 8px;`;
      entry.textContent = logEntry;
      logContainer.appendChild(entry);
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }

  // Function to highlight question elements
  function highlightQuestions() {
    let questionsFound = false;
    let totalFound = 0;
    const foundSelectors = [];

    config.questionSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          foundSelectors.push(`${selector}: ${elements.length} element(s)`);
          addDebugLog(`Found ${elements.length} with: ${selector}`, 'info');
        }
        elements.forEach(element => {
          if (!element.classList.contains(config.highlightClass)) {
            // Skip very small elements (likely not questions)
            const rect = element.getBoundingClientRect();
            if (rect.width < 50 || rect.height < 20) {
              return;
            }

            element.classList.add(config.highlightClass);
            questionsFound = true;
            totalFound++;
            element.setAttribute('data-kahoot-highlighted', 'true');

            // Log the text content
            const text = element.textContent.trim().substring(0, 50);
            addDebugLog(`Highlighted: "${text}..."`, 'success');
          }
        });
      } catch (e) {
        addDebugLog(`Error with selector ${selector}: ${e.message}`, 'error');
      }
    });

    if (totalFound > 0) {
      addDebugLog(`✓ Total highlighted: ${totalFound} question(s)`, 'success');
    } else {
      addDebugLog('⚠ No questions found yet', 'warning');
    }

    return questionsFound;
  }

  // Show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #FFD700;
      color: #000;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-weight: bold;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Intelligent text-based question detection
  function highlightByTextPattern() {
    addDebugLog('Running intelligent text detection...', 'info');
    let found = 0;

    // Find all text elements
    const allElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6');

    allElements.forEach(element => {
      const text = element.textContent.trim();

      // Question patterns
      const hasQuestionMark = text.includes('?');
      const startsWithQuestion = /^(what|who|where|when|why|how|which|can|could|would|should|is|are|do|does|did)/i.test(text);
      const isLongEnough = text.length > 10 && text.length < 500;
      const hasMultipleWords = text.split(/\s+/).length >= 3;

      // If it looks like a question
      if (isLongEnough && hasMultipleWords && (hasQuestionMark || startsWithQuestion)) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 100 && rect.height > 20 && !element.classList.contains(config.highlightClass)) {
          element.classList.add(config.highlightClass);
          element.setAttribute('data-kahoot-highlighted', 'true');
          found++;
          addDebugLog(`Smart detect: "${text.substring(0, 40)}..."`, 'success');
        }
      }
    });

    addDebugLog(`Smart detection found ${found} questions`, found > 0 ? 'success' : 'warning');
    return found;
  }

  // Inspect mode - show ALL possible elements
  function enableInspectMode() {
    addDebugLog('Inspect mode activated!', 'success');

    const overlay = document.createElement('div');
    overlay.id = 'kahoot-inspect-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: Arial, sans-serif;
    `;

    const info = document.createElement('div');
    info.style.cssText = 'text-align: center; padding: 30px; background: rgba(0,0,0,0.9); border-radius: 10px;';
    info.innerHTML = `
      <h2 style="color: #FFD700; margin-bottom: 20px;">🔍 INSPECT MODE</h2>
      <p style="font-size: 16px; margin-bottom: 20px;">Hover over elements to see them highlighted</p>
      <p style="font-size: 14px; color: #aaa;">Click on an element to mark it</p>
      <button id="exitInspect" style="
        padding: 10px 20px;
        background: #FFD700;
        border: none;
        border-radius: 5px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 20px;
      ">Exit Inspect Mode</button>
    `;

    overlay.appendChild(info);
    document.body.appendChild(overlay);

    let hoverElement = null;

    function highlightOnHover(e) {
      if (e.target.id === 'kahoot-inspect-overlay' || e.target.closest('#kahoot-inspect-overlay')) return;

      if (hoverElement) {
        hoverElement.style.outline = '';
      }

      hoverElement = e.target;
      hoverElement.style.outline = '3px solid #00ff00';
    }

    function markOnClick(e) {
      if (e.target.id === 'exitInspect' || e.target.closest('#exitInspect')) {
        cleanup();
        return;
      }

      if (e.target.id === 'kahoot-inspect-overlay' || e.target.closest('#kahoot-inspect-overlay')) return;

      e.preventDefault();
      e.stopPropagation();

      e.target.classList.add(config.highlightClass);
      e.target.setAttribute('data-kahoot-highlighted', 'true');
      addDebugLog(`Manually marked: ${e.target.tagName}`, 'success');
    }

    function cleanup() {
      document.removeEventListener('mouseover', highlightOnHover);
      document.removeEventListener('click', markOnClick);
      overlay.remove();
      if (hoverElement) hoverElement.style.outline = '';
      addDebugLog('Inspect mode deactivated', 'info');
    }

    document.getElementById('exitInspect').addEventListener('click', cleanup);
    document.addEventListener('mouseover', highlightOnHover);
    document.addEventListener('click', markOnClick);

    setTimeout(() => info.remove(), 3000);
  }

  // Highlight ALL text elements
  function highlightAllText() {
    addDebugLog('Highlighting ALL text elements...', 'info');
    let found = 0;

    const textElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li, td, th, label');

    textElements.forEach(element => {
      const text = element.textContent.trim();
      if (text.length > 10) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 50 && rect.height > 15) {
          element.classList.add(config.highlightClass);
          element.setAttribute('data-kahoot-highlighted', 'true');
          found++;
        }
      }
    });

    addDebugLog(`Highlighted ${found} text elements`, 'success');
    showNotification(`✨ Highlighted ${found} elements`);
    return found;
  }

  // Clear all highlights
  function clearAllHighlights() {
    const highlighted = document.querySelectorAll('.kahoot-question-highlight');
    highlighted.forEach(el => {
      el.classList.remove(config.highlightClass);
      el.removeAttribute('data-kahoot-highlighted');
    });
    addDebugLog(`Cleared ${highlighted.length} highlights`, 'info');
    showNotification('🧹 All highlights cleared');
  }

  // Message listener for popup commands
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    addDebugLog(`Received command: ${request.action}`, 'info');

    switch(request.action) {
      case 'highlightNow':
        const count = highlightQuestions();
        const smartCount = highlightByTextPattern();
        sendResponse({message: `Found ${count + smartCount} questions`});
        showNotification(`✓ Highlighted questions!`);
        break;

      case 'inspectMode':
        enableInspectMode();
        sendResponse({message: 'Inspect mode activated'});
        break;

      case 'highlightAll':
        const total = highlightAllText();
        sendResponse({message: `Highlighted ${total} elements`});
        break;

      case 'clearHighlights':
        clearAllHighlights();
        sendResponse({message: 'Highlights cleared'});
        break;

      case 'toggleDebug':
        config.debugMode = request.enabled;
        if (request.enabled) {
          createDebugPanel();
        } else if (debugPanel) {
          debugPanel.remove();
          debugPanel = null;
        }
        chrome.storage.sync.set({debugMode: request.enabled});
        sendResponse({message: 'Debug mode updated'});
        break;

      case 'toggleAutoScan':
        chrome.storage.sync.set({autoScan: request.enabled});
        sendResponse({message: 'Auto-scan updated'});
        break;
    }

    return true; // Keep channel open for async response
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+H to highlight
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      highlightQuestions();
      highlightByTextPattern();
      showNotification('✨ Manual highlight triggered');
    }

    // Ctrl+Shift+I to inspect
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      enableInspectMode();
    }

    // Ctrl+Shift+C to clear
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      clearAllHighlights();
    }
  });

  // Initial highlight attempt
  function init() {
    console.log('Kahoot Question Highlighter: Extension loaded');

    // Create debug panel if in debug mode
    if (config.debugMode) {
      setTimeout(() => {
        createDebugPanel();
        addDebugLog('Extension initialized', 'success');
        addDebugLog(`URL: ${window.location.href}`, 'info');
        addDebugLog(`Loaded ${config.questionSelectors.length} selectors`, 'info');
      }, 500);
    }

    showNotification('🎯 Kahoot Highlighter Active');

    // Try to highlight immediately
    const found = highlightQuestions();
    const smartFound = highlightByTextPattern();
    if (found || smartFound) {
      showNotification(`✓ Found ${found + smartFound} Questions!`);
    }

    // Set up a MutationObserver to watch for dynamic content
    const observer = new MutationObserver((mutations) => {
      // Check if any new nodes were added
      let shouldHighlight = false;

      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          shouldHighlight = true;
        }
      });

      if (shouldHighlight) {
        highlightQuestions();
      }
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });

    // Also try highlighting after delays (for SPAs and dynamic content)
    setTimeout(() => {
      addDebugLog('Running delayed scan (1s)...', 'info');
      highlightQuestions();
      highlightByTextPattern();
    }, 1000);

    setTimeout(() => {
      addDebugLog('Running delayed scan (2s)...', 'info');
      highlightQuestions();
      highlightByTextPattern();
    }, 2000);

    setTimeout(() => {
      addDebugLog('Running delayed scan (3s)...', 'info');
      highlightQuestions();
      highlightByTextPattern();
    }, 3000);

    // Scan every 5 seconds for new questions
    setInterval(() => {
      chrome.storage.sync.get(['autoScan'], function(result) {
        if (result.autoScan !== false) {
          highlightQuestions();
          highlightByTextPattern();
        }
      });
    }, 5000);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();