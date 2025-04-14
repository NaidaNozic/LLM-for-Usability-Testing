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
  ClickAwayListener
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './App.css';
import NoContent from './components/NoContent';
import LoadingOverlay from './components/LoadingOverlay';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function App() {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState('');
  const [task, setTask] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [anchorEls, setAnchorEls] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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
        task,
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

  return (
    <>
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
              <div className='image-item' key={idx} onClick={() => handleImageClick(idx)}>
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
  width: '180px',
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

export default App;
