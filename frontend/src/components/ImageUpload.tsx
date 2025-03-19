import './ImageUpload.css';
import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';

interface ImageUploadProps {
  onDetectIssues: (base64Image: string) => void;
}

const ImageUploader: React.FC<ImageUploadProps> = ({ onDetectIssues }) => {
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1] || '';
        setBase64Image(base64String);
        setImage(URL.createObjectURL(file));
        onDetectIssues(base64String);
      };
      reader.readAsDataURL(file);
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
        <Button variant="contained" component="span">
          Choose Image
        </Button>
      </label>
      {image && <img src={image} alt="Uploaded preview" className='ImageUpload-Preview' />}
    </div>
  );
};

export default ImageUploader;
