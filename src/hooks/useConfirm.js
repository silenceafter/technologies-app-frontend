import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

/**
 * Кастомный хук для показа модального диалога подтверждения
 * @returns {Object} { confirm, ConfirmationDialog }
 */
export const useConfirm = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('Вы уверены?');
  const [title, setTitle] = useState('Подтверждение');
  const [resolve, setResolve] = useState(null);

  // Показать диалог и вернуть промис
  const confirm = useCallback((options = {}) => {
    const { title = 'Подтверждение', message = 'Вы уверены?' } = options;
    setTitle(title);
    setMessage(message);

    return new Promise((res) => {
      setResolve(() => res);
      setOpen(true);
    });
  }, []);

  // Обработчик закрытия
  const handleClose = useCallback((result) => {
    setOpen(false);
    if (resolve) {
      resolve(result);
    }
    // Сбрасываем resolve
    setResolve(null);
  }, [resolve]);

  // Сам компонент диалога (рендерится в вызывающем компоненте)
  const ConfirmationDialog = (
    <Dialog
      open={open}
      onClose={() => handleClose('cancel')}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose('cancel')} color="primary">
          Отмена
        </Button>
        <Button onClick={() => handleClose('confirm')} variant="contained" color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
  //
  return {
    confirm,           // функция: вызывает диалог
    ConfirmationDialog // компонент: нужно вставить в JSX
  };
};