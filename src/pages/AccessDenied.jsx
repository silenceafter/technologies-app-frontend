import React from 'react';
import { Typography, Box } from '@mui/material';

export const AccessDenied = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Typography variant="h4" align="center" color="error">
        У вас нет прав доступа к этой странице!
      </Typography>
    </Box>
  );
};

//export default NotFound;