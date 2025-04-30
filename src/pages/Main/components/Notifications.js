import React, { useEffect, useState } from 'react';
import { 
    Alert,
    Snackbar
} from '@mui/material';

function Notifications({ handleClose, open, requestStatus }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (requestStatus) {
      switch(requestStatus) {
        case 'success':
          setMessage('Успешно сохранено!');
          break;

        case 'warning':
          setMessage('Неправильно заполнена форма');
          break;

        case 'error':
          setMessage('Ошибка при отправке!');
          break;
      }
      
    }
  }, [requestStatus]);

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
          severity={requestStatus}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}

export { Notifications };