import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <span className="loading-text">{message}</span>
    </div>
  );
};

export default LoadingOverlay;
