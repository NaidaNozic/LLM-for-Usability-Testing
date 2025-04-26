import React from 'react';
import {
    MenuItem,
    Menu,
    ClickAwayListener
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CustomIconButton, TextFieldTitle } from './SharedCustomControls';

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
  onEditDetailsClick,
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
                <MenuItem onClick={() => { onMenuClose(idx); onEditDetailsClick(idx); }}>
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

export default ScreenshotList;