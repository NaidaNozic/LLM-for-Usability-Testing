import { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  TextField,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  ClickAwayListener,
  Stack 
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './App.css';
import NoContent from './components/NoContent';
import LoadingOverlay from './components/LoadingOverlay';
import DetailsDialog from './components/DetailsDialog';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function App() {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [anchorEls, setAnchorEls] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [evaluationType, setEvaluationType] = useState('heuristic');

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
          },
        ]);
      } else {
        setSnackbarMessage('Failed to capture screenshot.');
        setSnackbarOpen(true);
      }
    });
  };

  const handleImageClick = (index) => {
    const selectedScreenshot = screenshots[index];
  
    setLoading(true);
    const base64Image = selectedScreenshot.src.split(',')[1];

    chrome.runtime.sendMessage(
      {
        type: 'DETECT_USABILITY',
        base64Images: [base64Image],
        overview,
        tasks: [selectedScreenshot.task],
      },
      (responseFromSW) => {
        setLoading(false);
        if (responseFromSW?.result) {
          chrome.storage.local.set({ usabilityOutput: responseFromSW.result }, () => {
            window.open(chrome.runtime.getURL('result.html'), '_blank');
          });
        } else {
          setSnackbarMessage('Sorry, I could not detect any usability issues.');
          setSnackbarOpen(true);
        }
      }
    );
  };

  const handleWalkthroughEvaluation = () => {
    if (screenshots.length === 0) {
      setSnackbarMessage('Please capture at least one screenshot first.');
      setSnackbarOpen(true);
      return;
    }
  
    setLoading(true);
  
    const base64Images = screenshots.map((img) => img.src.split(',')[1]);
    const tasks = screenshots.map((img) => img.task || '');
  
    chrome.runtime.sendMessage(
      {
        type: 'DETECT_WALKTHROUGH_ISSUES',
        base64Images,
        overview,
        tasks,
      },
      (responseFromSW) => {
        setLoading(false);
        if (responseFromSW?.result) {
          chrome.storage.local.set({ usabilityOutput: responseFromSW.result }, () => {
            window.open(chrome.runtime.getURL('result.html'), '_blank');
          });
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
      i === selectedTaskIndex ? { ...s, task: taskInput } : s
    );
    setScreenshots(updated);
    setTaskDialogOpen(false);
    setSelectedTaskIndex(null);
    setTaskInput('');
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
          <TextFieldOverview
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
          <div className='image-container'>
            {screenshots.map((screenshot, idx) => (
              <div className={`image-item ${evaluationType == 'heuristic' ? 'image-item-hover' : ''}`} 
                   key={idx} 
                   onClick={evaluationType === 'heuristic' ? () => handleImageClick(idx) : undefined}>
                <img
                  src={screenshot.src}
                  alt={`Screenshot ${idx + 1}`}
                  style={{
                    width: '100px',
                    borderRadius: '8px',
                    display: 'block',
                    marginLeft: '8px'
                  }}
                />
                <div className='image-item-content'>
                  {screenshot.editing ? (
                    <ClickAwayListener onClickAway={() => handleFinishEditing(idx)}>
                      <TextFieldTitle
                        variant="outlined"
                        size="small"
                        value={screenshot.title}
                        onClick={(e) => {e.stopPropagation();}}
                        onChange={(e) => handleTitleChange(idx, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleFinishEditing(idx);
                          }
                        }}
                        autoFocus
                      />
                    </ClickAwayListener>
                  ) : (
                    <span className='image-title'>{screenshot.title}</span>
                  )}

                  <CustomIconButton
                    size="small"
                    onClick={(e) => {handleMenuOpen(idx, e); e.stopPropagation();}}
                    style={{ marginLeft: '4px' }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </CustomIconButton>

                  <Menu
                    anchorEl={anchorEls[idx]}
                    open={Boolean(anchorEls[idx])}
                    onClick={(e) => {e.stopPropagation();}}
                    onClose={() => handleMenuClose(idx)}
                  >
                    <MenuItem onClick={() => handleRenameClick(idx)}>Rename</MenuItem>
                    <MenuItem onClick={() => handleDeleteClick(idx)}>Delete</MenuItem>
                    <MenuItem onClick={() => {
                      setSelectedTaskIndex(idx);
                      setTaskInput(screenshots[idx]?.task || '');
                      setTaskDialogOpen(true);
                    }}>Add user task</MenuItem>
                  </Menu>
                </div>
              </div>
            ))}
          </div>
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

        {evaluationType === 'walkthrough' && (
          <CustomButton
            sx={{width: '170px'}}
            variant="contained"
            onClick={handleWalkthroughEvaluation}
          >
            Start walkthrough
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
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        taskInput={taskInput}
        onTaskInputChange={(e) => setTaskInput(e.target.value)}
        onSave={handleTaskDialogSave}
      />
    </>
  );
}

const CustomIconButton = styled(IconButton)({
  color: 'white',
  '&:focus': {
      boxShadow: 'none',
      outline: 'none'
    },
    '&:active': {
      boxShadow: 'none',
      outline: 'none'
    },
});

const CustomButton = styled(Button)({
  borderRadius: '10px',
  backgroundColor: 'rgba(87,65,69,255)',
  color: '#fff',
  textTransform: 'none',
  fontSize: '12px',
  fontWeight: '500',
  padding: '10px 0px 10px 0px',
  height: '41px',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: 'rgba(150, 120, 125, 0.7)',
    boxShadow: 'none',
  },
  '&:focus': {
    boxShadow: 'none',
    outline: 'none'
  },
  '&:active': {
    boxShadow: 'none',
    outline: 'none'
  },
});

const TextFieldOverview = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '5px',
    padding: '8px',
    '& fieldset': {
      borderColor: 'white',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
  },
  '& .MuiInputBase-input': {
    color: 'white',
    fontSize: '12px',
    '&::placeholder': {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.6)',
    },
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.4)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(255, 255, 255, 0.6)',
    },
  },
  '& textarea::placeholder': {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  '& .MuiInputLabel-root': {
    color: 'white',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'white',
  },
});

const TextFieldTitle = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '5px',
    padding: '8px',
    '& fieldset': {
      borderColor: 'white',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
  },
  '& .MuiInputBase-input': {
    color: 'white',
    fontSize: '12px',
    padding: '2px',
    '&::placeholder': {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.6)',
    },
  },
  '& textarea::placeholder': {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  '& .MuiInputLabel-root': {
    color: 'white',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'white',
  },
});

/* Toggle buttons */
const CustomToggleButton = styled(Button)({
  borderRadius: '8px',
  color: '#fff',
  textTransform: 'none',
  fontSize: '12px',
  fontWeight: '500',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
  '&:focus': {
    boxShadow: 'none',
    outline: 'none'
  },
  '&:active': {
    boxShadow: 'none',
    outline: 'none'
  },
});

export default App;
