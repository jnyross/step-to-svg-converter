import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Typography, Paper } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled = false }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validate file size (100MB limit as per PRD)
      if (file.size > 100 * 1024 * 1024) {
        alert('File size exceeds 100MB limit');
        return;
      }
      
      // Validate file extension
      if (!file.name.toLowerCase().endsWith('.step') && !file.name.toLowerCase().endsWith('.stp')) {
        alert('Please upload a STEP file (.step or .stp)');
        return;
      }
      
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/step': ['.step', '.stp']
    },
    maxFiles: 1,
    disabled
  });

  return (
    <Paper
      {...getRootProps()}
      data-testid="file-upload"
      style={{
        width: '800px',
        height: '100px',
        border: '2px dashed #ccc',
        borderColor: isDragActive ? '#1976d2' : '#ccc',
        backgroundColor: isDragActive ? '#f5f5f5' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input {...getInputProps()} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <CloudUpload style={{ fontSize: 40, color: '#888' }} />
        <div>
          <Typography variant="h6" color="textPrimary">
            {isDragActive ? 'Drop the STEP file here' : 'Drag & drop STEP file here'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            or click to select (max 100MB)
          </Typography>
        </div>
      </div>
    </Paper>
  );
};

export default FileUpload;