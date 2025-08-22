import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Paper, Card, CardActions, CardContent, AppBar, Toolbar, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment, Box, Typography, Button, Link, CircularProgress } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from '../../../../theme';
import { Navigate, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles'; 

function Accounts() {
  //константы
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const drawerWidth = 256;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  //стейты
  const [mobileOpen, setMobileOpen] = React.useState(true);

  //селекторы
  const user = useSelector((state) => state.users.user);
  const loading = useSelector((state) => state.users.loading);
  const error = useSelector((state) => state.users.error);
  const [loadingTimer, setLoadingTimer] = useState(false);

  //переменные
  const showLoading = useMemo(() => {
    return /*technologiesLoading ||*/ loadingTimer;
  }, [/*technologiesLoading,*/ loadingTimer]);
  const StyledTableCell = styled(TableCell)(({ theme }) => ({ // Обращаемся к теме через аргумент theme
    '&.MuiTableCell-head': { // Новый селектор для заголовочной клетки
      backgroundColor: 'rgb(8, 22, 39)', /*theme.palette.common.black,*/
      color: theme.palette.common.white,
    },
    '&.MuiTableCell-body': { // Новый селектор для основной клетки
      fontSize: 14,
    },
  }));
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // Hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
  const formatDate = (dateStr) => {
    const utcDate = new Date(dateStr);

    // Преобразуем в Московское время
    const moscowOffsetHours = 3; // Москва в зимний период +3 часа относительно UTC
    const moscowDate = new Date(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate(),
      utcDate.getUTCHours() + moscowOffsetHours, // учитываем московское смещение
      utcDate.getUTCMinutes(),
      utcDate.getUTCSeconds()
    );

    // Параметры форматирования даты
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };

    // Возвращаем дату в Московском формате
    return moscowDate.toLocaleString('ru-RU', options);
  };

  //события
  //эффекты
  
  return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 4 }}>
            <Typography variant='h6'>Статистика</Typography>                 
        </Box>
      </>
  );
}

export {Accounts};