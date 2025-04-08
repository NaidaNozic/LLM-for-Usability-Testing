console.log("Content script injected and running!");

document.addEventListener('click', (event) => {
    const tagName = event.target.tagName;
    const innerText = event.target.innerText || '';

    const log = {
      title: 'Click',
      timestamp: new Date().toISOString(),
      log: `User clicked on ${tagName} (${innerText.slice(0, 50)})`,
    };

    chrome.runtime.sendMessage({
      type: 'INTERACTION_LOG',
      ...log,
    });

    console.log('User clicked:', log);
});