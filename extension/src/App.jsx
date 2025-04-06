import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [screenshot, setScreenshot] = useState('');
  const [output, setOutput] = useState(''); 
  const [loading, setLoading] = useState(false); 

  const handleScrape = () => {
    setLoading(true);

    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Screenshot error:', chrome.runtime.lastError);
        setLoading(false);
        return;
      }

      setScreenshot(dataUrl);
      const base64Image = dataUrl.split(',')[1];
      console.log(base64Image);

      chrome.runtime.sendMessage(
        {
          type: 'DETECT_USABILITY',
          base64Image,
        },
        (responseFromSW) => {
          setLoading(false);
          if (responseFromSW?.result) {
            setOutput(responseFromSW.result);
          } else {
            setOutput('Sorry, I could not detect any usability issues.');
          }
        }
      );
    });
  };

  return (
    <>
      <div class="main-container">
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>

        <h1>UX/UI LLM</h1>

        <div className="card">
          <p>
            Click the button below to capture a screenshot of the current tab and detect any usability issues using AI.
          </p>
          <button onClick={handleScrape}>
            Detect Usability Issues
          </button>

          {/* Display the output from OpenAI */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            output && (
              <div>
                <h3>Detected usability issues:</h3>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  {output}
                </pre>
              </div>
            )
          )}

        </div>

        <p className="read-the-docs">
          Click on the logos to learn more about the used technologies
        </p>
      </div>
    </>
  )
}

export default App
