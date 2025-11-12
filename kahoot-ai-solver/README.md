# Kahoot AI Solver

A Chrome extension that automatically detects Kahoot questions, uses AI to find the correct answer, and highlights it for you.

## Features

- **Automatic Question Detection** - Detects questions and answer choices on Kahoot pages
- **AI-Powered Answers** - Uses OpenAI GPT-3.5 or Anthropic Claude to find correct answers
- **Visual Highlighting** - Highlights the correct answer with a glowing green border and badge
- **Debug Panel** - Real-time logging panel showing detection and AI processing
- **Manual Controls** - Trigger solving manually or clear highlights
- **Multiple AI Providers** - Choose between OpenAI or Anthropic Claude

## Installation

### Prerequisites

You'll need an API key from one of these providers:
- **OpenAI**: Get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: Get one at [console.anthropic.com](https://console.anthropic.com/)

### Install Extension

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `kahoot-ai-solver` folder
6. The extension is now installed!

### Configure API Key

1. Click the extension icon in Chrome toolbar
2. Select your AI provider (OpenAI or Anthropic)
3. Enter your API key
4. Click "Save Settings"

## Usage

### Automatic Mode

1. Navigate to a Kahoot game at `kahoot.it`
2. When a question appears, the extension will:
   - Detect the question and answer choices
   - Send to AI for analysis
   - Highlight the correct answer with a green glow
3. Click the highlighted answer to submit

### Manual Mode

1. Click the extension icon to open the popup
2. Use the controls:
   - **⚡ Solve Current Question** - Manually trigger AI solving
   - **🧹 Clear Highlights** - Remove all highlights
   - **Debug Panel** - Toggle the debug overlay

### Debug Panel

Enable the debug panel (toggle in popup) to see:
- Extension initialization
- Question detection logs
- AI API requests/responses
- Answer highlighting results

Located in bottom-left corner of the page.

## How It Works

### Question Detection

The extension uses multiple strategies to detect questions:

1. **CSS Selectors** - 10+ selectors targeting Kahoot-specific elements
2. **Text Pattern Analysis** - Validates text contains question marks or question words
3. **Dimension Filtering** - Ensures elements are visible and appropriately sized

### Answer Detection

Detects answer choices by:
- Finding clickable elements (buttons, interactive divs)
- Filtering by text length and size
- Ensuring 2-6 answer choices are present

### AI Processing

1. Sends question and answer choices to selected AI provider
2. AI analyzes and returns the most likely correct answer
3. Extension matches AI response to answer choice
4. Highlights the matching element

## File Structure

```
kahoot-ai-solver/
├── manifest.json      # Extension configuration
├── content.js         # Question detection and highlighting
├── background.js      # AI API communication
├── popup.html         # Settings UI
├── popup.js           # Popup controller
├── styles.css         # Highlight styles
└── README.md          # This file
```

## Architecture

- **content.js** - Runs on Kahoot pages, detects questions/answers, manages UI
- **background.js** - Service worker that handles AI API calls
- **popup.js/html** - Configuration interface for API keys and controls

## Troubleshooting

### Extension Not Working?

1. **Check API Key**
   - Open extension popup
   - Verify API key is saved
   - Test with a new key if needed

2. **Not Detecting Questions?**
   - Enable debug panel to see what's happening
   - Check browser console (F12) for errors
   - Ensure you're on `kahoot.it` or `kahoot.com`

3. **AI Errors?**
   - Verify API key is valid
   - Check you have credits/quota remaining
   - Look at debug panel for error messages

4. **Answer Not Highlighting?**
   - AI might return answer in different format
   - Check debug panel for AI response
   - Try manual mode via popup

## API Costs

- **OpenAI GPT-3.5-turbo**: ~$0.0015 per question (very cheap)
- **Anthropic Claude Haiku**: ~$0.00025 per question (even cheaper)

Each question uses approximately 100-200 tokens.

## Limitations

- Requires valid AI API key with available credits
- AI accuracy depends on question type and clarity
- Some dynamically loaded questions may take a moment to detect
- Extension only works on Kahoot.it and Kahoot.com domains

## Privacy & Ethics

- **No data collection**: Extension doesn't store or transmit your data (except to your chosen AI provider)
- **Local processing**: All detection happens in your browser
- **Your API key**: Stored locally in Chrome's sync storage
- **Educational use**: This tool is for educational purposes. Use responsibly.

## License

Free to use and modify for personal or educational purposes.

## Disclaimer

This extension is for educational purposes. Using automated tools in competitive Kahoot games may violate their terms of service. Use responsibly and ethically.
