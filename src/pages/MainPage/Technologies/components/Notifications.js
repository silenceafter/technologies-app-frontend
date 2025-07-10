import React, { useEffect, useState } from 'react';
import { 
    Alert,
    Snackbar
} from '@mui/material';
import { useSelector } from 'react-redux';

function Notifications({ handleClose, open }) {
  //селекторы
  const message = useSelector((state) => state.notifications.message);
  const status = useSelector((state) => state.notifications.status);
  //
  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} //нижний правый угол
      >
        {status && message && (<Alert
          onClose={handleClose}
          severity={status}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>)}
      </Snackbar>
    </>
  );
}

export { Notifications };