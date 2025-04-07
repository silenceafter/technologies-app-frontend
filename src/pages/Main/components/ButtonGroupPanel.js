import React from 'react';
import { 
    Button,
    ButtonGroup
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

function ButtonGroupPanel({ handleSave, loading }) {
  return (
    <>
      <ButtonGroup variant="contained" aria-label="Loading button group">
        <LoadingButton loading={loading.save} onClick={handleSave}>Сохранить</LoadingButton>
        <Button>Предварительный просмотр</Button>
        <Button>Печать</Button>
        <LoadingButton>Экспорт в CSV</LoadingButton>
        <LoadingButton>Экспорт в XLSX</LoadingButton>
      </ButtonGroup>
    </>
  );
}

export { ButtonGroupPanel };