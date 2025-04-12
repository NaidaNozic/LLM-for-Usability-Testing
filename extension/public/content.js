console.log("Content script injected and running!");

function handleClick(event) {
    if (!event.isTrusted) return;

    const target = event.target;
    const tagName = target.tagName;

    const rawDetails = {
        tagName,
        id: target.id,
        innerText: target.innerText,
        classList: target.className,
        name: target.name,
        href: target.href,
        src: target.src,
        title: target.title,
        alt: target.alt,
        ariaLabel: target.getAttribute('aria-label'),
    };

    const details = {};
    for (const [key, value] of Object.entries(rawDetails)) {
        if (value != null && value !== '') {
            details[key] = value;
        }
    }

    const log = {
        title: 'Click',
        timestamp: new Date().toISOString(),
        log: `User clicked on a <${tagName}>.`,
        details,
    };

    chrome.runtime.sendMessage({
        type: 'INTERACTION_LOG',
        ...log,
    });
}

document.addEventListener('click', handleClick);

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'STOP_RECORDING') {
        document.removeEventListener('click', handleClick);
        console.log("Recording stopped and event listener removed.");
    }
});
