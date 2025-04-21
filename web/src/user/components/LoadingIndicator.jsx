import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingIndicator = ({ loading }) => {
  if (!loading) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Searching for the best routes...
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingIndicator;