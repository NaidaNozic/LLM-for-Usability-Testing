import React from 'react';
import { TextField, Typography, Button } from '@mui/material';
import './LLMContext.css';

const LLMContext = () => {
  return (
    <div>
        <div className="Context-TextField-Label">
            <p className="Context-TextField-Label">
                  App Overview
            </p>
            <TextField
                id="app-overview"
                multiline
                rows={2}
                placeholder='Enter an app overview'
                fullWidth
            />
        </div>
        <br />
        <div className="Context-TextField-Label">
            <p className="Context-TextField-Label">
                  User Task
            </p>
            <TextField
                id="user-task"
                multiline
                rows={2}
                placeholder='Describe the user task'
                fullWidth
            />
        </div>
        <br />
        <div className="Context-TextField-Label">
            <p className="Context-TextField-Label">
                  Source code
            </p>
            <TextField
                id="source-code"
                multiline
                rows={4}
                placeholder='Enter the source code'
                fullWidth
            />
        </div>
    </div>
  );
};

export default LLMContext;
