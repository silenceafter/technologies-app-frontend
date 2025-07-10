import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Breadcrumbs, Typography } from '@mui/material';
import { selectDrawingExternalCode, selectTechnology, selectOperation } from '../../../../store/slices/drawingsSlice';

function TechnologyBreadcrumbs(props) {
  //селекторы
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const currentTechnology = useSelector(selectTechnology);
  const currentOperation = useSelector(selectOperation);

  /*const {tabs, tabValue } = useSelector((state) => state.operationsTabs);

  useEffect(() => {
    const bb = tabs.
  }, [tabs, tabValue]);*/

  //
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Typography color="inherit">Чертежи</Typography>
      <Typography color="inherit">{drawingExternalCode}</Typography>
      <Typography color="inherit">Технологии</Typography>
      <Typography color="inherit">{currentTechnology.name}</Typography>
      <Typography color="inherit">Операции</Typography>                  
      <Typography sx={{ color: 'text.primary' }}>{props.operationLabel}</Typography>
    </Breadcrumbs>
  );
}

export {TechnologyBreadcrumbs};