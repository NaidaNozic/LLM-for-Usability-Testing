import { useState } from 'react';
import './Folder.css';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NoContent from './NoContent';
import { styled } from '@mui/material/styles';
import { IconButton, Menu, MenuItem } from '@mui/material';

const Folder = ({ folders, setFolders }) => {

  const [anchorEls, setAnchorEls] = useState({});

  const handleCreateFolder = () => {
    const newId = folders.length > 0 ? folders[folders.length - 1].id + 1 : 1;
    setFolders([...folders, { id: newId, name: `Folder ${newId}` }]);
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

  return (
    <div className='main-folder-container'>
        <div className="new-folder image-item-hover" onClick={handleCreateFolder}>
        <AddIcon className='folder-icon' /><span>New folder</span>
        </div>
        {folders.length === 0 ? (
            <NoContent />
        ) : (
            <div className='folders-container'>
                {folders.map(folder => (
                    <div key={folder.id} className="new-folder image-item-hover" >
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

export default Folder;
