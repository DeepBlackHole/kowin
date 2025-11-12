// Kahoot AI Solver - Content Script
// Detects questions and answer choices, sends to AI, and highlights correct answer

(function() {
  'use strict';

  const config = {
    debugMode: true,
    highlightClass: 'kahoot-ai-highlight',
    questionCheckInterval: 2000,
    questionSelectors: [
      '[data-functional-selector*="question"]',
      '[data-testid*="question"]',
      '[class*="question__QuestionText"]',
      '[class*="question-text"]',
      '[class*="questionText"]',
      'h1[class*="question"]',
      'h2[class*="question"]',
      'h3[class*="question"]',
      '[class*="block__Block"]',
      '[class*="Question"]'
    ],
    answerSelectors: [
      '[data-functional-selector*="answer"]',
      '[data-testid*="answer"]',
      '[class*="answer"]',
      '[class*="choice"]',
      '[class*="option"]',
      'button[class*="block"]',
      '[role="button"]'
    ]
  };

  let debugPanel = null;
  let currentQuestion = null;
  let currentAnswers = [];
  let isProcessing = false;

  // Debug panel functions
  function createDebugPanel() {
    if (debugPanel) return;

    debugPanel = document.createElement('div');
    debugPanel.id = 'kahoot-ai-debug';
    debugPanel.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 450px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.95);
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
    header.textContent = '🤖 KAHOOT AI SOLVER';

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
    `;
    closeBtn.onclick = () => debugPanel.remove();

    const logContainer = document.createElement('div');
    logContainer.id = 'kahoot-ai-log';

    debugPanel.appendChild(closeBtn);
    debugPanel.appendChild(header);
    debugPanel.appendChild(logContainer);
    document.body.appendChild(debugPanel);
  }

  function log(message, type = 'info') {
    const colors = {
      info: '#0f0',
      success: '#FFD700',
      error: '#f00',
      warning: '#ff9900'
    };

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(`Kahoot AI: ${message}`);

    if (config.debugMode && debugPanel) {
      const logContainer = document.getElementById('kahoot-ai-log');
      const entry = document.createElement('div');
      entry.style.cssText = `color: ${colors[type]}; margin: 5px 0; padding: 3px; border-left: 3px solid ${colors[type]}; padding-left: 8px;`;
      entry.textContent = logEntry;
      logContainer.appendChild(entry);
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }

  // Show notification
  function showNotification(message, type = 'info') {
    const colors = {
      info: '#2196F3',
      success: '#4CAF50',
      error: '#f44336',
      warning: '#ff9800'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-weight: bold;
      max-width: 300px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  // Detect question on page
  function detectQuestion() {
    for (const selector of config.questionSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent.trim();

          // Check if it looks like a question
          const rect = element.getBoundingClientRect();
          if (text.length > 10 && text.length < 500 && rect.width > 100 && rect.height > 20) {
            // Additional validation - should have question characteristics
            const hasQuestionMark = text.includes('?');
            const startsWithQuestionWord = /^(what|who|where|when|why|how|which|can|could|would|should|is|are|do|does|did)/i.test(text);
            const wordCount = text.split(/\s+/).length;

            if ((hasQuestionMark || startsWithQuestionWord) && wordCount >= 3) {
              return text;
            }
          }
        }
      } catch (e) {
        // Skip invalid selectors
      }
    }
    return null;
  }

  // Detect answer choices on page
  function detectAnswers() {
    const answers = [];
    const seenTexts = new Set();

    for (const selector of config.answerSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent.trim();
          const rect = element.getBoundingClientRect();

          // Valid answer: visible, reasonable size, not too long, clickable
          if (text.length > 0 &&
              text.length < 200 &&
              rect.width > 50 &&
              rect.height > 20 &&
              rect.width < window.innerWidth * 0.8 &&
              !seenTexts.has(text)) {

            // Check if element is clickable
            const isClickable = element.tagName === 'BUTTON' ||
                               element.onclick !== null ||
                               element.getAttribute('role') === 'button' ||
                               window.getComputedStyle(element).cursor === 'pointer';

            if (isClickable) {
              answers.push({
                text: text,
                element: element
              });
              seenTexts.add(text);
            }
          }
        }
      } catch (e) {
        // Skip invalid selectors
      }
    }

    // Filter to likely answer set (usually 2-4 answers)
    // Remove duplicates and non-answer elements
    const filtered = answers.filter((answer, index) => {
      // Keep if word count is reasonable for an answer
      const wordCount = answer.text.split(/\s+/).length;
      return wordCount > 0 && wordCount < 50;
    });

    // If we have 2-6 answers, return them
    if (filtered.length >= 2 && filtered.length <= 6) {
      return filtered;
    }

    return [];
  }

  // Send question to AI and get answer
  async function getAIAnswer(question, answerChoices) {
    log(`Sending to AI: "${question.substring(0, 50)}..."`, 'info');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getAIAnswer',
        question: question,
        choices: answerChoices.map(a => a.text)
      });

      if (response.error) {
        log(`AI Error: ${response.error}`, 'error');
        showNotification(`Error: ${response.error}`, 'error');
        return null;
      }

      log(`AI Response: ${response.answer}`, 'success');
      return response.answer;
    } catch (error) {
      log(`Error communicating with background: ${error.message}`, 'error');
      showNotification(`Extension error: ${error.message}`, 'error');
      return null;
    }
  }

  // Highlight the correct answer
  function highlightAnswer(answerText) {
    log(`Highlighting answer: "${answerText}"`, 'success');

    // Find the answer element that best matches
    let bestMatch = null;
    let bestScore = 0;

    for (const answer of currentAnswers) {
      // Calculate similarity score
      const answerLower = answer.text.toLowerCase().trim();
      const targetLower = answerText.toLowerCase().trim();

      // Exact match
      if (answerLower === targetLower) {
        bestMatch = answer;
        break;
      }

      // Contains match
      if (answerLower.includes(targetLower) || targetLower.includes(answerLower)) {
        const score = Math.min(answerLower.length, targetLower.length) / Math.max(answerLower.length, targetLower.length);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = answer;
        }
      }
    }

    if (bestMatch) {
      bestMatch.element.classList.add(config.highlightClass);
      bestMatch.element.setAttribute('data-ai-answer', 'true');
      log(`Answer highlighted successfully!`, 'success');
      showNotification(`✅ Answer highlighted!`, 'success');

      // Scroll to the answer
      bestMatch.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      log(`Could not find matching answer element`, 'warning');
      showNotification(`Answer: ${answerText}`, 'info');
    }
  }

  // Clear previous highlights
  function clearHighlights() {
    const highlighted = document.querySelectorAll(`.${config.highlightClass}`);
    highlighted.forEach(el => {
      el.classList.remove(config.highlightClass);
      el.removeAttribute('data-ai-answer');
    });
  }

  // Main processing function
  async function processQuestion() {
    if (isProcessing) {
      return; // Avoid duplicate processing
    }

    const question = detectQuestion();
    const answers = detectAnswers();

    // Check if this is a new question
    if (!question || answers.length === 0) {
      return;
    }

    // Skip if same question
    if (currentQuestion === question && currentAnswers.length > 0) {
      return;
    }

    isProcessing = true;
    currentQuestion = question;
    currentAnswers = answers;

    log(`Question detected: "${question.substring(0, 60)}..."`, 'info');
    log(`Found ${answers.length} answer choices`, 'info');
    answers.forEach((a, i) => log(`  ${i + 1}. ${a.text}`, 'info'));

    // Clear previous highlights
    clearHighlights();

    // Get AI answer
    const aiAnswer = await getAIAnswer(question, answers);

    if (aiAnswer) {
      highlightAnswer(aiAnswer);
    }

    isProcessing = false;
  }

  // Message listener for popup commands
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.action) {
      case 'solveNow':
        log('Manual solve triggered', 'info');
        processQuestion();
        sendResponse({message: 'Processing...'});
        break;

      case 'clearHighlights':
        clearHighlights();
        currentQuestion = null;
        currentAnswers = [];
        log('Highlights cleared', 'info');
        sendResponse({message: 'Cleared'});
        break;

      case 'toggleDebug':
        config.debugMode = request.enabled;
        if (request.enabled) {
          createDebugPanel();
        } else if (debugPanel) {
          debugPanel.remove();
          debugPanel = null;
        }
        sendResponse({message: 'Debug toggled'});
        break;
    }
    return true;
  });

  // Initialize
  function init() {
    log('Kahoot AI Solver initialized', 'success');

    if (config.debugMode) {
      setTimeout(() => createDebugPanel(), 500);
    }

    showNotification('🤖 Kahoot AI Solver Active', 'info');

    // Set up MutationObserver for dynamic content
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          shouldCheck = true;
        }
      });
      if (shouldCheck) {
        setTimeout(processQuestion, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Periodic check for new questions
    setInterval(() => {
      processQuestion();
    }, config.questionCheckInterval);

    // Initial check
    setTimeout(processQuestion, 1000);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
