import React from 'react';
import { styled } from '@mui/material/styles';
import {
    TextField,
    MenuItem,
    IconButton,
    Menu,
    ClickAwayListener
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function ScreenshotList({
  screenshots,
  anchorEls,
  evaluationType,
  onImageClick,
  onMenuOpen,
  onMenuClose,
  onRenameClick,
  onDeleteClick,
  onTitleChange,
  onFinishEditing,
  onEditTaskClick,
  onViewClick,
}) {
  return (
    <div className='image-container'>
      {screenshots.map((screenshot, idx) => (
        <div
          className="image-item image-item-hover"
          key={idx}
          onClick={() => onImageClick(idx)}
        >
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
              <ClickAwayListener onClickAway={() => onFinishEditing(idx)}>
                <TextFieldTitle
                  variant="outlined"
                  size="small"
                  value={screenshot.title}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onTitleChange(idx, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onFinishEditing(idx);
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
              id={`menu-button-${idx}`}
              onClick={(e) => {
                onMenuOpen(idx, e);
                e.stopPropagation();
              }}
              style={{ marginLeft: '4px' }} >
              <MoreVertIcon fontSize="small" />
            </CustomIconButton>

            <Menu
              anchorEl={anchorEls[idx]}
              open={Boolean(anchorEls[idx])}
              onClick={(e) => e.stopPropagation()}
              onClose={() => onMenuClose(idx)}
              slotProps={{
                list: {
                  'aria-labelledby': `menu-button-${idx}`,
                  onKeyDown: (e) => {
                    if (e.key === 'Tab') {
                      onMenuClose(idx);
                    }
                  }
                }
              }}
            >
              <MenuItem onClick={() => { onMenuClose(idx); onRenameClick(idx); }}>Rename</MenuItem>
              <MenuItem onClick={() => { onMenuClose(idx); onDeleteClick(idx); }}>Delete</MenuItem>
              {evaluationType === 'walkthrough' && (
                <MenuItem onClick={() => { onMenuClose(idx); onEditTaskClick(idx); }}>
                  Edit
                </MenuItem>
              )}
              <MenuItem onClick={() => { onMenuClose(idx); onViewClick(idx); }}>View</MenuItem>
            </Menu>
          </div>
        </div>
      ))}
    </div>
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

export default ScreenshotList;