importScripts('config.js');
importScripts('utils.js');

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function takeScreenshot(sendResponse) {
  getCurrentTab()
    .then((tab) => {
      if (!tab) {
        console.log("No active tab found.");
        sendResponse({ screenshot: null });
        return;
      }

      chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError || !dataUrl) {
          console.error('Screenshot error:', chrome.runtime.lastError);
          sendResponse({ screenshot: null });
        } else {
          sendResponse({ screenshot: dataUrl });
        }
      });
    })
    .catch((error) => {
      console.error("Unexpected error taking screenshot:", error);
      sendResponse({ screenshot: null });
    });

  return true;
}

const detectUsabilityIssues = async (request, sendResponse) => {
  const base64Images = request.base64Images;
  console.log(`Number of images: ${base64Images.length}`);
  for (let i = 0; i < base64Images.length; i++) {
    const base64Image = base64Images[i];
    const imageSizeInBytes = Math.ceil((base64Image.length * 3) / 4);
    const imageSizeInMB = imageSizeInBytes / (1024 * 1024);

    if (imageSizeInMB > 20) {
      sendResponse({
        result: `Image ${i + 1} is too large (${imageSizeInMB.toFixed(2)} MB). OpenAI only accepts images under 20MB.`,
      });
      return true;
    }
  }

  try {
    const content = [
      { type: 'text', text: system_prompt },
    ];

    base64Images.forEach((base64Image, index) => {
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/png;base64,${base64Image}` },
      });
    });

    if (request.overview && request.overview.trim() !== '') {
      content.push({ type: 'text', text: `You are given a web application about: ${request.overview.trim()}` });
    }

    if (request.task && request.task.trim() !== '') {
      content.push({ type: 'text', text: `The user's task in the given app view is: ${request.task.trim()}` });
    }

    content.push({
      type: 'text',
      text: request_for_evaluation
    });


    console.log(content);    
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: content,
          },
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      sendResponse({ result: `OpenAI API Error (${response.status}): ${errorText}` });
      return;
    }

    const data = await response.json();
    sendResponse({ result: data.choices[0].message.content });
  } catch (error) {
    sendResponse({ result: 'Sorry, there was an error analyzing the usability.' });
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    
    case 'TAKE_SCREENSHOT':
      return takeScreenshot(sendResponse);

    case 'DETECT_USABILITY':
      detectUsabilityIssues(request, sendResponse);
      return true;

    default:
      sendResponse({ result: 'Unknown request type' });
      break;
  }
});