# Chrome Web Store submission — SessionRemind Connector

Everything you need to publish the extension. The package itself is built and zipped at
`public/sessionremind-connector.zip` (also re-zippable from this `extension/` folder:
`zip -r connector.zip manifest.json popup.html popup.js icons`).

> I can prepare 100% of this, but the **submission itself must be done by you**, because it requires:
> 1. signing into your Google account,
> 2. paying Google's **one-time $5 developer registration fee**, and
> 3. accepting Google's developer agreement.
> Those three are account/payment/legal actions I can't perform for you. The steps below make it ~10 minutes.

---

## 1. One-time: become a Chrome Web Store developer
- Go to **https://chrome.google.com/webstore/devconsole**
- Sign in with the Google account you want to own the extension.
- Pay the **$5 one-time registration fee** and accept the developer agreement.

## 2. Upload the package
- Click **"Add new item"** → upload **`sessionremind-connector.zip`** (download it from
  `https://sessionremind.com/sessionremind-connector.zip` or grab it from the repo's `public/` folder).

## 3. Store listing — copy/paste these fields

**Name**
```
SessionRemind Connector
```

**Summary** (132 char max)
```
Connect your UseSession account to SessionRemind in one click to send automatic SMS reminders to your photography clients.
```

**Description**
```
SessionRemind Connector links your UseSession account to SessionRemind so your photography clients
get automatic text reminders before every session — and you never have to chase a no-show again.

How it works:
1. Install this extension and open UseSession (logged in).
2. Click the SessionRemind icon and hit Connect — that's it.
3. SessionRemind automatically syncs your upcoming bookings and texts each client a friendly
   reminder 3 days and 1 day before their shoot.

Private by design:
• No passwords. The extension never asks for or sees your UseSession username or password — it
  securely passes only your existing access token to SessionRemind.
• Encrypted. Your access is stored AES-256 encrypted and used only to read your upcoming bookings.
• Read-only. We never change, delete, or post anything in your UseSession account.
• Yours to revoke. Disconnect anytime from your SessionRemind dashboard to delete the connection.

You'll need a SessionRemind account (https://sessionremind.com) to use this extension.
```

**Category:** Workflow & Planning  (alt: Productivity)
**Language:** English

## 4. Privacy
- **Privacy policy URL:** `https://sessionremind.com/privacy`
- **Single purpose:** "Connect a UseSession account to SessionRemind so it can send automatic SMS
  reminders for upcoming photography sessions."

**Permission justifications** (paste into the "Permissions" justification fields):
- `activeTab` / `scripting`: "Read the user's UseSession access token from the active UseSession tab
  when they click Connect, so their account can be linked."
- `tabs`: "Detect whether the active tab is UseSession to enable the Connect button."
- Host `https://app.usesession.com/*`: "Read the access token from the user's logged-in UseSession
  session at their request."
- Host `https://sessionremind.com/*`: "Send the token to the user's SessionRemind account over HTTPS
  to complete the connection."

**Data usage disclosures** (the "Privacy practices" tab — check these):
- Data collected: **Authentication information** (the UseSession access token).
- It IS: used only for the single purpose above, transmitted over HTTPS.
- Certify: ✅ does NOT sell/transfer data to third parties (except for the app's core function),
  ✅ does NOT use/transfer data for purposes unrelated to the single purpose,
  ✅ does NOT use/transfer data to determine creditworthiness / for lending.

## 5. Screenshots (required — at least one, 1280×800 or 640×400 PNG)
Take 1–2 screenshots of the extension popup and/or the SessionRemind /automation page after connecting.
(This is the one asset that needs a real image; everything else above is ready to paste.)

## 6. Submit for review
- Click **Submit for review**. Google review typically takes ~1–3 business days.
- Once approved, the install becomes one-click **"Add to Chrome"** for your customers — no dev mode,
  no downloads, no passwords.

## After it's published
Send me the store URL and I'll update the /automation Connect page to a one-click
"Add to Chrome" button pointing at it.
