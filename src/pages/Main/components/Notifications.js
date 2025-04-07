import React from 'react';
import { 
    Alert,
    Snackbar
} from '@mui/material';

function Notifications({ handleClose, open, requestStatus }) {
  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} //нижний правый угол
      >
        <Alert
          onClose={handleClose}
          severity={requestStatus === 'success' ? 'success' : 'error'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {requestStatus === 'success' ? 'Успешно сохранено!' : 'Ошибка при отправке!'}
        </Alert>
      </Snackbar>
    </>
  );
}

export { Notifications };