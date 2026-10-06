This extension allows users to save LinkedIn contact information directly to their personal Notion database via Notion's official REST API.

How to Test the Extension:
1. Load the extension in Firefox.
2. Click the extension toolbar icon. If Notion credentials are not configured, it will prompt for:
   - Notion API Key (Internal Integration Secret)
   - Notion Database ID
3. Set up a free Notion test integration and database:
   - Create a test database in Notion with properties:
     - "Name" (Title)
     - "Company" (Select)
     - "Status" (Select)
     - "LinkedIn URL" (URL)
     - "Notes" (Rich Text)
   - In Notion, share/connect the database to your integration.
   - Enter your Notion API key (starts with 'secret_' or 'ntn_') and Database ID into the extension's Settings view, then click "Save Settings".
4. Navigate to any public LinkedIn profile page (URL matching https://www.linkedin.com/in/*).
5. Click the extension toolbar icon:
   - The popup opens and automatically populates the Name, Company (if present on profile), and LinkedIn URL.
   - Click "Save to Notion".
   - The extension performs a direct POST request to https://api.notion.com/v1/pages.
   - A green success toast appears and the new contact entry is created in your Notion database.

Permissions Justification:
- "activeTab" & "scripting": Required to extract profile details (Name, Company, URL) from the active LinkedIn profile page.
- "storage": Required to persist the user's Notion API key and database ID locally in browser.storage.local.
- Host permission "https://www.linkedin.com/in/*": Content script execution scope strictly limited to LinkedIn personal profiles.
- Host permission "https://api.notion.com/*": Required for the extension popup to send page creation requests to the user's personal Notion database.

Data Collection & Privacy:
- The extension does not collect or transmit telemetry or user data to any third party or developer server ("none" declared in gecko.data_collection_permissions).
- Data is sent exclusively and directly from the user's browser to api.notion.com using the user's personal integration key.

