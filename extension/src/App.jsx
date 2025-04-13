import { useState } from 'react'
import './App.css'
import { TextField, Typography, Button } from '@mui/material';

function App() {
  const [screenshot, setScreenshot] = useState('');
  const [output, setOutput] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [overview, setOverview] = useState('');
  const [task, setTask] = useState('');

  const handleCaptureScreenshot = () => {
    chrome.runtime.sendMessage({ type: 'TAKE_SCREENSHOT' }, (response) => {
      if (response?.screenshot) {
        setScreenshot(response.screenshot);
      } else {
        setOutput('Failed to capture screenshot.');
      }
    });
  };

  const handleDetectUsability = () => {
    if (!screenshot) {
      setOutput('Please capture a screenshot first.');
      return;
    }
  
    setLoading(true);
    const base64Image = screenshot.split(',')[1];
  
    chrome.runtime.sendMessage(
      {
        type: 'DETECT_USABILITY',
        base64Image,
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
          <button onClick={handleCaptureScreenshot}>
            Capture screen
          </button>
          <br />
          <button onClick={handleDetectUsability}>
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
