import { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert
} from '@mui/material';
import './App.css';
import NoContent from './components/NoContent';
import LoadingOverlay from './components/LoadingOverlay';
import DetailsDialog from './components/DetailsDialog';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import EvaluationDialog from './components/EvaluationDialog';
import ScreenshotList from './components/ScreenshotList';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { CustomButton, TextFieldContent, CustomToggleButton } from './components/SharedCustomControls';

function App() {
  const [screenshots, setScreenshots] = useState([]);
  const [walkthroughScreenshots, setWalkthroughScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [anchorEls, setAnchorEls] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [correctActionInput, setCorrectActionInput] = useState('');
  const [questionsInput, setQuestionsInput] = useState('');
  const [evaluationType, setEvaluationType] = useState('heuristic');
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [provider, setProvider] = useState('openai');

  useEffect(() => {
    chrome.storage.local.get(['apiKey', 'provider'], (result) => {
      if (result.apiKey && result.provider) {
        setApiKey(result.apiKey);
        setProvider(result.provider);
        setHasApiKey(true);
      }
    });
  }, []);

  const handleSave = (key, provider) => {
    setApiKey(key);
    setProvider(provider);
    chrome.storage.local.set({ apiKey: key, provider }, () => {
      setHasApiKey(true);
    });
  };  

  const getCurrentScreenshots = () => {
    return evaluationType === 'heuristic' ? screenshots : walkthroughScreenshots;
  };
  
  const setCurrentScreenshots = (updated) => {
    if (evaluationType === 'heuristic') {
      setScreenshots(updated);
    } else {
      setWalkthroughScreenshots(updated);
    }
  };  

  const handleCaptureScreenshot = () => {
    setCapturing(true);
    chrome.runtime.sendMessage({ type: 'TAKE_SCREENSHOT' }, (response) => {
      setCapturing(false);
      if (response?.screenshot) {
        const newIndex = evaluationType === 'heuristic' 
          ? screenshots.length + 1 
          : walkthroughScreenshots.length + 1;
  
        const newScreenshot = {
          src: response.screenshot,
          title: `Screen ${newIndex}`,
          editing: false,
          correctAction: '',
          questions: ''
        };
  
        if (evaluationType === 'heuristic') {
          setScreenshots((prev) => [...prev, newScreenshot]);
        } else if (evaluationType === 'walkthrough') {
          setWalkthroughScreenshots((prev) => [...prev, newScreenshot]);
        }
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
        questions: selectedScreenshot.questions,
        apiKey: apiKey,
        apiType: provider,
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
    const selectedScreenshot = walkthroughScreenshots[index];

    if (!taskInput || !selectedScreenshot.correctAction || walkthroughScreenshots.some(s => !s.correctAction)) {
      setSnackbarMessage('Please fill in the "Edit" details for all the screens before starting the walkthrough.');
      setSnackbarOpen(true);
      return;
    }
  
    setLoading(true);

    const allCorrectActionsString = walkthroughScreenshots
    .map((s, idx) => `Step ${idx + 1}: ${s.correctAction}`)
    .join('\n');
    const base64Image = selectedScreenshot.src.split(',')[1];

    chrome.runtime.sendMessage(
      {
        type: 'DETECT_WALKTHROUGH_ISSUES',
        base64Images: [base64Image],
        overview,
        tasks: [taskInput],
        correctActions: [selectedScreenshot.correctAction],
        entireWalkthrough: allCorrectActionsString, 
        questions: selectedScreenshot.questions,
        apiKey: apiKey,
        apiType: provider,
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
    const updated = getCurrentScreenshots().filter((_, i) => i !== index);
    setCurrentScreenshots(updated);
    setAnchorEls({});
  };

  const handleRenameClick = (index) => {
    const updated = getCurrentScreenshots().map((s, i) =>
      i === index ? { ...s, editing: true } : s
    );
    setCurrentScreenshots(updated);
    setAnchorEls({});
  };

  const handleTitleChange = (index, newTitle) => {
    const updated = getCurrentScreenshots().map((s, i) =>
      i === index ? { ...s, title: newTitle } : s
    );
    setCurrentScreenshots(updated);
  };

  const handleFinishEditing = (index) => {
    const updated = getCurrentScreenshots().map((s, i) =>
      i === index ? { ...s, editing: false } : s
    );
    setCurrentScreenshots(updated);
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
    const updated = getCurrentScreenshots().map((s, i) =>
      i === selectedImageIndex ? {
        ...s,
        correctAction: correctActionInput,
        questions: questionsInput
      } : s
    );
    setCurrentScreenshots(updated);
    setDetailsDialogOpen(false);
    setSelectedImageIndex(null);
    setCorrectActionInput('');
    setQuestionsInput('');
  };

  const handleViewClick = (index) => {
    const imageData = getCurrentScreenshots()[index].src;
  
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

  const clearData = () => {
    if(evaluationType == "walkthrough") {
      setWalkthroughScreenshots([]);
      setTaskInput('');
    } else {
      setScreenshots([]);
    }
  };

  if (!hasApiKey) {
    return ( <ApiKeyPrompt onSave={handleSave}/> )
  } else {
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
            <p className='text-field-label'>App overview (optional)</p>
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
  
        {evaluationType == 'walkthrough' ? (
          <div className="card">
          <div style={{ padding: '0px 8px 0px 8px' }}>
            <p className='text-field-label'>User task*</p>
            <div style={{ textAlign: 'left', marginBottom: '5px' }}>
              <span className='text-hint'>Provide a short description of the user's activity or goal.</span>
            </div>
            <TextFieldContent
              multiline
              rows={2}
              placeholder='The user task is...'
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            />
          </div>
        </div>
        ) : null}
  
        <div className="card">
          {evaluationType == 'heuristic' ? (
            <div>
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
                    onEditDetailsClick={(idx) => {
                      setSelectedImageIndex(idx);
                      setCorrectActionInput(screenshots[idx]?.correctAction || '');
                      setQuestionsInput(screenshots[idx]?.questions || '');
                      setDetailsDialogOpen(true);
                    }}
                    onViewClick={handleViewClick} />
              )}
            </div>
          ) : (
            <div>
              <p className='title'>All pages</p>
              <span className='text-hint all-pages'>Captured screens represent steps a user takes to complete the user task.
                                                    These steps will be analyzed to identify usability issues.</span>
              {walkthroughScreenshots.length === 0 ? (
                <NoContent />
              ) : (
                <ScreenshotList
                    screenshots={walkthroughScreenshots}
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
                    onEditDetailsClick={(idx) => {
                      setSelectedImageIndex(idx);
                      setCorrectActionInput(walkthroughScreenshots[idx]?.correctAction || '');
                      setQuestionsInput(walkthroughScreenshots[idx]?.questions || '');
                      setDetailsDialogOpen(true);
                    }}
                    onViewClick={handleViewClick} />
              )}
            </div>
          )}
          
        </div>
  
        <div className='footer-button'>
          <CustomButton
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleCaptureScreenshot}
            disabled={capturing}
            sx={{width: '170px'}} >
            {capturing ? 'Adding...' : 'Add current screen'}
          </CustomButton>
  
          <CustomButton
            variant="contained"
            sx={{width: '170px'}} 
            onClick={clearData} >
            Clear all
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
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          onSave={handleTaskDialogSave}
          correctActionInput={correctActionInput}
          onCorrectActionInputChange={(e) => setCorrectActionInput(e.target.value)}
          evaluationType={evaluationType}
          questionsInput={questionsInput}
          questionsInputChange={(e) => setQuestionsInput(e.target.value)}
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
}

export default App;
