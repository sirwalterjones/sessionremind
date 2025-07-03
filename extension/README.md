# Session Reminder Browser Extension

A Chrome extension that automatically extracts client data from UseSession pages and creates SMS reminders.

## Features

- 🎯 **Automatic Detection**: Works on any UseSession page
- 📱 **Floating Button**: Clean, non-intrusive interface
- 🚀 **One-Click Action**: Extract data and open reminder form instantly
- 📊 **Smart Extraction**: Handles both calendar and individual session pages
- 🎨 **Beautiful UI**: Modern design that fits with UseSession

## Installation

### Option 1: Local Development Installation

1. **Download the extension folder** to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the `extension` folder
5. **Done!** The extension is now active

### Option 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store for easy one-click installation.

## How to Use

1. **Install the extension** (see installation steps above)
2. **Navigate to any UseSession page**:
   - Calendar view: `https://app.usesession.com/calendar`
   - Individual session: `https://app.usesession.com/sessions/[id]`
3. **Look for the floating "Send Reminder" button** (bottom right)
4. **Click the button** - it will automatically:
   - Extract client name, email, phone, session details
   - Open a new tab with the reminder form pre-filled
   - Let you customize and send the SMS reminder

## What Data is Extracted

The extension intelligently extracts:

- **Client Name**: Full name from session details
- **Email Address**: Client's email for contact
- **Phone Number**: Client's phone for SMS delivery
- **Session Title**: Type of photography session
- **Session Date/Time**: When the session is scheduled

## Browser Support

- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Brave Browser
- ✅ Any Chromium-based browser

## Privacy & Security

- **No data storage**: Information is only used temporarily to fill the form
- **No tracking**: Extension doesn't collect or store any personal data
- **Local processing**: All data extraction happens locally in your browser
- **Secure**: Only runs on UseSession pages, no access to other sites

## Troubleshooting

### Extension not working?
1. Make sure you're on a UseSession page (`app.usesession.com`)
2. Refresh the page
3. Check that the extension is enabled in `chrome://extensions/`

### Button not appearing?
1. The floating button appears after the page loads
2. Try scrolling or waiting a few seconds
3. Make sure you're on a UseSession page with client data

### Form not opening?
1. Check that your Session Reminder app is running at `localhost:3000`
2. Ensure pop-up blocker isn't blocking the new tab

## Development

### Project Structure
```
extension/
├── manifest.json     # Extension configuration
├── content.js       # Page interaction and data extraction
├── content.css      # Floating button styles
├── background.js    # Background service worker
├── popup.html       # Extension popup interface
├── popup.css        # Popup styles
├── popup.js         # Popup functionality
└── icons/           # Extension icons
```

### Local Development
1. Make changes to any file in the extension folder
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Session Reminder extension
4. Test your changes on a UseSession page

## Support

For issues or questions:
- Check the troubleshooting section above
- Visit the main app at `localhost:3000` for additional help
- Make sure your Session Reminder dev server is running