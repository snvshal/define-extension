// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings when the extension is installed
  const defaultSettings = {
      language: "en",
      theme: "dark",
      font: "Arial, sans-serif",
      fontSize: "14px",
  };

  // Initialize API settings
  const defaultAPISettings = {
      api_choice: 'free',
      gemini_api_key: ''
  };

  // Use chrome.storage.local instead of sync for faster access and API key storage
  chrome.storage.local.set({
      settings: defaultSettings,
      ...defaultAPISettings
  }, () => {
      console.log("Default settings have been initialized.");
  });
});

// Listener for messages from content or popup scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getSettings") {
      // Fetch all settings including API settings
      chrome.storage.local.get(["settings", "api_choice", "gemini_api_key"], (data) => {
          sendResponse({
              settings: data.settings || {},
              api_choice: data.api_choice || 'free',
              gemini_api_key: data.gemini_api_key || ''
          });
      });
      return true; // Indicates that the response will be sent asynchronously
  } else if (message.type === "updateSettings") {
      // Update settings
      chrome.storage.local.set({
          settings: message.settings,
          api_choice: message.api_choice,
          gemini_api_key: message.gemini_api_key
      }, () => {
          console.log("Settings updated:", message.settings);
          // Notify all tabs about the settings update
          chrome.tabs.query({}, (tabs) => {
              tabs.forEach(tab => {
                  chrome.tabs.sendMessage(tab.id, {
                      type: "settingsUpdated",
                      settings: message.settings,
                      api_choice: message.api_choice,
                      gemini_api_key: message.gemini_api_key
                  }).catch(() => {
                      // Ignore errors for inactive tabs
                  });
              });
          });
      });
  }
});