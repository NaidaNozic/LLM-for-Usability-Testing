importScripts('config.js');

let lastActiveTabId = null;

chrome.action.onClicked.addListener(async (tab) => {
    lastActiveTabId = tab.id;
  
    chrome.windows.create({
      url: chrome.runtime.getURL("index.html"),
      type: "popup",
      width: 800,
      height: 600
    });
});
  

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'TAKE_SCREENSHOT') {
        if (!lastActiveTabId) {
          sendResponse({ screenshot: null });
          return true;
        }
    
        chrome.tabs.get(lastActiveTabId, (tab) => {
          if (chrome.runtime.lastError || !tab) {
            console.error('Could not get tab:', chrome.runtime.lastError);
            sendResponse({ screenshot: null });
            return;
          }
    
          chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError || !dataUrl) {
              console.error('Screenshot error:', chrome.runtime.lastError);
              sendResponse({ screenshot: null });
              return;
            }
    
            sendResponse({ screenshot: dataUrl });
          });
        });
    
        return true;
      }

    if (request.type === 'DETECT_USABILITY') {
        const base64Image = request.base64Image;

        const imageSizeInBytes = Math.ceil((base64Image.length * 3) / 4);
        const imageSizeInMB = imageSizeInBytes / (1024 * 1024);

        if (imageSizeInMB > 20) {
        sendResponse({
            result: 'Image too large (${imageSizeInMB.toFixed(2)} MB). OpenAI only accepts images under 20MB.',
        });
        return true;
        }

        const openaiApiCall = async () => {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                {
                    role: 'user',
                    content: [
                    {
                        type: 'text',
                        text: 'Look at this image and identify any usability issues it may have.',
                    },
                    {
                        type: 'image_url',
                        image_url: {
                        url: `data:image/png;base64,${base64Image}`,
                        },
                    },
                    ],
                },
                ],
                max_tokens: 2000,
            }),
            });

            if (!response.ok) {
            const errorText = await response.text();        
            sendResponse({
                result: 'OpenAI API Error (${response.status}): ${errorText}',
            });
            return;
            }

            const data = await response.json();
            sendResponse({ result: data.choices[0].message.content });
        } catch (error) {
            sendResponse({ result: 'Sorry, there was an error analyzing the usability.' });
        }
        };

        openaiApiCall();
        return true;
    }
});
  
  