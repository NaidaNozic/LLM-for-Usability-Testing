import './ImageUpload.css';
import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { css } from '@emotion/react';
import { styled } from '@mui/material/styles';

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
    <div className={`ImageUpload-Container ${imageUploaded ? 'uploaded' : ''}`}>
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
        <div className="ImageUpload-Wrapper">
          <StyledButton
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={handleImageRemove} >
            Remove
          </StyledButton>

          <StyledText variant="subtitle1" className="ImageUpload-Text">
            Application Screen: Usability issues are detected from the uploaded image.
          </StyledText>

          <img src={image} alt="Uploaded preview" className="ImageUpload-Preview" />
        </div>
      )}
    </div>
  );
};

const StyledButton = styled(Button)`
  background-color: white;
  color: #494a4a;
  border-radius: 20px;
  padding: 6px 16px;
  border: 1px solid white;
  font-weight: bold;
  text-transform: none;
  transition: box-shadow 0.2s ease-in-out;
  box-shadow: none;

  &:hover {
    box-shadow: 0px 2px 8px rgba(198, 35, 35, 0.1);
    background-color: white;
  }
`;

const StyledText = styled(Typography)`
  color: #878787;
`;

export default ImageUploader;
