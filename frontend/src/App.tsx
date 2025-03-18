import React from 'react';
import logo from './logo.svg';
import './App.css';
import './components/LLMContext';
import { Container, Button, Paper, Typography } from '@mui/material';
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
          <Grid className="App-Grid-LeftSide" size={4}>
            <LLMContext />
            <br />
            <Button variant="contained" style={{backgroundColor: "#3e0aef",}}>Start</Button>
          </Grid>

          {/* Right Section */}
          <Grid className="App-Grid-RightSide" size={8}>
            <ImageUpload />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
