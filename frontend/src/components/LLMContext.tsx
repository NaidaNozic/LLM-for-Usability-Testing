import React, { useState } from 'react';
import { TextField } from '@mui/material';
import './LLMContext.css';

interface LLMContextProps {
  onDetectIssues: (overview: string, task: string, code: string) => void;
}

const LLMContext: React.FC<LLMContextProps> = ({ onDetectIssues }) => {
  const [appOverview, setAppOverview] = useState<string>('');
  const [userTask, setUserTask] = useState<string>('');
  const [sourceCode, setSourceCode] = useState<string>('');

  const handleInputChange = () => {
    onDetectIssues(appOverview, userTask, sourceCode);
  };

  return (
    <div>
      <div className="Context-TextField-Label">
        <p className="Context-TextField-Label">App Overview</p>
        <TextField
          id="app-overview"
          multiline
          rows={2}
          value={appOverview}
          onChange={(e) => {
            setAppOverview(e.target.value);
            handleInputChange();
          }}
          placeholder="Enter an app overview"
          fullWidth
        />
      </div>
      <br />
      <div className="Context-TextField-Label">
        <p className="Context-TextField-Label">User Task</p>
        <TextField
          id="user-task"
          multiline
          rows={2}
          value={userTask}
          onChange={(e) => {
            setUserTask(e.target.value);
            handleInputChange();
          }}
          placeholder="Describe the user task"
          fullWidth
        />
      </div>
      <br />
      <div className="Context-TextField-Label">
        <p className="Context-TextField-Label">Source code</p>
        <TextField
          id="source-code"
          multiline
          rows={4}
          value={sourceCode}
          onChange={(e) => {
            setSourceCode(e.target.value);
            handleInputChange();
          }}
          placeholder="Enter the source code"
          fullWidth
        />
      </div>
    </div>
  );
};

export default LLMContext;
