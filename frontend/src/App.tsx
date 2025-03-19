import React from 'react';
import logo from './logo.svg';
import './App.css';
import './components/LLMContext';
import { Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { css } from '@emotion/react';
import LLMContext from './components/LLMContext';
import ImageUpload from './components/ImageUpload';

function App() {
  return (
    <div>
      {/* Header */}
      <header className="Header">
        <Typography variant="h5" className="Header-Title">
          UX/UI LMM
        </Typography>
      </header>

      <Container disableGutters maxWidth={false} className="App-Container-FullPage">
        <Grid container className="App-Container-FullPage">
          {/* Left Section */}
          <Grid className="App-Grid-LeftSide" size={3}>
            <LLMContext />
          </Grid>

          {/* Middle Section */}
          <Grid className="App-Grid-Middle" size={6}>
            <ImageUpload />
          </Grid>

          {/* Right Section */}
          <Grid className="App-Grid-RightSide" size={3}>
              <Typography variant="h6">Detected usability issues</Typography>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
