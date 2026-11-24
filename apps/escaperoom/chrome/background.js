// De Chrome-extensie: de knop in de werkbalk (en de eerste installatie) opent het spel in een tabblad, of haalt het
// tabblad terug dat al open is. Het spel zit in de extensie zelf, dus het werkt ook zonder internet (Chromebook).
const GAME_URL = chrome.runtime.getURL('index.html');

async function openGame() {
  const [open] = await chrome.runtime.getContexts({ contextTypes: ['TAB'], documentUrls: [GAME_URL] });
  if (open && open.tabId >= 0) {
    await chrome.tabs.update(open.tabId, { active: true });
    await chrome.windows.update(open.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: GAME_URL });
  }
}

chrome.action.onClicked.addListener(openGame);
chrome.runtime.onInstalled.addListener(d => { if (d.reason === 'install') openGame(); });
