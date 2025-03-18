import './ImageUpload.css';
import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';

const ImageUploader: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
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
        <Button variant="contained" component="span" style={{backgroundColor: "#3e0aef",}}>
          Choose Image
        </Button>
      </label>
      {image && <img src={image} alt="Uploaded preview" className='ImageUpload-Preview' />}
    </div>
  );
};

export default ImageUploader;