import { useState, useEffect  } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [screenshot, setScreenshot] = useState('');
  const [output, setOutput] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [logJSON, setLogJSON] = useState(null);

  const handleScrape = () => {
    setLoading(true);

    chrome.runtime.sendMessage({ type: 'TAKE_SCREENSHOT' }, (response) => {
      if (response?.screenshot) {
        const base64Image = response.screenshot.split(',')[1];
        setScreenshot(response.screenshot)
  
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
      } else {
        setLoading(false);
        setOutput('Failed to capture screenshot.');
      }
    });
  };

  return (
    <>
      <div class="main-container">
        <h1>UX/UI LLM</h1>

        <div className="card">
          <p>
            Click the button below to capture a screenshot of the current tab and detect any usability issues using AI.
          </p>
          <button onClick={handleScrape}>
            Detect Usability Issues
          </button>

          {screenshot && (
            <div>
              <h3>Screenshot Preview:</h3>
              <img
                src={screenshot}
                alt="Screenshot"
                style={{ maxWidth: '100%', border: '1px solid #ccc', borderRadius: '8px', marginTop: '10px' }}
              />
            </div>
          )}

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
          <br />
        </div>

        <p className="read-the-docs">
         Chrome extension for usability testing.
        </p>
      </div>
    </>
  )
}

export default App
