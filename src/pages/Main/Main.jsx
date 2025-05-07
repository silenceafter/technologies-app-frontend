import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Paper, AppBar, Toolbar, Tabs, Tab, TextField, InputAdornment, Box, Typography, Button, Link, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navigator from '../../components/Navigator';
import { Content } from '../../components/Content';
import { Header } from '../../components/Header';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from '../../theme';
import { Navigate, useNavigate } from 'react-router-dom';
import { authenticate, setTokens } from '../../store/slices/usersSlice';
import { use } from 'react';

import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import { HeaderSearchT } from '../../components/HeaderSearchT';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import ProtectedRoute from '../../ProtectedRoute';
import Backdrop from '@mui/material/Backdrop';
import { selectLoading } from '../../store/slices/technologiesSlice';

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

function Main() {
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
  const isCrud = useSelector((state) => state.users.isCrud);
  const drawing = useSelector((state) => state.drawings.drawing);
  const technologiesLoading = useSelector(selectLoading);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [smartBackdropActive, setSmartBackdropActive] = useState(false);
  const { tabs, tabValue } = useSelector((state) => state.operations);

  //переменные
  const showLoading = useMemo(() => {
    return /*technologiesLoading ||*/ loadingTimer;
  }, [/*technologiesLoading,*/ loadingTimer]); 

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
      const isStillLoading = technologiesLoading || tabs.length === 0 || !tabs[tabValue];
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
  
  //main
  return (
      <>
      {console.log(user)}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Header onDrawerToggle={handleDrawerToggle} />              
              <Box component="main" sx={{ flex: 1, py: 2, px: 2, bgcolor: '#eaeff1' }}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 2,                   
                  padding: 2,
                  backgroundColor: 'rgb(245,245,245)',
                  borderRadius: 1,          
                  boxShadow: 3,
                  height: '46rem', /*735px*/
                  overflow: 'hidden',                
                }}>
                  <Content setSmartBackdropActive={setSmartBackdropActive} showLoading={showLoading} />
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

export {Main};