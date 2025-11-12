# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains two Chrome extensions for Kahoot:

1. **kahoot-highlighter/** - Basic question highlighter (visual detection only)
2. **kahoot-ai-solver/** - AI-powered solver that detects questions and highlights correct answers

### Kahoot Highlighter
A simple extension that highlights questions on Kahoot game pages using multiple detection strategies including CSS selectors, text pattern analysis, and DOM mutation observation.

### Kahoot AI Solver
An advanced extension that detects Kahoot questions, sends them to AI services (OpenAI or Anthropic), and highlights the correct answer automatically.

## Extension Architecture

### Kahoot Highlighter (kahoot-highlighter/)

**Components:**
- **manifest.json** - Extension configuration (Manifest V3)
  - Runs on `*.kahoot.it/*` and `*.kahoot.com/*` domains
  - Requires `activeTab` and `storage` permissions
  - Injects content script at `document_end` with `all_frames: true`

- **content.js** - Main content script (520 lines)
  - Self-contained IIFE to avoid scope pollution
  - Multi-layer question detection system
  - Message-based communication with popup
  - Keyboard shortcuts handler
  - MutationObserver for dynamic content

- **popup.js/popup.html** - Browser action UI
  - Controls for manual highlighting, inspect mode, and settings
  - Chrome storage integration for persisting preferences
  - Message passing to content script

- **styles.css** - Highlight styling with animations

### Kahoot AI Solver (kahoot-ai-solver/)

**Components:**
- **manifest.json** - Extension configuration with AI API permissions
  - Host permissions for `api.openai.com` and `api.anthropic.com`
  - Background service worker for API calls

- **content.js** - Question/answer detection and highlighting (~400 lines)
  - Detects questions using CSS selectors and text patterns
  - Detects answer choices (2-6 clickable elements)
  - Sends to background worker via message passing
  - Highlights correct answer with green glow effect
  - Debug panel shows real-time processing logs

- **background.js** - Service worker for AI API calls (~150 lines)
  - Handles OpenAI GPT-3.5-turbo API requests
  - Handles Anthropic Claude Haiku API requests
  - Formats prompts with question and answer choices
  - Returns best answer match to content script

- **popup.js/popup.html** - Configuration UI
  - AI provider selection (OpenAI/Anthropic)
  - API key storage (chrome.storage.sync)
  - Manual solve trigger
  - Debug panel toggle

- **styles.css** - Green highlight with pulsing animation and "AI ANSWER" badge

### Question Detection System (Shared by both extensions)

**Question Detection** uses multiple detection layers:

1. **CSS Selector Matching**
   - 30+ selectors in kahoot-highlighter, 10+ in kahoot-ai-solver
   - Data attributes: `[data-functional-selector*="question"]`
   - Class patterns: `[class*="question__QuestionText"]`, etc.
   - Filters out elements < 50px width or < 20px height (highlighter) or < 100px (AI solver)

2. **Intelligent Text Pattern Analysis**
   - Detects question marks and question words (what, who, where, etc.)
   - Validates text length (10-500 chars) and word count (≥3 words)
   - Filters elements by dimensions

3. **MutationObserver**
   - Monitors DOM for dynamically added content
   - Highlighter: Auto-scans every 5 seconds
   - AI Solver: Auto-scans every 2 seconds

### Answer Detection (kahoot-ai-solver only)

**Answer Choice Detection**:
- Searches for clickable elements (buttons, role="button", clickable divs)
- Validates 2-6 answer choices present
- Filters by text length (1-200 chars) and dimensions (>50px width, >20px height)
- Removes duplicates using Set
- Returns array of {text, element} objects

### Features

**Kahoot Highlighter:**
- **Inspect Mode** (`enableInspectMode()`) - Hover and click to manually mark elements
- **Highlight All Text** (`highlightAllText()`) - Debug feature to highlight all text elements
- **Debug Panel** - Real-time logging overlay (bottom-left, toggleable)
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+H` - Manual highlight
  - `Ctrl+Shift+I` - Inspect mode
  - `Ctrl+Shift+C` - Clear highlights

**Kahoot AI Solver:**
- **AI Answer Detection** - Automatically sends questions to AI and gets answers
- **Visual Highlighting** - Green glow with "AI ANSWER" badge
- **Debug Panel** - Shows question detection, AI requests, and responses
- **Manual Trigger** - Solve button in popup for on-demand solving
- **Multiple AI Providers** - OpenAI GPT-3.5 or Anthropic Claude Haiku

### Message Protocol

**Kahoot Highlighter** - Content script listens for:
- `highlightNow` - Trigger both detection methods
- `inspectMode` - Enable inspect overlay
- `highlightAll` - Highlight all text elements
- `clearHighlights` - Remove all highlights
- `toggleDebug` - Show/hide debug panel
- `toggleAutoScan` - Enable/disable periodic scanning

**Kahoot AI Solver** - Message flow:
- Content → Background: `{action: 'getAIAnswer', question, choices}`
- Background → AI API: Formatted prompt with question and choices
- Background → Content: `{answer}` or `{error}`
- Content script actions: `solveNow`, `clearHighlights`, `toggleDebug`

## Development

### Loading Extensions

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select either `kahoot-highlighter/` or `kahoot-ai-solver/` folder

### Testing Kahoot Highlighter

1. **Local Test**: Open `kahoot-highlighter/test.html` - should highlight 6 test questions
2. **Live Test**: Navigate to `kahoot.it` and check debug panel

### Testing Kahoot AI Solver

1. **Configure API**: Click extension icon, enter OpenAI or Anthropic API key
2. **Test on Kahoot**: Navigate to `kahoot.it`, wait for question to appear
3. **Check Debug Panel**: Toggle in popup to see AI processing logs

### Debugging

**Kahoot Highlighter:**
- Console prefix: `"Kahoot Highlighter:"`
- Debug panel: Toggle via popup or set `debugMode: true` in content.js:10
- Highlight class: `kahoot-question-highlight`
- Storage keys: `debugMode`, `autoScan`

**Kahoot AI Solver:**
- Console prefix: `"Kahoot AI:"`
- Debug panel: Toggle via popup (shows question, AI request/response)
- Highlight class: `kahoot-ai-highlight`
- Storage keys: `aiProvider`, `apiKey`, `debugMode`
- Background logs: Check service worker console at chrome://extensions

### Code Patterns

**Shared Patterns:**
- IIFE wrapping for scope isolation
- MutationObserver on `document.body` with `subtree: true`
- Debug panel: Fixed bottom-left, green terminal aesthetic
- chrome.storage.sync for settings persistence
- Message passing: content ↔ popup (highlighter), content ↔ background (AI solver)

**AI Solver Specific:**
- Answer matching: Uses string similarity (exact match > contains > similarity score)
- API format: OpenAI uses `/v1/chat/completions`, Anthropic uses `/v1/messages`
- Error handling: Returns `{error}` object to content script for display
- Processing lock: `isProcessing` flag prevents duplicate AI calls

## Important Notes

### Both Extensions
- Only activate on `*.kahoot.it/*` and `*.kahoot.com/*`
- MutationObserver watches for dynamic content
- Elements filtered by dimensions to avoid false positives
- Delayed scans (1s, 2s, 3s) handle SPA rendering

### Kahoot AI Solver Specific
- **API Costs**: ~$0.0015/question (OpenAI), ~$0.00025/question (Anthropic)
- **Privacy**: API keys stored in chrome.storage.sync, sent only to chosen provider
- **Rate Limits**: No built-in throttling - consider adding if processing many questions
- **Answer Matching**: May fail if AI returns answer in different format than choices

## Customization

**Kahoot Highlighter** (`kahoot-highlighter/styles.css`):
- Golden/orange color scheme
- Pulsing animation

**Kahoot AI Solver** (`kahoot-ai-solver/styles.css`):
- Green color scheme
- "AI ANSWER" badge with pop-in animation
- More pronounced glow effect
