import { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Switch
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
  const [evaluationType, setEvaluationType] = useState('heuristic');
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [userTask, setUserTask] = useState('');
  const [userGroup, setUserGroup] = useState('');
  const [globalUserGroup, setGlobalUserGroup] = useState('');
  const [recommenderSys, setRecommenderSys] = useState(true);

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
    if (evaluationType !== 'heuristic' && walkthroughScreenshots.length >= 7) {
      setSnackbarMessage('Maximum of 7 screenshots allowed for walkthrough.');
      setSnackbarOpen(true);
      return;
    }

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
          userGroup: '',
          userTask: '',
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

    if (!selectedScreenshot.userGroup || !selectedScreenshot.userTask || !overview) {
      setSnackbarMessage('Please fill in app overview and "Edit" details before starting the evaluation.');
      setSnackbarOpen(true);
      return;
    }
  
    setLoading(true);
    const base64Image = selectedScreenshot.src.split(',')[1];

    chrome.runtime.sendMessage(
      {
        type: 'DETECT_USABILITY',
        base64Images: [base64Image],
        overview,
        userGroup: selectedScreenshot.userGroup,
        userTask: selectedScreenshot.userTask,
        apiKey: apiKey,
        apiType: provider,
        recommenderSys: recommenderSys,
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

  const handleEvaluationMultipleImages = () => {
    if (walkthroughScreenshots.length === 0) {
      setSnackbarMessage('Please capture at least one screenshot first.');
      setSnackbarOpen(true);
      return;
    }

    if (!taskInput || !overview || !globalUserGroup) {
      setSnackbarMessage('Please fill in the "overview", "User group", "goal".');
      setSnackbarOpen(true);
      return;
    }
  
    setLoading(true);
  
    const base64Images = walkthroughScreenshots.map((img) => img.src.split(',')[1]);
    const titlesArray = walkthroughScreenshots.map((s) => s.title);
  
    chrome.runtime.sendMessage(
      {
        type: 'DETECT_USABILITY_MULTIPLE_IMAGES',
        base64Images,
        overview,
        userTask: taskInput,
        titles: titlesArray,
        userGroup: globalUserGroup,
        apiKey: apiKey,
        apiType: provider,
        recommenderSys: recommenderSys,
      },
      (responseFromSW) => {
        setLoading(false);
        if (responseFromSW?.result) {
          chrome.storage.local.set({ usabilityOutput: responseFromSW.result }, () => {
            window.open(chrome.runtime.getURL('result-walkthrough.html'), '_blank');
          });
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
        userGroup: userGroup,
        userTask: userTask,
      } : s
    );
    setCurrentScreenshots(updated);
    setDetailsDialogOpen(false);
    setSelectedImageIndex(null);
    setCorrectActionInput('');
    setUserGroup('');
    setUserTask('');
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
          Evaluation
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
            Multiscreen evaluation
          </CustomToggleButton>
        </div>
  
        <div className="card">
          <div className='recsys-switch'>
            <p className='text-field-label'>Recommender system</p>
            <Switch checked={recommenderSys} onChange={(event) => setRecommenderSys(event.target.checked)} color="primary" />
          </div>
          <hr className='hr-line'></hr>
          <div style={{ padding: '0px 8px 0px 8px' }}>
            <p className='text-field-label'>App overview*</p>
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
          <>
         <div className="card">
            <div style={{ padding: '0px 8px 0px 8px' }}>
              <p className='text-field-label'>User group*</p>
              <div style={{ textAlign: 'left', marginBottom: '5px' }}>
                <span className='text-hint'>User relevant personal characteristics (e.g., age, domain knowledge, preferences...)</span>
              </div>
              <TextFieldContent
                multiline
                rows={2}
                placeholder='e.g., Users aged 80 that are unfamiliar with the application.'
                value={globalUserGroup}
                onChange={(e) => setGlobalUserGroup(e.target.value)}
              />
            </div>
         </div>

         <div className="card">
            <div style={{ padding: '0px 8px 0px 8px' }}>
              <p className='text-field-label'>User goal*</p>
              <div style={{ textAlign: 'left', marginBottom: '5px' }}>
                <span className='text-hint'>Provide a short description of the user's goal.</span>
              </div>
              <TextFieldContent
                multiline
                rows={2}
                placeholder='The user wants to...'
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
              />
            </div>
         </div>
         </>
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
                      setUserGroup(screenshots[idx]?.userGroup || '');
                      setUserTask(screenshots[idx]?.userTask || '');
                      setDetailsDialogOpen(true);
                    }}
                    onViewClick={handleViewClick} />
              )}
            </div>
          ) : (
            <div>
              <p className='title'>All pages</p>
              <span className='text-hint all-pages'>Captured screens represent steps a user takes to complete his/her goal.
                                                    These steps will be analyzed to identify usability issues.</span>
              {walkthroughScreenshots.length === 0 ? (
                <NoContent />
              ) : (
                <ScreenshotList
                    screenshots={walkthroughScreenshots}
                    anchorEls={anchorEls}
                    evaluationType={evaluationType}
                    onImageClick={() => {}}
                    onMenuOpen={handleMenuOpen}
                    onMenuClose={handleMenuClose}
                    onRenameClick={handleRenameClick}
                    onDeleteClick={handleDeleteClick}
                    onTitleChange={handleTitleChange}
                    onFinishEditing={handleFinishEditing}
                    onEditDetailsClick={(idx) => {
                      setSelectedImageIndex(idx);
                      setCorrectActionInput(walkthroughScreenshots[idx]?.correctAction || '');
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
            sx={{width: 'auto'}} 
            onClick={clearData} >
            Clear all
          </CustomButton>

          {evaluationType === 'walkthrough' && (
            <CustomButton
              sx={{width: 'auto'}}
              variant="contained"
              onClick={handleEvaluationMultipleImages}
            >
              Start
            </CustomButton>
          )}
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
          userGroup={userGroup}
          userGroupChange={(e) => setUserGroup(e.target.value)}
          userTaskInput={userTask}
          userTaskInputChange={(e) => setUserTask(e.target.value)}
        />
  
        <EvaluationDialog
          open={evaluationDialogOpen}
          onClose={() => setEvaluationDialogOpen(false)}
          onEvaluate={evaluationType == 'heuristic' ? handleHeuristicEvaluation : handleEvaluationMultipleImages}
          selectedIndex={selectedImageIndex}
          evaluationType={evaluationType}
        />
  
      </>
    );
  }
}

export default App;
