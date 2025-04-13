import { useState } from 'react'
import './App.css'
import { TextField, Typography, Button } from '@mui/material';

function App() {
  const [screenshots, setScreenshots] = useState([]);
  const [output, setOutput] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [overview, setOverview] = useState('');
  const [task, setTask] = useState('');
  const [capturing, setCapturing] = useState(false);

  const handleCaptureScreenshot = () => {
    setCapturing(true);
    chrome.runtime.sendMessage({ type: 'TAKE_SCREENSHOT' }, (response) => {
      setCapturing(false);
      if (response?.screenshot) {
        setScreenshots((prev) => [...prev, response.screenshot]);
      } else {
        setOutput('Failed to capture screenshot.');
      }
    });
  };

  const handleDetectUsability = () => {
    setOutput("");
    if (screenshots.length === 0) {
      setOutput('Please capture at least one screenshot first.');
      return;
    }

    setLoading(true);
    const base64Images = screenshots.map((img) => img.split(',')[1]);
    
    chrome.runtime.sendMessage(
      {
        type: 'DETECT_USABILITY',
        base64Images: base64Images,
        overview,
        task,
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
  };

  const handleClear = () => {
    setScreenshots([]);
    setOutput('');
    setLoading(false);
  };

  return (
    <>
      <div class="main-container">
        <h1>UX/UI LLM</h1>

        <div className="card">
          <p>App overview</p>
          <TextField
              multiline
              rows={2}
              placeholder='Enter an app overview'
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
          />
          <br />
          <p>User task</p>
          <TextField
              multiline
              rows={2}
              placeholder='Enter the user task'
              value={task}
              onChange={(e) => setTask(e.target.value)}
          />
          <br />
          <button onClick={handleCaptureScreenshot} disabled={capturing}>
            {capturing ? 'Capturing...' : 'Capture screen'}
          </button>
          <br />
          <button onClick={handleDetectUsability}>Detect Usability Issues</button>
          <br />
          <button onClick={handleClear}>Clear</button>

          {screenshots.length > 0 && (
            <div>
              <h3>Screenshot Previews:</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {screenshots.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Screenshot ${idx + 1}`}
                    style={{
                      maxWidth: '100%',
                      width: '200px',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      marginTop: '10px',
                    }}
                  />
                ))}
              </div>
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
