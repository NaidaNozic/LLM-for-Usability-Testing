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

let debounceTimeout;

function takeScreenshot(sendResponse) {
  if (debounceTimeout) return;
  
  debounceTimeout = setTimeout(() => {
    getCurrentTab()
      .then((tab) => {
        if (!tab) {
          console.log("No active tab found.");
          sendResponse({ screenshot: null });
          return;
        }

        chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (dataUrl) => {
          clearTimeout(debounceTimeout);
          debounceTimeout = null;

          if (chrome.runtime.lastError || !dataUrl) {
            console.log('Screenshot error:', JSON.stringify(chrome.runtime.lastError));
            sendResponse({ screenshot: null });
          } else {
            sendResponse({ screenshot: dataUrl });
          }
        });
      })
      .catch((error) => {
        console.log("Unexpected error taking screenshot:", error);
        sendResponse({ screenshot: null });
      });
  }, 300);

  return true;
}

const detectWalkthroughIssues = async (request, sendResponse) => {
  const base64Images = request.base64Images;
  const tasks = request.tasks || [];
  const correctActions = request.correctActions || [];

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
    const messages = [{"role": "system", "content": system_walkthrough_prompt}];
    const content = [];

    if (request.overview && request.overview.trim() !== '') {
      content.push({
        type: 'text',
        text: `You are given a web application about: ${request.overview.trim()}`,
      });
    }

    content.push({
      type: 'text',
      text: "You are shown one screenshot of a web interface, before the user takes an action to achieve his task.",
    });

    base64Images.forEach((base64Image, index) => {
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/png;base64,${base64Image}` },
      });


      const task = tasks[index];
      if (task && task.trim() !== '') {
        content.push({
          type: 'text',
          text: `In the above app view, the user task is: ${task.trim()}`,
        });
      }

      if (request.entireWalkthrough && request.entireWalkthrough.trim() !== '') {
        content.push({
          type: 'text',
          text: `The entire workflow for accomplishing the task is given as : ${request.entireWalkthrough.trim()}`,
        });
      }

      const correctAction = correctActions[index];
      if (correctAction && correctAction.trim() !== '') {
        content.push({
          type: 'text',
          text: `The given screen corresponds to the action: ${correctAction.trim()}`,
        });
      }
    });

    content.push({
      type: 'text',
      text: request_walkthrough,
    });

    if (request.questions && request.questions.trim() !== '') {
      content.push({
        type: 'text',
        text: request.questions.trim(),
      });
    } else {
      content.push({
        type: 'text',
        text: walkthrough_questions,
      });
    }

    content.push({
      type: 'text',
      text: output_format_walkthrough,
    });

    messages.push({
      role: "user",
      content: content
    });

    console.log(messages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages
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
    console.log(error);
    sendResponse({ result: 'Sorry, there was an error analyzing the usability.' });
  }
}

const detectUsabilityIssues = async (request, sendResponse) => {
  const base64Images = request.base64Images;

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
    const content = [{ type: 'text', text: system_prompt }];

    if (request.overview && request.overview.trim() !== '') {
      content.push({
        type: 'text',
        text: `You are given a web application about: ${request.overview.trim()}`,
      });
    }

    base64Images.forEach((base64Image, index) => {
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/png;base64,${base64Image}` },
      });
    });

    content.push({
      type: 'text',
      text: request_for_evaluation,
    });

    if (request.questions && request.questions.trim() !== '') {
      content.push({
        type: 'text',
        text: request.questions.trim(),
      });
    } else {
      content.push({
        type: 'text',
        text: nielsen_heuristics,
      });
    }

    content.push({
      type: 'text',
      text: output_format,
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
        ]
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

    case 'DETECT_WALKTHROUGH_ISSUES':
      detectWalkthroughIssues(request, sendResponse);
      return true;

    default:
      sendResponse({ result: 'Unknown request type' });
      break;
  }
});
