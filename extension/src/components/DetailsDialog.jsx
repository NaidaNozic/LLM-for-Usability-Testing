import React from 'react';
import { styled } from '@mui/material/styles';
import './DetailsDialog.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl
} from '@mui/material';

const DetailsDialog = ({
  open,
  onClose,
  taskInput,
  onTaskInputChange,
  onSave,
  correctActionInput,
  onCorrectActionInputChange,
  evaluationType,
  screenshots,
  afterScreenshotSelection,
  setAfterScreenshotSelection
}) => {
  return (
    <DarkDialog open={open} onClose={onClose} aria-hidden={open ? "false" : "true"} >
      <DarkDialogTitle>
        Details
      </DarkDialogTitle>
      <DarkDialogContent>
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
        </div>

        {evaluationType === 'walkthrough' && (
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
            </div>
            <div>
              <p className="dialog-label">After-action screenshot</p>
              <span className='dialog-hint'>Select a screenshot that shows the result of the correct action.</span>
              <FormControl fullWidth>
                <CustomSelect
                  value={afterScreenshotSelection}
                  onChange={(e) => setAfterScreenshotSelection(e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) return <em>None</em>;
                    const selectedScreenshot = screenshots.find(s => s.src === selected);
                    return selectedScreenshot?.title || 'None';
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 170,
                        overflowY: 'scroll',
                      },
                    },
                  }}
                >
                  <CustomMenuItem value="">
                    <em style={{ fontSize: '12px'}}>None</em>
                  </CustomMenuItem>
                  {screenshots.map((s, idx) => (
                    <CustomMenuItem key={idx} value={s.src} style={{ fontSize: '12px' }}>
                      {s.title}
                    </CustomMenuItem>
                  ))}
                </CustomSelect>
              </FormControl>
            </div>
          </div>)
          }

      </DarkDialogContent>
      <DarkDialogActions>
        <CustomDialogButton onClick={onClose} style={{ color: 'white' }}>Cancel</CustomDialogButton>
        <CustomDialogButton variant="contained" onClick={onSave}>Save</CustomDialogButton>
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
    backgroundColor: '#2270af',
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

const CustomSelect = styled(Select)({
  fontSize: '12px',
  color: 'white',
  '& .MuiSelect-select': {
    padding: '8px',
    fontSize: '12px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'white',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'white',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'white',
  },
  '& .MuiSvgIcon-root': {
    color: 'white',
  },
});

const CustomMenuItem = styled(MenuItem)({
  padding: '4px 8px',
  fontSize: '12px',
  minHeight: '38px',
  '&.Mui-selected': {
    backgroundColor: 'rgb(7 66 114 / 30%)',
  },
  '&.Mui-selected:hover': {
    backgroundColor: 'rgba(7, 66, 114, 0.6)'
  },
});

export default DetailsDialog;
