document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('usabilityOutput', (data) => {
      document.getElementById('usability-output').textContent =
        data.usabilityOutput || 'No output found.';
    });
  });
  