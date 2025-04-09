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

  const startRecording = () => {
    chrome.runtime.sendMessage({ type: 'START_RECORDING' });
  };

  const stopRecording = () => {
    chrome.runtime.sendMessage({ type: 'END_RECORDING' }, (response) => {
      if (response) {
        setLogJSON(response.log);
      } else {
        console.error('Failed to retrieve interaction logs');
      }
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
          {/* Interaction usability issues */}
          <button onClick={startRecording}>Start Recording</button>
          <button onClick={stopRecording}>Stop Recording</button>
          <br/>
          {logJSON && (
            <>
              <h3>Interaction Logs</h3>
              {logJSON.map((entry, index) => (
                <div key={index} className='interaction-logs-container'>
                  <div className='interaction-logs'>
                    <p><strong>Action title: </strong>{entry.title}</p>
                    <p><strong>Timestamp: </strong><em>{entry.timestamp}</em></p>
                    <p><strong>Action log: </strong>
                      {typeof entry.log === 'object'
                        ? JSON.stringify(entry.log, null, 2)
                        : entry.log}
                    </p>

                    {/* Display element details */}
                    {entry.details && (
                      <div style={{ marginTop: '10px' }}>
                        <strong>Clicked element details:</strong>
                        <ul>
                          {Object.entries(entry.details).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong>{' '}
                              {typeof value === 'object' ? JSON.stringify(value) : value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {entry.screenshot && (
                    <img
                      src={entry.screenshot}
                      alt="Interaction screenshot"
                      style={{
                        maxWidth: '100%',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        marginTop: '10px',
                      }}
                    />
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(logJSON, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'interaction_logs.json';
                  a.click();
                }}
              >
                Download JSON
              </button>
            </>
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
