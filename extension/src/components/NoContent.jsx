import folderIcon from './folder-icon.png';
import './NoContent.css';
import React from 'react';

const NoContent = () => {
    return (
        <div className="no-content-container">
            <img
                key={"NoPages"}
                src={folderIcon}
                alt={"NoPages"}
                style={{
                maxWidth: '100%',
                width: '200px',
                borderRadius: '8px',
                marginTop: '10px',
                }}
            />
            <p className='content-title'>Nothing to show here yet</p>
        </div>
    )
}

export default NoContent