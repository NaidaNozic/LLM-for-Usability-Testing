import './ImageUpload.css';
import React, { useState } from 'react';
import { Button, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface ImageUploadProps {
  onDetectIssues: (base64Image: string) => void;
}

const ImageUploader: React.FC<ImageUploadProps> = ({ onDetectIssues }) => {
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1] || '';
        setBase64Image(base64String);
        setImage(URL.createObjectURL(file));
        setImageUploaded(true);
        onDetectIssues(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImage(null);
    setBase64Image(null);
    setImageUploaded(false);
  };

  return (
    <div className='ImageUpload-Container'>
      {!imageUploaded && (
        <>
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
        </>
      )}

      {image && (
        <div>
          <IconButton onClick={handleImageRemove} style={{marginLeft: '95%'}}>
            <DeleteIcon />
          </IconButton>

          <img src={image} alt="Uploaded preview" className='ImageUpload-Preview' />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
