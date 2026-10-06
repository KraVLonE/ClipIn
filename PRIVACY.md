# Privacy Policy for clipIn: LinkedIn Referral Tracker w/ Notion

**Last updated:** October 2026

## 1. Overview
**clipIn: LinkedIn Referral Tracker w/ Notion** ("the extension") is designed with privacy as a foundational principle. The extension does not collect, log, track, sell, or transmit any personal data to developer-owned servers, advertising networks, or third-party analytics platforms.

## 2. Information Accessed & Used
* **LinkedIn Profile Data:** When you explicitly open the extension popup while browsing a LinkedIn profile page (`https://www.linkedin.com/in/*`), the extension reads the profile's publicly visible text (Name, Company, and Profile URL) solely to pre-populate the input fields in the extension popup.
* **Credentials & Configuration:** Your Notion API Key and Notion Database ID are stored locally within your browser using `browser.storage.local`. These credentials remain exclusively on your device and are never exposed to or stored by the extension developer.

## 3. Data Transmission & Third Parties
* **Direct Communication with Notion:** When you click **"Save to Notion"**, the extension sends the contact details directly from your browser to the official Notion API (`https://api.notion.com/v1/pages`) using your own configured Notion integration token.
* **No Intermediary Servers:** No data is ever routed through, cached, or processed by any intermediary server. All network communication occurs directly between your browser and Notion's servers.

## 4. Permissions Justification
* `activeTab` & `scripting`: To read the profile name, company, and URL from the active LinkedIn tab when you open the popup.
* `storage`: To persist your Notion API Key and Database ID locally in your browser.
* `https://www.linkedin.com/in/*`: To run the scraper content script only on LinkedIn profile pages.
* `https://api.notion.com/*`: To send formatted contact entries directly to your Notion database.

## 5. Contact
If you have questions regarding this privacy policy or the extension's behavior, please file an issue on the project's repository.
