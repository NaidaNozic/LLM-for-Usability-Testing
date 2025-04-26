import { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Snackbar,
  Alert
} from '@mui/material';
import './App.css';
import NoContent from './components/NoContent';
import LoadingOverlay from './components/LoadingOverlay';
import DetailsDialog from './components/DetailsDialog';
import EvaluationDialog from './components/EvaluationDialog';
import ScreenshotList from './components/ScreenshotList';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { CustomButton, TextFieldContent, CustomToggleButton } from './components/CustomComponents';

function App() {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [anchorEls, setAnchorEls] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [correctActionInput, setCorrectActionInput] = useState('');
  const [evaluationType, setEvaluationType] = useState('heuristic');
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const handleCaptureScreenshot = () => {
    setCapturing(true);
    chrome.runtime.sendMessage({ type: 'TAKE_SCREENSHOT' }, (response) => {
      setCapturing(false);
      if (response?.screenshot) {
        const newIndex = screenshots.length + 1;
        setScreenshots((prev) => [
          ...prev,
          {
            src: response.screenshot,
            title: `Screen ${newIndex}`,
            editing: false,
            task: '',
            correctAction: ''
          },
        ]);
      } else {
        setSnackbarMessage('Failed to capture screenshot.');
        setSnackbarOpen(true);
      }
    });
  };

  const handleHeuristicEvaluation = (index) => {
    const selectedScreenshot = screenshots[index];
  
    setLoading(true);
    const base64Image = selectedScreenshot.src.split(',')[1];

    chrome.runtime.sendMessage(
      {
        type: 'DETECT_USABILITY',
        base64Images: [base64Image],
        overview,
      },
      (responseFromSW) => {
        setLoading(false);
        if (responseFromSW?.result) {
          chrome.storage.local.set(
            {
              usabilityOutput: responseFromSW.result,
              usabilityImage: selectedScreenshot.src
            },
            () => {
              window.open(chrome.runtime.getURL('result.html'), '_blank');
            }
          );
        } else {
          setSnackbarMessage('Sorry, I could not detect any usability issues.');
          setSnackbarOpen(true);
        }
      }
    );
  };

  const handleWalkthrough = (index) => {
    const selectedScreenshot = screenshots[index];

    if (!selectedScreenshot.task || !selectedScreenshot.correctAction) {
      setSnackbarMessage('Please fill in the "Edit" details for this screen before starting the walkthrough.');
      setSnackbarOpen(true);
      return;
    }
  
    setLoading(true);
    const base64Image = selectedScreenshot.src.split(',')[1];

    chrome.runtime.sendMessage(
      {
        type: 'DETECT_WALKTHROUGH_ISSUES',
        base64Images: [base64Image],
        overview,
        tasks: [selectedScreenshot.task],
        correctActions: [selectedScreenshot.correctAction]
      },
      (responseFromSW) => {
        setLoading(false);
        if (responseFromSW?.result) {
          chrome.storage.local.set(
            {
              usabilityOutput: responseFromSW.result,
              usabilityImage: selectedScreenshot.src
            },
            () => {
              window.open(chrome.runtime.getURL('result.html'), '_blank');
            }
          );
        } else {
          setSnackbarMessage('Sorry, I could not detect any usability issues.');
          setSnackbarOpen(true);
        }
      }
    );
  };

  const handleDeleteClick = (index) => {
    const updated = screenshots.filter((_, i) => i !== index);
    setScreenshots(updated);
    setAnchorEls({});
  };

  const handleRenameClick = (index) => {
    const updated = screenshots.map((s, i) =>
      i === index ? { ...s, editing: true } : s
    );
    setScreenshots(updated);
    setAnchorEls({});
  };

  const handleTitleChange = (index, newTitle) => {
    const updated = screenshots.map((s, i) =>
      i === index ? { ...s, title: newTitle } : s
    );
    setScreenshots(updated);
  };

  const handleFinishEditing = (index) => {
    const updated = screenshots.map((s, i) =>
      i === index ? { ...s, editing: false } : s
    );
    setScreenshots(updated);
  };

  const handleMenuOpen = (index, event) => {
    setAnchorEls({ ...anchorEls, [index]: event.currentTarget });
  };

  const handleMenuClose = (index) => {
    setAnchorEls({ ...anchorEls, [index]: null });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleTaskDialogSave = () => {
    const updated = screenshots.map((s, i) =>
      i === selectedImageIndex ? {
        ...s,
        task: taskInput,
        correctAction: correctActionInput
      } : s
    );
    setScreenshots(updated);
    setTaskDialogOpen(false);
    setSelectedImageIndex(null);
    setTaskInput('');
    setCorrectActionInput('');
  };  

  const handleViewClick = (index) => {
    const imageData = screenshots[index].src;
  
    const htmlContent = `
      <html>
        <head>
          <title>View Screenshot</title>
          <style>
            body {
              margin: 0;
              background-color: #111;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <img src="${imageData}" alt="Screenshot" />
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
  
    chrome.windows.create({
      url,
      type: 'popup',
      width: 800,
      height: 600
    });
  };  

  return (
    <>
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '4px'}}>
        <CustomToggleButton
          variant="contained"
          fullWidth
          onClick={() => setEvaluationType('heuristic')}
          sx={{
            backgroundColor: evaluationType === 'heuristic' ? 'rgb(34 112 175)' : 'rgba(87,65,69,255)',
            '&:hover': {
              backgroundColor: evaluationType === 'heuristic' ? 'rgb(56 140 209)' : 'rgba(150, 120, 125, 0.7)',
            },
          }}
        >
        Heuristic evaluation
        </CustomToggleButton>
        <CustomToggleButton
          variant="contained"
          fullWidth
          onClick={() => setEvaluationType('walkthrough')}
          sx={{
            backgroundColor: evaluationType === 'walkthrough' ? 'rgb(34 112 175)' : 'rgba(87,65,69,255)',
            '&:hover': {
              backgroundColor: evaluationType === 'walkthrough' ? 'rgb(56 140 209)' : 'rgba(150, 120, 125, 0.7)',
            },
          }}
        >
          Cognitive walkthrough
        </CustomToggleButton>
      </div>

      <div className="card">
        <div style={{ padding: '0px 8px 0px 8px' }}>
          <p className='text-field-label'>App overview</p>
          <div style={{ textAlign: 'left', marginBottom: '5px' }}>
            <span className='text-hint'>Briefly explain what the web app does, who it's for and/or its goals.</span>
          </div>
          <TextFieldContent
            multiline
            rows={2}
            placeholder='The application is...'
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <p className='title'>All pages</p>
        <span className='text-hint all-pages'>Captured screens from the web app. These will be analyzed to identify usability issues.</span>
        {screenshots.length === 0 ? (
          <NoContent />
        ) : (
          <ScreenshotList
              screenshots={screenshots}
              anchorEls={anchorEls}
              evaluationType={evaluationType}
              onImageClick={(idx) => {
                setSelectedImageIndex(idx);
                setEvaluationDialogOpen(true);
              }}
              onMenuOpen={handleMenuOpen}
              onMenuClose={handleMenuClose}
              onRenameClick={handleRenameClick}
              onDeleteClick={handleDeleteClick}
              onTitleChange={handleTitleChange}
              onFinishEditing={handleFinishEditing}
              onEditTaskClick={(idx) => {
                setSelectedImageIndex(idx);
                setTaskInput(screenshots[idx]?.task || '');
                setCorrectActionInput(screenshots[idx]?.correctAction || '');
                setTaskDialogOpen(true);
              }}
              onViewClick={handleViewClick} />
        )}
      </div>

      <div className='footer-button'>
        <CustomButton
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleCaptureScreenshot}
          disabled={capturing}
          sx={{width: '170px'}}
        >
          {capturing ? 'Adding...' : 'Add current screen'}
        </CustomButton>
      </div>

      {loading && <LoadingOverlay message="Detecting usability issues..." />}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <DetailsDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        taskInput={taskInput}
        onTaskInputChange={(e) => setTaskInput(e.target.value)}
        onSave={handleTaskDialogSave}
        correctActionInput={correctActionInput}
        onCorrectActionInputChange={(e) => setCorrectActionInput(e.target.value)}
        evaluationType={evaluationType}
      />

      <EvaluationDialog
        open={evaluationDialogOpen}
        onClose={() => setEvaluationDialogOpen(false)}
        onEvaluate={evaluationType == 'heuristic' ? handleHeuristicEvaluation : handleWalkthrough}
        selectedIndex={selectedImageIndex}
        evaluationType={evaluationType}
      />

    </>
  );
}

export default App;
