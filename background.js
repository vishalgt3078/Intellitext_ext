chrome.runtime.onInstalled.addListener(() => {
    // Create context menu item
    chrome.contextMenus.create({
      id: "lookupSelection",
      title: "Look up \"%s\"",
      contexts: ["selection"]
    });
  
    // Initialize settings with defaults if not already set
    chrome.storage.local.get(["apiKey", "modelName"], (result) => {
      if (!result.apiKey) {
        chrome.storage.local.set({ 
          apiKey: "", 
          modelName: "mistralai/Mistral-7B-Instruct-v0.2" 
        });
      }
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "lookupSelection") {
      chrome.tabs.sendMessage(tab.id, {
        action: "lookupWord",
        selection: info.selectionText
      });
    }
  });