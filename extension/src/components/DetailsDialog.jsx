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
  onSave,
  correctActionInput,
  onCorrectActionInputChange,
  evaluationType,
  userTaskInput,
  userTaskInputChange,
  userGroup,
  userGroupChange
}) => {
  return (
    <DarkDialog open={open} onClose={onClose} aria-hidden={open ? "false" : "true"} >
      <DarkDialogTitle>
        Details
      </DarkDialogTitle>
      <DarkDialogContent>
        {evaluationType === 'heuristic' && (
          <>
            <div>
            <p className="dialog-label">User group*</p>
            <span className='dialog-hint'>User relevant personal characteristics (e.g., age, domain knowledge, preferences...)</span>
            <TextFieldTask
              fullWidth
              placeholder='e.g., Users aged 80 that are unfamiliar with the application.'
              multiline
              rows={2} 
              value={userGroup}
              onChange={userGroupChange}/>
            </div>

            <div>
              <p className="dialog-label">User task*</p>
              <span className='dialog-hint'>Provide a short description of the user's task.</span>
              <TextFieldTask
                fullWidth
                placeholder='e.g., User wants to find song recommendations based on recently played songs'
                multiline
                rows={2} 
                value={userTaskInput}
                onChange={userTaskInputChange}/>
            </div>
          </>
        )}

      </DarkDialogContent>
      <DarkDialogActions>
        <CustomDialogButton onClick={onClose} style={{ color: 'white', backgroundColor: '#5f5f5f' }}>Cancel</CustomDialogButton>
        <CustomDialogButton variant="contained" onClick={onSave} sx={{backgroundColor: '#2270af'}}>Save</CustomDialogButton>
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
