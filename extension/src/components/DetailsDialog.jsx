import { useState } from 'react';
import { styled } from '@mui/material/styles';
import './DetailsDialog.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';

const DetailsDialog = ({
  open,
  onClose,
  taskInput,
  onTaskInputChange,
  onSave,
  correctActionInput,
  onCorrectActionInputChange,
  evaluationType
}) => {
  const [showValidation, setShowValidation] = useState(false);

  const handleSaveClick = () => {
    setShowValidation(true);
    if (taskInput.trim() && correctActionInput.trim()) {
      setShowValidation(false);
      onSave();
    }
  };

  const handleClose = () => {
    setShowValidation(false);
    onClose();
  };  

  return (
    <DarkDialog open={open} onClose={onClose} aria-hidden={open ? "false" : "true"} >
      <DarkDialogTitle>
        Details
      </DarkDialogTitle>
      <DarkDialogContent>
        {evaluationType === 'walkthrough' && (
        <>
          <div>
            <p className="dialog-label">Add user task</p>
            <span className='dialog-hint'>Provide a short description of the user's activity on the captured screen.</span>
            <TextFieldTask
              fullWidth
              placeholder='The user is...'
              multiline
              rows={2}
              value={taskInput}
              onChange={onTaskInputChange}
            />
            {showValidation && !taskInput.trim() && (
              <p className="validation-message">Please enter the user task.</p>
            )}
          </div>
          <div className='walkthrough-container'>
              <div>
                <p className="dialog-label">Specify correct action</p>
                <span className='dialog-hint'>Add the correct action for achieving the user task.</span>
                <TextFieldTask
                  fullWidth
                  placeholder='The correct action is...'
                  multiline
                  rows={2}
                  value={correctActionInput}
                  onChange={onCorrectActionInputChange}
                />
                {showValidation && !correctActionInput.trim() && (
                  <p className="validation-message">Please specify the correct action.</p>
                )}
              </div>
            </div>
        </>
          )
          }

      </DarkDialogContent>
      <DarkDialogActions>
        <CustomDialogButton onClick={handleClose} style={{ color: 'white', backgroundColor: '#5f5f5f' }}>Cancel</CustomDialogButton>
        <CustomDialogButton variant="contained" onClick={handleSaveClick} sx={{backgroundColor: '#2270af'}}>Save</CustomDialogButton>
      </DarkDialogActions>
    </DarkDialog>
  );
};

const DarkDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiPaper-root': {
      backgroundColor: 'rgb(68, 68, 68)',
      color: '#ffffff',
      width: '90vw',
    },
  }));
  
  const DarkDialogTitle = styled(DialogTitle)({
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    padding: '10px 15px',
    display: 'flex',
    flexDirection: 'column',
  });
  
  const DarkDialogContent = styled(DialogContent)({
    color: '#ffffff',
    padding: '10px 15px',
    gap: '10px',
    display: 'flex',
    flexDirection: 'column',
  });
  
  const DarkDialogActions = styled(DialogActions)({
    borderTop: '1px solid #444',
    padding: '10px 15px',
  });
  
  const CustomDialogButton = styled(Button)({
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

const TextFieldTask = styled(TextField)({
    width: '100%',
    marginTop: '4px',
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

export default DetailsDialog;
