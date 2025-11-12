# Kahoot Question Highlighter

A powerful Chrome extension that highlights questions in Kahoot games with intelligent detection, manual controls, and advanced debugging features.

## ✨ Features

### Automatic Detection
- **30+ CSS selectors** targeting Kahoot question elements
- **Smart text detection** that recognizes question patterns (questions marks, question words)
- **Dynamic content monitoring** with MutationObserver
- **Auto-scan** every 5 seconds for new questions

### Manual Controls
- **Popup UI** with one-click highlighting
- **Inspect Mode** - hover and click to manually mark questions
- **Highlight All** - highlight every text element on the page
- **Clear highlights** with one click

### Visual Features
- Ultra-bright golden borders with orange outline
- Pulsing glow animation
- Real-time debug panel showing all activity
- On-screen notifications

### Keyboard Shortcuts
- `Ctrl+Shift+H` - Trigger manual highlight
- `Ctrl+Shift+I` - Enable inspect mode
- `Ctrl+Shift+C` - Clear all highlights

## Installation

### Method 1: Load Unpacked Extension (For Development/Testing)

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" by clicking the toggle in the top right corner
4. Click "Load unpacked"
5. Select the `kahoot-highlighter` folder
6. The extension is now installed!

### Method 2: Pack and Install (Optional)

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Pack extension"
4. Select the `kahoot-highlighter` folder as the extension root directory
5. Click "Pack Extension"
6. Install the generated `.crx` file

## Usage

### Automatic Mode
1. Navigate to any Kahoot game at `kahoot.it`
2. Questions are automatically detected and highlighted
3. Debug panel (bottom-left) shows detection activity
4. Notifications confirm when questions are found

### Manual Controls
1. Click the extension icon to open the popup
2. Use the buttons to:
   - **Highlight Now** - Force immediate scan
   - **Inspect Mode** - Hover and click elements to mark them
   - **Highlight ALL Text** - Highlight every text element (useful for finding hidden questions)
   - **Clear All** - Remove all highlights
3. Toggle debug panel and auto-scan on/off

### Keyboard Shortcuts
- Press `Ctrl+Shift+H` anywhere on a Kahoot page to highlight
- Press `Ctrl+Shift+I` to enter inspect mode
- Press `Ctrl+Shift+C` to clear highlights

## How It Works

### Multi-Layer Detection
1. **CSS Selector Matching** - Searches for 30+ known Kahoot question patterns
2. **Intelligent Text Analysis** - Detects questions by:
   - Looking for question marks (?)
   - Identifying question words (what, who, where, when, why, how, etc.)
   - Analyzing text length and word count
   - Checking element dimensions
3. **MutationObserver** - Monitors page for dynamically loaded content
4. **Periodic Scanning** - Auto-scans every 5 seconds for new questions

### Highlighting System
- Applies bright CSS styling with `!important` flags
- Uses animations for high visibility
- Works across all Kahoot themes and layouts
- Can be manually triggered or cleared anytime

## Customization

You can customize the highlight style by editing `styles.css`:

- Change border color: Modify the `border` property
- Adjust glow intensity: Change the `box-shadow` values
- Modify animation speed: Update the `animation` duration
- Change background color: Edit the `background` gradient

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main script that detects and highlights questions
- `styles.css` - Styling for the highlights

## Browser Compatibility

- Google Chrome (Manifest V3)
- Microsoft Edge (Chromium-based)
- Other Chromium-based browsers

## Notes

- The extension only runs on Kahoot.it domains
- No data is collected or transmitted
- The extension works entirely in your browser

## Troubleshooting

### Questions Not Being Highlighted?

1. **Check Extension Status**
   - Go to `chrome://extensions/`
   - Ensure "Kahoot Question Highlighter" is enabled
   - Enable "Allow access to file URLs" if testing locally

2. **Use Manual Mode**
   - Click extension icon → "Highlight Now"
   - Try "Highlight ALL Text" to see everything
   - Use Inspect Mode (`Ctrl+Shift+I`) to manually mark questions

3. **Check Debug Panel**
   - Debug panel (bottom-left) shows what's being detected
   - Look for error messages or warnings
   - See which selectors are working

4. **Try Keyboard Shortcuts**
   - Press `Ctrl+Shift+H` to force highlight
   - Works even if auto-detection fails

5. **Test Page**
   - Open `test.html` in the extension folder
   - Should highlight 6 test questions
   - Confirms extension is working

### Still Not Working?
- Check browser console (F12) for errors
- Ensure you're on kahoot.it or kahoot.com
- Try disabling other extensions that might conflict
- Reload the extension at `chrome://extensions/`

## License

Free to use and modify for personal or educational purposes.