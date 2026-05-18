# LinkedIn → Notion Referral Tracker

A Chrome/Firefox extension that lets you save a LinkedIn profile directly to your Notion **Referral Contacts** database in one click.

---

## Installation & Setup

### Step 1 — Get a Notion API Key

1. Go to [Notion My Integrations](https://www.notion.so/my-integrations).
2. Click **"New integration"**.
3. Name it anything (e.g., "LinkedIn Tracker"), select your workspace, and click Submit.
4. Copy the **Internal Integration Secret** (starts with `secret_...` or `ntn_...`).

### Step 2 — Get your Notion Database ID

1. Open your **Referral Contacts** database in Notion as a full page.
2. Look at the URL in your browser. It looks like this:
   `https://www.notion.so/workspace/1234567890abcdef1234567890abcdef?v=...`
3. Copy the 32-character string between the last `/` and the `?v=`. This is your **Database ID**.
4. Important: Click the `...` menu (top right of your Notion database page) → **"Add connections"** → select your new integration to grant it access.

### Step 3 — Load the extension in your Browser

**For Chrome:**
1. Open Chrome → go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select this folder.

**For Firefox / Zen Browser:**
1. Open Firefox → go to `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on..."**
3. Select the `manifest.json` file in this folder.

### Step 4 — Configure the Extension

1. Click the extension icon in your browser's toolbar.
2. It will prompt you for your Settings.
3. Paste your **Notion API Key** and your **Database ID**.
4. Click **Save Settings**.

---

## Usage

1. Go to any LinkedIn profile (`linkedin.com/in/...`).
2. Click the extension icon.
3. The form auto-fills **Name**, **LinkedIn URL**, and automatically detects the **Company** using robust fallback strategies.
4. Adjust **Status** and add optional **Notes**.
5. Click **Save to Notion** ✓.

---

## Notion Database Setup (Fields Mapped)

Ensure your Notion Database has the following properties EXACTLY as named (types in parentheses):

| Extension Field | Notion Property |
|----------------|----------------|
| Name           | Name (Title)   |
| Company        | Company (Select) |
| Status         | Status (Select) |
| LinkedIn URL   | LinkedIn URL (URL) |
| Notes          | Notes (Text)   |

**Status options to add in Notion:** To Connect, Request Sent, Connected, DM Sent, Replied, No Response.

---

## Notes

- **Company Detection:** This extension uses highly robust layout-agnostic selectors to extract the company name regardless of LinkedIn A/B tests or localized UI differences.
- If you add a new company via the extension that is not in your Notion select options, Notion will automatically create it for you.
- The extension activates exclusively on `linkedin.com/in/*` profile pages.
