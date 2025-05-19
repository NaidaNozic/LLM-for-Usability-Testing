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
    const messages = [{"role": "system", "content": getWalkthroughSystemPrompt(request.recommenderSys)}];
    const content = [];

    if (request.overview && request.overview.trim() !== '') {
      content.push({
        type: 'text',
        text: `You are given a web application about: ${request.overview.trim()}`,
      });
    }

    content.push({
      type: 'text',
      text: "You are shown one screenshot of a web interface, before the user takes a correct action to achieve his task.",
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
          text: `The given screen corresponds to the state before the user does the correct action: ${correctAction.trim()}.`,
        });
      }
    });

    content.push({
      type: 'text',
      text: getWalkthroughMetrics(request.recommenderSys),
    });

    content.push({
      type: 'text',
      text: getWalkthroughRequest(request.recommenderSys),
    });
    
    content.push({
      type: 'text',
      text: getWalkthroughOutputFormat(request.recommenderSys),
    });

    messages.push({
      role: "user",
      content: content
    });

    console.log(messages);

    if (request.apiType === 'gemini') {
      // Gemini API call
      const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gemini-2.0-flash',
          messages: messages,
        }),
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        sendResponse({ result: `Gemini API Error (${geminiResponse.status}): ${errorText}` });
        return;
      }

      const geminiData = await geminiResponse.json();
      sendResponse({ result: geminiData.choices[0].message.content });

    } else {
      // OpenAI API call
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
        }),
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        sendResponse({ result: `OpenAI API Error (${openaiResponse.status}): ${errorText}` });
        return;
      }

      const openaiData = await openaiResponse.json();
      sendResponse({ result: openaiData.choices[0].message.content });
    }
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
    const content = [{ type: 'text', text: getSystemPrompt(request.recommenderSys) }];

    base64Images.forEach((base64Image, index) => {
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/png;base64,${base64Image}` },
      });
    });

    if (request.overview && request.overview.trim() !== '') {
      content.push({
        type: 'text',
        text: `You are given a web application about: ${request.overview.trim()}`,
      });
    }
    if (request.userGroup && request.userGroup.trim() !== '') {
      content.push({
        type: 'text',
        text: `The target user group of this application is: ${request.userGroup.trim()}`,
      });
    }
    if (request.userTask && request.userTask.trim() !== '') {
      content.push({
        type: 'text',
        text: `The task the user is conducting is: ${request.userTask.trim()}`,
      });
    }

    content.push({
        type: 'text',
        text: getMetrics(request.recommenderSys),
      });

    content.push({
      type: 'text',
      text: getRequest(request.recommenderSys),
    });

    content.push({
      type: 'text',
      text: getOutputFormat(request.recommenderSys),
    });

    console.log(content);

    if (request.apiType === 'gemini') {
      // Gemini API call
      const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gemini-2.0-flash',
          messages: [
            {
              role: 'user',
              content: content,
            },
          ]
        }),
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        sendResponse({ result: `Gemini API Error (${geminiResponse.status}): ${errorText}` });
        return;
      }

      const geminiData = await geminiResponse.json();
      sendResponse({ result: geminiData.choices[0].message.content });

    } else {
      // OpenAI API call
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: content,
            },
          ]
        }),
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        sendResponse({ result: `OpenAI API Error (${openaiResponse.status}): ${errorText}` });
        return;
      }

      const openaiData = await openaiResponse.json();
      sendResponse({ result: openaiData.choices[0].message.content });
    }
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

function getSystemPrompt(isRecSys) {
  return isRecSys ? recsys_prompt : system_prompt;
}

function getRequest(isRecSys) {
  return isRecSys ? recsys_request : request_for_evaluation;
}

function getMetrics(isRecSys) {
  return isRecSys ? recsys_metrics : nielsen_heuristics;
}

function getOutputFormat(isRecSys) {
  return isRecSys ? recsys_output_format : output_format;
}

function getWalkthroughSystemPrompt(isRecSys) {
  return isRecSys ? rec_system_walkthrough_prompt : system_walkthrough_prompt;
}

function getWalkthroughRequest(isRecSys) {
  return isRecSys ? rec_request_walkthrough : request_walkthrough;
}

function getWalkthroughMetrics(isRecSys) {
  return isRecSys ? rec_walkthrough_metrics : walkthrough_metrics;
}

function getWalkthroughOutputFormat(isRecSys) {
  return isRecSys ? rec_output_format_walkthrough : output_format_walkthrough;
}
