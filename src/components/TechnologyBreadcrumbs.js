import React from 'react';
import { Breadcrumbs, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectDrawingExternalCode, selectTechnology, selectOperation } from '../store/slices/drawingsSlice';

function TechnologyBreadcrumbs() {
  //селекторы
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const currentTechnology = useSelector(selectTechnology);
  const currentOperation = useSelector(selectOperation);
  //
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Typography color="inherit">Чертежи</Typography>
      <Typography color="inherit">{drawingExternalCode}</Typography>
      <Typography color="inherit">Технологии</Typography>
      <Typography color="inherit">{currentTechnology.name}</Typography>
      <Typography color="inherit">Операции</Typography>                  
      <Typography sx={{ color: 'text.primary' }}>{currentOperation.name}</Typography>
    </Breadcrumbs>
  );
}

export {TechnologyBreadcrumbs};