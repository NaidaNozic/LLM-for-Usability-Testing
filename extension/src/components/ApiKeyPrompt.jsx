import { useState } from 'react';
import { Snackbar, Alert, IconButton, InputAdornment, TextField, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { CustomButton } from './SharedCustomControls';
import './ApiKeyPrompt.css';

export default function ApiKeyPrompt({ onSave }) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiType, setApiType] = useState('openai');
  const [showApiKey, setShowApiKey] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSave = () => {
    if (apiKeyInput.trim() === '') {
      setSnackbarMessage('API Key is required.');
      setSnackbarOpen(true);
      return;
    }

    chrome.storage.local.set({ apiKey: apiKeyInput, provider: apiType }, () => {
        onSave(apiKeyInput, apiType);
      });
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

      <h3 style={{textAlign: 'left'}}>Enter your API Key</h3>
      <FormControl fullWidth margin="normal">
        <WhiteBorderInputLabel id="api-type-select-label">Select API</WhiteBorderInputLabel>
        <WhiteBorderSelect
          labelId="api-type-select-label"
          value={apiType}
          onChange={(e) => setApiType(e.target.value)}
          label="Select API"
        >
          <MenuItem value="openai">OpenAI</MenuItem>
          <MenuItem value="gemini">Gemini</MenuItem>
        </WhiteBorderSelect>
      </FormControl>

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

const WhiteBorderSelect = styled(Select)({
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'white',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'white',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'white',
    },
    '& .MuiSelect-select': {
      color: 'white',
      fontSize: '12px',
    },
  });
  
  const WhiteBorderInputLabel = styled(InputLabel)({
    color: 'white',
    '&.Mui-focused': {
      color: 'white',
    },
  });