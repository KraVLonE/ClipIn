// Works on both Chrome and Firefox/Zen Browser
const ext = typeof browser !== 'undefined' ? browser : chrome;

function scrapeProfile() {
  const data = {};

  // Name — try multiple selectors LinkedIn has used over time
  const nameEl =
    document.querySelector('h1.text-heading-xlarge') ||
    document.querySelector('h1[class*="name"]') ||
    document.querySelector('.pv-text-details__left-panel h1') ||
    document.querySelector('.text-heading-xlarge') ||
    document.querySelector('h1.inline.t-24.t-black.t-normal.break-words') ||
    document.querySelector('h1');
  
  if (nameEl) {
    data.name = nameEl.innerText || nameEl.textContent;
    if (data.name) data.name = data.name.trim();
  } else {
    const titleMatch = document.title.match(/^(?:\(\d+\)\s*)?([^|]+)/);
    data.name = titleMatch ? titleMatch[1].trim() : '';
  }

  // Company — completely different extraction strategies
  let companyText = '';
  
  try {
    companyText = window.getSelection().toString().trim();
  } catch(e) {}

  // Strategy 2: Use the robust company asset selectors (IMG src or SVG id)
  if (!companyText) {
    try {
      const companyAsset = 
        document.querySelector('img[src*="company-logo"]') || 
        document.querySelector('svg[id^="company-accent"]');
        
      if (companyAsset) {
        const container = companyAsset.closest('[role="button"]') || companyAsset.closest('a') || companyAsset.parentElement;
        if (container) {
          companyText = container.innerText || container.textContent;
        }
      }
    } catch(e) {}
  }

  // Strategy 3: Check the document title as an ultimate fallback
  if (!companyText) {
    try {
      // Matches "at ", "@ ", "chez ", "en "
      const titleMatch = document.title.match(/(?:\bat\s+|@\s+|\bchez\s+|\ben\s+)(.+?)\s*\|/i);
      if (titleMatch && titleMatch[1]) {
        companyText = titleMatch[1].trim();
      }
    } catch(e) {}
  }

  // Final cleanup: remove "· Full-time", duplicate text, etc.
  if (companyText) {
    try {
      data.company = companyText.split('·')[0].split('\n')[0].trim();
    } catch(e) {
      data.company = companyText;
    }
  } else {
    data.company = '';
  }

  data.linkedinUrl = window.location.href.split('?')[0];
  return data;
}

// Respond to scrape requests from popup
ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeProfileV2') {
    // If name is empty, LinkedIn DOM may not be ready — retry up to 5 times
    let attempts = 0;
    const MAX = 5;
    const DELAY = 600; // ms

    function tryScape() {
      const result = scrapeProfile();
      attempts++;
      if (result.name || attempts >= MAX) {
        sendResponse(result);
      } else {
        setTimeout(tryScape, DELAY);
      }
    }

    tryScape();
    return true; // keep message channel open for async sendResponse
  }
});
