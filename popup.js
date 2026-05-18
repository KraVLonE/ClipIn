// Works on both Chrome and Firefox/Zen Browser
const ext = typeof browser !== 'undefined' ? browser : chrome;

const NOTION_API_VERSION = '2022-06-28';

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const setupSection  = document.getElementById('setupSection');
const formSection   = document.getElementById('formSection');
const notLinkedIn   = document.getElementById('notLinkedIn');
const apiKeyInput   = document.getElementById('apiKeyInput');
const dbIdInput     = document.getElementById('dbIdInput');
const saveKeyBtn    = document.getElementById('saveKeyBtn');
const keyStatus     = document.getElementById('keyStatus');
const toggleSetup   = document.getElementById('toggleSetup');
const nameInput     = document.getElementById('nameInput');
const companyInput  = document.getElementById('companyInput');
const statusSelect  = document.getElementById('statusSelect');
const urlInput      = document.getElementById('urlInput');
const notesInput    = document.getElementById('notesInput');
const saveBtn       = document.getElementById('saveBtn');
const toast         = document.getElementById('toast');

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const { notionApiKey, notionDatabaseId } = await ext.storage.local.get(['notionApiKey', 'notionDatabaseId']);

  // Always restore whatever they already typed so it doesn't get lost
  if (notionApiKey) apiKeyInput.value = notionApiKey;
  if (notionDatabaseId) dbIdInput.value = notionDatabaseId;

  // If missing or invalid, show setup
  if (!notionApiKey || !notionDatabaseId || (!notionApiKey.startsWith('secret_') && !notionApiKey.startsWith('ntn_'))) {
    setupSection.style.display = 'block';
    keyStatus.textContent = 'Enter your Notion API key and Database ID to get started.';
    return;
  }

  const [tab] = await ext.tabs.query({ active: true, currentWindow: true });
  const isLinkedIn = tab.url && tab.url.startsWith('https://www.linkedin.com/in/');

  if (!isLinkedIn) {
    notLinkedIn.style.display = 'block';
    return;
  }

  formSection.style.display = 'block';
  urlInput.value = tab.url.split('?')[0];

  // Try sending a message to the already-injected content script
  // If it fails (e.g. extension just loaded), inject the script manually first
  try {
    let result = await sendMessageToTab(tab.id, { action: 'scrapeProfileV2' });

    // If content script wasn't ready, inject it and retry once
    if (!result) {
      await ext.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      await sleep(800);
      result = await sendMessageToTab(tab.id, { action: 'scrapeProfileV2' });
    }

    if (result) {
      if (result.name)        nameInput.value    = result.name;
      if (result.company)     companyInput.value = result.company;
      if (result.linkedinUrl) urlInput.value     = result.linkedinUrl;
    }
  } catch (e) {
    console.log('Auto-scrape failed, user fills manually:', e);
  }
});

// ─── Auto-save on input ───────────────────────────────────────────────────────
// This prevents data loss if they click away to copy the second ID
apiKeyInput.addEventListener('input', () => {
  ext.storage.local.set({ notionApiKey: apiKeyInput.value.trim() });
});
dbIdInput.addEventListener('input', () => {
  ext.storage.local.set({ notionDatabaseId: dbIdInput.value.trim() });
});

// ─── Helper: send message with timeout ────────────────────────────────────────
function sendMessageToTab(tabId, msg) {
  return new Promise((resolve) => {
    try {
      ext.tabs.sendMessage(tabId, msg, (response) => {
        if (ext.runtime.lastError) {
          resolve(null);
        } else {
          resolve(response);
        }
      });
    } catch (e) {
      resolve(null);
    }
    // Timeout fallback — if no response in 4s, give up
    setTimeout(() => resolve(null), 4000);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Validate & Save Settings ─────────────────────────────────────────────────
saveKeyBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  const dbId = dbIdInput.value.trim();
  
  if (!key || (!key.startsWith('secret_') && !key.startsWith('ntn_'))) {
    keyStatus.textContent = '⚠ Key must start with "secret_" or "ntn_"';
    keyStatus.className = 'key-status';
    return;
  }
  if (!dbId) {
    keyStatus.textContent = '⚠ Database ID is required';
    keyStatus.className = 'key-status';
    return;
  }
  
  await ext.storage.local.set({ notionApiKey: key, notionDatabaseId: dbId });
  keyStatus.textContent = '✓ Saved! Reload this popup.';
  keyStatus.className = 'key-status ok';
});

// ─── Toggle settings ──────────────────────────────────────────────────────────
toggleSetup.addEventListener('click', () => {
  const visible = setupSection.style.display !== 'none';
  setupSection.style.display = visible ? 'none' : 'block';
  if (!visible) {
    ext.storage.local.get(['notionApiKey', 'notionDatabaseId'], (data) => {
      if (data.notionApiKey) apiKeyInput.value = data.notionApiKey;
      if (data.notionDatabaseId) dbIdInput.value = data.notionDatabaseId;
      if (data.notionApiKey && data.notionDatabaseId) {
        keyStatus.textContent = '✓ Settings saved';
        keyStatus.className = 'key-status ok';
      }
    });
  }
});

// ─── Save to Notion ───────────────────────────────────────────────────────────
saveBtn.addEventListener('click', async () => {
  const name    = nameInput.value.trim();
  const company = companyInput.value.trim();
  const status  = statusSelect.value;
  const url     = urlInput.value.trim();
  const notes   = notesInput.value.trim();

  if (!name) {
    showToast('Please enter a name.', 'error');
    return;
  }

  const { notionApiKey, notionDatabaseId } = await ext.storage.local.get(['notionApiKey', 'notionDatabaseId']);
  if (!notionApiKey || !notionDatabaseId) {
    showToast('API key or DB ID not set. Click "⚙ API settings".', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';
  saveBtn.classList.add('loading');

  try {
    const properties = {
      'Name': { title: [{ text: { content: name } }] },
      'Status': { select: { name: status } }
    };
    if (url)     properties['LinkedIn URL'] = { url };
    if (company) properties['Company']      = { select: { name: company } };
    if (notes)   properties['Notes']        = { rich_text: [{ text: { content: notes } }] };

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_API_VERSION
      },
      body: JSON.stringify({ parent: { database_id: notionDatabaseId }, properties })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Notion API error ${response.status}`);

    showToast(`✓ "${name}" saved to Notion!`, 'success');
    saveBtn.textContent = '✓ Saved!';
    saveBtn.style.background = '#166534';

  } catch (err) {
    console.error(err);
    showToast(`Error: ${err.message}`, 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save to Notion';
    saveBtn.classList.remove('loading');
  }
});

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 5000);
}
