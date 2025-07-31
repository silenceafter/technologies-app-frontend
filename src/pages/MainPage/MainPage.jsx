import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Paper, Card, CardActions, CardContent, AppBar, Toolbar, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment, Box, Typography, Button, Link, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { createTheme, rgbToHex, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navigator from '../../components/Navigator';
import { Technologies } from './Technologies/Technologies';
import { Header } from '../../components/Header';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from '../../theme';
import { Navigate, useNavigate } from 'react-router-dom';
import { authenticate, setTokens } from '../../store/slices/usersSlice';
import { use } from 'react';
import { styled } from '@mui/material/styles'; 
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import ProtectedRoute from '../../ProtectedRoute';
import Backdrop from '@mui/material/Backdrop';
import { selectLoading } from '../../store/slices/technologiesSlice';
import { getTechnologiesCreatedByUser } from '../../store/slices/dashboardSlice';
import { tableCellClasses } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Rectangle } from 'recharts';
import { Dashboard } from './Dashboard/Dashboard';

function Copyright() {
  return (
    <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
      {'© '}
      <Link color="inherit" href="https://mui.com/">
        АО "Электроагрегат"
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}

function MainPage({ page }) {
  //константы
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const drawerWidth = 256;
  
  //переменные
  let content;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  //стейты
  const [mobileOpen, setMobileOpen] = React.useState(true);

  //селекторы
  const user = useSelector((state) => state.users.user);
  const loading = useSelector((state) => state.users.loading);
  const error = useSelector((state) => state.users.error);
  const isCrud = useSelector((state) => state.users.isCrud);
  const drawing = useSelector((state) => state.drawings.drawing);
  const technologiesLoading = useSelector(selectLoading);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [smartBackdropActive, setSmartBackdropActive] = useState(false);
  const technologiesCreatedByUserItems = useSelector((state) => state.dashboard.technologiesCreatedByUserItems);
  const technologiesCreatedByUserLoading = useSelector((state) => state.dashboard.technologiesCreatedByUserLoading);
  const technologiesCreatedByUserHeaders = useSelector((state) => state.dashboard.technologiesCreatedByUserHeaders);
  const technologiesCreatedByUserCount = useSelector((state) => state.dashboard.technologiesCreatedByUserCount);
  const technologiesCreatedByUserLastCreationDate = useSelector((state) => state.dashboard.technologiesCreatedByUserLastCreationDate);
  const technologiesCreatedByUserLastMonthActions = useSelector((state) => state.dashboard.technologiesCreatedByUserLastMonthActions);

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
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  //эффекты
  useEffect(() => {
    if (!smartBackdropActive) return;
    setBackdropVisible(true);
    const startTime = Date.now();
    let timeoutId;
    //
    const checkDone = () => {
      const now = Date.now();
      const minTimePassed = now - startTime >= 1000;
      const isStillLoading = technologiesLoading;
      //
      if (!isStillLoading && minTimePassed) {
        setBackdropVisible(false);
        setSmartBackdropActive(false);
      } else {
        timeoutId = setTimeout(checkDone, 300);
      }
    };
    //
    checkDone();
    return () => clearTimeout(timeoutId);
  }, [smartBackdropActive]);

  useEffect(() => {
    if (user) {
      dispatch(getTechnologiesCreatedByUser({ user: user }));
    }
  }, [user]);

  switch (page) {
    case 'dashboard':
      content = <Dashboard />;
      break;
    case 'technologies':
      content = <Technologies showLoading={showLoading} />;
      break;
    default:
      content = <Dashboard />;
  }
  
  //main
  return (
      <>
      {/*console.log(user)*/}
      <ProtectedRoute>
        <ThemeProvider theme={theme}>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Box 
              component="nav" 
              sx={{ 
                width: { sm: mobileOpen ? drawerWidth : 0 }, 
                flexShrink: { sm: 0 },  
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  transition: 'width 0.3s ease-in-out',
                }, 
              }}
            >
              <Navigator
                PaperProps={{ style: { width: mobileOpen ? drawerWidth : 0 } }}
                variant="persistent"
                anchor="left"
                open={mobileOpen}
                onClose={handleDrawerToggle}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
              <Header onDrawerToggle={handleDrawerToggle} sx={{ position: 'sticky', top: 0, zIndex: 1100, bgcolor: 'white' }} />
              <Box component="main" sx={{ flex: 1, py: 2, px: 2, bgcolor: '#eaeff1', overflowY: 'auto' }}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 2,                   
                  padding: 2,
                  backgroundColor: 'rgb(234, 239, 241)', /*'rgb(245,245,245)',*/
                  borderRadius: 1,          
                  boxShadow: 3,
                  height: '100%',
                  /*maxHeight: '100vh',*/
                  /*height: '46rem',*/
                  /*overflow: !drawing ? 'auto' : 'hidden',*/
                }}>
                  {/*<Technologies setSmartBackdropActive={setSmartBackdropActive} showLoading={showLoading} />
                  !drawing && <Dashboard />*/}
                  {content}
                </Box>                
              </Box>
              <Box component="footer" sx={{ paddingLeft: 1, paddingRight: 1, paddingBottom: 1, bgcolor: '#eaeff1' }}>
                <Copyright />
              </Box>
            </Box>         
          </Box>
        </ThemeProvider>
      </ProtectedRoute>

      <Backdrop
        sx={{
          color: '#fff',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
        }}
        open={smartBackdropActive}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      </>
  );
}

export {MainPage};