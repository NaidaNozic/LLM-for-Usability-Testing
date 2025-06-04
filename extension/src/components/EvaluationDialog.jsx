import React from 'react';
import { styled } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const EvaluationDialog = ({
  open,
  onClose,
  onEvaluate,
  selectedIndex,
  evaluationType
}) => {
  const handleEvaluate = () => {
    if (selectedIndex !== null) {
      onEvaluate(selectedIndex);
      onClose();
    }
  };

  return (
    <DarkDialog open={open} onClose={onClose}>
      <DarkDialogTitle>
        {evaluationType === 'heuristic' ? 'Evaluation' : 'Multiscreen evaluation'}
      </DarkDialogTitle>
      <DarkDialogContent>
      {evaluationType === 'heuristic' ? (
        <span>
          <p>Begin the detection of usability issues.</p>
          <span style={{marginTop: '4px', fontWeight: '100', opacity: '0.7'}}>
            To begin the evaluation, first <em>"Edit"</em> the screen and provide the app overview.
          </span>
        </span>
      ) : (
        <span>
          <p>Begin the detection of usability issues.</p>
          <span style={{marginTop: '4px', fontWeight: '100', opacity: '0.7'}}>
            To begin the evaluation, first provide the <em>"App overview", "User group" and "goal"</em>.
          </span>
        </span>
      )}
      </DarkDialogContent>
      <DarkDialogActions>
        <CustomDialogButton onClick={onClose} sx={{backgroundColor: '#5f5f5f'}}>Cancel</CustomDialogButton>
        <CustomDialogButton variant="contained" onClick={handleEvaluate} sx={{backgroundColor: '#2270af'}}>
          Start
        </CustomDialogButton>
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

export default EvaluationDialog;
