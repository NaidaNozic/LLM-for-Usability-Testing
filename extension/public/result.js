document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['usabilityOutput', 'usabilityImage'], (data) => {
    // Display the usability output
    document.getElementById('usability-output').textContent =
      data.usabilityOutput || 'No output found.';

    // Display the image if it exists
    if (data.usabilityImage) {
      const imageElement = document.getElementById('usability-image');
      imageElement.src = data.usabilityImage;
      imageElement.style.display = 'block';
    }
  });
});
