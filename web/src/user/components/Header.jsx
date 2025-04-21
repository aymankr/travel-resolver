import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import TrainIcon from '@mui/icons-material/Train';

const Header = () => (
  <AppBar position="static" elevation={0} sx={{ backgroundColor: 'primary.main' }}>
    <Toolbar>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TrainIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div">
          TrainQuest
        </Typography>
      </Box>
    </Toolbar>
  </AppBar>
);

export default Header;