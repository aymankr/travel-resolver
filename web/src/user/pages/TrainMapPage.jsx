import React from 'react';
import { Box } from '@mui/material';

const TrainMapPage = () => {

  return (
    <Box sx={{ 
      pt: 8, // To account for the AppBar
      height: 'calc(100vh - 64px)', // Full height minus AppBar height
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default'
    }}>
      <iframe
        src="src/assets/full_graph_map.html"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </Box>
  );
};

export default TrainMapPage;