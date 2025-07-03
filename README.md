# Session Reminder

A modern web application for photographers to send SMS reminders to clients based on scraped data from booking pages like UseSession.com.

## Features

- **Client Reminder Form**: Create SMS reminders with auto-fill from query parameters
- **SMS Integration**: Send messages via TextMagic API
- **Dashboard**: View sent messages and statistics
- **Bookmarklet**: Auto-scrape client data from UseSession pages
- **Responsive Design**: Clean Apple-style interface with Tailwind CSS

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your TextMagic username:
   ```
   TEXTMAGIC_USERNAME=your-actual-username
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Usage

### Creating Reminders

1. Navigate to `/new` to create a new reminder
2. Fill in client information or use auto-fill via URL parameters
3. Customize the reminder message
4. Toggle "Opted-in" to Yes
5. Click "Send Reminder"

### Auto-fill from UseSession

Use the drag-and-drop bookmarklet from the homepage:

1. Visit the homepage and drag the blue "UseSession → Session Reminder" button to your bookmarks bar
2. Navigate to any UseSession client detail page in your browser
3. Click the bookmark in your bookmarks bar
4. The app will open with auto-filled client data

### Viewing Dashboard

Navigate to `/dashboard` to see:
- List of sent messages
- Message status and timestamps
- Quick statistics
- Option to clear message history

## API Endpoints

### POST `/api/send-sms`

Send an SMS reminder using TextMagic API.

**Request body**:
```json
{
  "name": "Ashley Bell",
  "phone": "+18165895289",
  "email": "ashley@example.com",
  "sessionTitle": "Watermelon Truck Mini",
  "sessionTime": "June 29, 2025 at 8:20 PM",
  "message": "Hi Ashley! This is a reminder...",
  "optedIn": true
}
```

**Response**:
```json
{
  "success": true,
  "id": "message-id",
  "message": "SMS sent successfully"
}
```

## Environment Variables

- `TEXTMAGIC_API_KEY`: Your TextMagic API key
- `TEXTMAGIC_USERNAME`: Your TextMagic username

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **SMS Provider**: TextMagic API
- **TypeScript**: Full type safety

## Project Structure

```
├── app/
│   ├── api/send-sms/route.ts    # SMS API endpoint
│   ├── dashboard/page.tsx       # Dashboard page
│   ├── new/page.tsx            # New reminder form
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   └── globals.css             # Global styles
├── components/
│   └── Form.tsx                # Reusable form component
├── public/
│   └── bookmarklet.js          # YouSession scraper script
└── .env.local.example          # Environment variables template
```

## Deployment

1. Deploy to Vercel, Netlify, or any hosting platform
2. Set environment variables in your hosting dashboard
3. Update the bookmarklet base URL to your production domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details