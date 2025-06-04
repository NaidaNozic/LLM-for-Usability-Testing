document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['usabilityOutput', 'usabilityImage'], (data) => {
    // Display the usability output
    document.getElementById('usability-output').textContent =
      data.usabilityOutput || 'No output found.';
  });
});
