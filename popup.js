document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const tabName = tab.getAttribute('data-tab');
        document.getElementById(`${tabName}-tab`).classList.add('active');
      });
    });
    
    // Load saved settings
    chrome.storage.local.get(["apiKey", "modelName"], (result) => {
      if (result.apiKey) {
        document.getElementById('api-key').value = result.apiKey;
      }
      
      if (result.modelName) {
        document.getElementById('model-name').value = result.modelName;
      }
    });
    
    // Save settings
    document.getElementById('save-settings').addEventListener('click', () => {
      const apiKey = document.getElementById('api-key').value.trim();
      const modelName = document.getElementById('model-name').value;
      
      chrome.storage.local.set({ apiKey, modelName }, () => {
        const statusEl = document.getElementById('status-message');
        statusEl.textContent = "Settings saved!";
        
        setTimeout(() => {
          statusEl.textContent = "";
        }, 2000);
      });
    });
  });
  