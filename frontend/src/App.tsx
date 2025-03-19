import { useState } from 'react';
import './App.css';
import './components/LLMContext';
import { Container, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import LLMContext from './components/LLMContext';
import ImageUpload from './components/ImageUpload';
import axios from 'axios';

function App() {
  const [appOverview, setAppOverview] = useState<string>('');
  const [userTask, setUserTask] = useState<string>('');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [usabilityIssues, setUsabilityIssues] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageUpload = (base64Image: string) => {
    setBase64Image(base64Image);
  };

  const handleFormSubmit = async () => {
    if (!base64Image) {
      alert('Please upload an image first.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/detect-usability', {
        app_overview: appOverview,
        user_task: userTask,
        source_code: sourceCode,
        image: base64Image,
      });

      setUsabilityIssues(response.data.usability_issues);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get usability issues.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="Header">
        <Typography variant="h5" className="Header-Title" color='primary'>
          UX/UI LMM
        </Typography>
      </header>

      <Container disableGutters maxWidth={false} className="App-Container-FullPage">
        <Grid container className="App-Container-FullPage">
          {/* Left Section */}
          <Grid className="App-Grid-LeftSide" size={3}>
            <LLMContext
                onDetectIssues={(overview, task, code) => {
                setAppOverview(overview);
                setUserTask(task);
                setSourceCode(code);
                }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleFormSubmit}
              fullWidth
              loadingPosition='end'
              loading = {loading} >Detect usability issues</Button>
          </Grid>

          {/* Middle Section */}
          <Grid className="App-Grid-Middle" size={6}>
            <ImageUpload onDetectIssues={handleImageUpload} />
          </Grid>

          {/* Right Section */}
          <Grid className="App-Grid-RightSide" size={3}>
              <Typography variant="h6">Detected usability issues</Typography>
              {usabilityIssues && <Typography>{usabilityIssues}</Typography>}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
