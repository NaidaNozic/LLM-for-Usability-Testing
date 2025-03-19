import './ImageUpload.css';
import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';
import axios from 'axios';

const ImageUploader: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [usabilityIssues, setUsabilityIssues] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1] || "";
        setBase64Image(base64String);
        setImage(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const appOverview = (document.getElementById('app-overview') as HTMLInputElement).value;
    const userTask = (document.getElementById('user-task') as HTMLInputElement).value;
    const sourceCode = (document.getElementById('source-code') as HTMLInputElement).value;

    if (!base64Image) {
      alert("Please upload an image first.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/detect-usability', {
        app_overview: appOverview,
        user_task: userTask,
        source_code: sourceCode,
        image: base64Image,
      });

      setUsabilityIssues(response.data.usability_issues);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to get usability issues.");
    }
  };

  return (
    <div className='ImageUpload-Container'>
      <Typography variant="h6">Upload an Image</Typography>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id="upload-button"
        onChange={handleImageUpload}
      />
      <label htmlFor="upload-button">
        <Button variant="contained" component="span" style={{ backgroundColor: "#3e0aef" }}>
          Choose Image
        </Button>
      </label>
      {image && <img src={image} alt="Uploaded preview" className='ImageUpload-Preview' />}
      
      <Button onClick={handleSubmit} variant="contained" style={{ marginTop: "10px", backgroundColor: "#3e0aef" }}>
        Detect Usability Issues
      </Button>

      {usabilityIssues && (
        <div className="Usability-Report">
          <Typography variant="h6">Usability Issues</Typography>
          <p>{usabilityIssues}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;