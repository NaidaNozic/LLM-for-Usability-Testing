import { useState } from 'react';
import './Folder.css';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NoContent from './NoContent';
import { styled } from '@mui/material/styles';
import { IconButton, Menu, MenuItem, TextField } from '@mui/material';

const Folder = ({ folders, setFolders, openedFolder, setOpenedFolder }) => {

  const [anchorEls, setAnchorEls] = useState({});

  const handleCreateFolder = () => {
    const newId = folders.length > 0 ? folders[folders.length - 1].id + 1 : 1;
    setFolders([...folders, { id: newId, name: `Folder ${newId}`, userTask: '', screenshots: [] }]);
  };  

  const handleMenuOpen = (event, folderId) => {
    event.stopPropagation();
    setAnchorEls(prev => ({ ...prev, [folderId]: event.currentTarget }));
  };

  const handleMenuClose = (folderId) => {
    setAnchorEls(prev => ({ ...prev, [folderId]: null }));
  };

  const handleDeleteClick = (folderId) => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    handleMenuClose(folderId);
  };

  const handleFolderClick = (folder) => {
    setOpenedFolder(folder);
  };

  const handleBackClick = () => {
    setOpenedFolder(null);
  };

  const handleUserTaskChange = (e) => {
    const updatedTask = e.target.value;
    setFolders(prevFolders =>
      prevFolders.map(folder =>
        folder.id === openedFolder.id ? { ...folder, userTask: updatedTask } : folder
      )
    );
    setOpenedFolder(prev => ({ ...prev, userTask: updatedTask }));
  };  

  return (
    <div className='main-folder-container'>

    {openedFolder == null ? (
        <>
            <p className='title'>All walkthroughs</p>
            <span className='text-hint all-pages'>Walkthrough folders capturing user tasks with their expected actions. These will be analyzed to identify usability issues.</span>
            <div className="new-folder image-item-hover" onClick={handleCreateFolder}>
            <AddIcon className='folder-icon' /><span>New folder</span>
            </div>
            {folders.length === 0 ? (
                <NoContent />
            ) : (
                <div className='folders-container'>
                    {folders.map(folder => (
                        <div key={folder.id} className="new-folder image-item-hover" onClick={(e) => {handleFolderClick(folder);
                                                                                                      e.stopPropagation();}} >
                            <FolderIcon className='folder-icon' />
                            <span>{folder.name}</span>

                            <div className='folder-item-content'>
                                <CustomIconButton
                                    size="small"
                                    id={`folder-button-${folder.id}`}
                                    style={{ marginLeft: '4px' }} 
                                    onClick={(e) => {handleMenuOpen(e, folder.id); e.stopPropagation();}}>
                                    <MoreVertIcon fontSize="small" />
                                </CustomIconButton>

                                <Menu
                                    anchorEl={anchorEls[folder.id]}
                                    open={Boolean(anchorEls[folder.id])}
                                    onClose={() => handleMenuClose(folder.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    slotProps={{
                                        list: {
                                        'aria-labelledby': `folder-button-${folder.id}`,
                                        onKeyDown: (e) => {
                                            if (e.key === 'Tab') {
                                            handleMenuClose(folder.id);
                                            }
                                        }
                                        }
                                    }}
                                    >
                                    <MenuItem onClick={() => handleDeleteClick(folder.id)}>Delete</MenuItem>
                                </Menu>
                            </div>
                        </div>
                    ))
                    }
                </div>
            )}
        </>
        ) : (
            <div className="folder-content">
                <div className="folder-header">
                    <CustomIconButton onClick={handleBackClick}>
                    <ArrowBackIcon />
                    </CustomIconButton>
                    <p className='folder-title'>{openedFolder.name}</p>
                </div>

                <div style={{ padding: '0px 8px 0px 8px' }}>
                    <p className='text-field-label'>User task</p>
                    <div style={{ textAlign: 'left', marginBottom: '5px' }}>
                        <span className='text-hint'>Provide a short description of the user's activity on the captured screen.</span>
                    </div>
                    <CustomTextField
                        multiline
                        rows={2}
                        placeholder='The user task is...' 
                        value={openedFolder.userTask || ''}
                        onChange={handleUserTaskChange} />
                </div>

                <div className="folder-screenshots">
                    {openedFolder?.screenshots?.length > 0 ? (
                        openedFolder.screenshots.map((screenshot, index) => (
                        <div key={index}>
                            <img src={screenshot.src} alt={screenshot.title} style={{ width: '200px', marginBottom: '10px' }} />
                            <p>{screenshot.title}</p>
                        </div>
                        ))
                    ) : null }
                </div>

            </div>
        )}
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

const CustomTextField = styled(TextField)({
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

export default Folder;
