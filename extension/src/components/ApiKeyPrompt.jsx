import { useState } from 'react';
import { Snackbar, Alert, IconButton, InputAdornment, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { CustomButton } from './SharedCustomControls';
import './ApiKeyPrompt.css';

export default function ApiKeyPrompt({ onSave }) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSave = () => {
    if (apiKeyInput.startsWith('sk-')) {
      chrome.storage.local.set({ apiKey: apiKeyInput }, () => {
        onSave(apiKeyInput);
      });
    } else {
      setSnackbarMessage('Please enter a valid OpenAI API key.');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const toggleShowPassword = () => {
    setShowApiKey((prev) => !prev);
  };

  return (
    <div className="card api-key-prompt">
      <div className='api-key-prompt-header'>
        <h2>LLM-Based Usability Issue Detection</h2>
        <p>Evaluate UI designs via LLMs using heuristics or task-based walkthroughs.</p>
      </div>

      <h3 style={{textAlign: 'left'}}>Enter your OpenAI API Key</h3>
      <TextFieldPrompt
        type={showApiKey ? 'text' : 'password'}
        value={apiKeyInput}
        onChange={(e) => setApiKeyInput(e.target.value)}
        fullWidth
        slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButtonPrompt onClick={toggleShowPassword} edge="end">
                    {showApiKey ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                  </IconButtonPrompt>
                </InputAdornment>
              )
            }
        }}
      />
      <CustomButton
        variant="contained"
        sx={{ marginTop: '16px' }}
        onClick={handleSave}
      >
        Save Key
      </CustomButton>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

const TextFieldPrompt = styled(TextField)({
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: '5px',
      padding: '0px',
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


const IconButtonPrompt = styled(IconButton)({
    color: 'white',
    padding: 0,
    marginRight: '16px',
    border: 'none',
    '&:focus': {
      outline: 'none',
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: 'transparent',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
});