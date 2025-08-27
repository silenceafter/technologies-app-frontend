import React, { useState, useEffect } from 'react';
import { Grid, Paper, AppBar, Toolbar, Tabs, Tab, TextField, InputAdornment, Box, Typography, Button, Link, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navigator from '../components/Navigator';
//import { Content } from '../components/Content';
import { Header } from '../components/Header';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from '../theme';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authenticate, setCrud } from '../store/slices/usersSlice';
import { use } from 'react';

import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';

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

function CrudPage() {
  //константы
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  //стейты
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isloaded, setIsLoaded] = useState(false);

  //селекторы
  const user = useSelector((state) => state.users.user);
  const loading = useSelector((state) => state.users.loading);
  const error = useSelector((state) => state.users.error);
  const isCrud = useSelector((state) => state.users.isCrud);
  const drawing = useSelector((state) => state.drawings.drawing);
  
  //получить данные пользователя
  useEffect(() => {
    dispatch(authenticate({})).then(() => {
      setIsLoaded(true);
    });
  }, [dispatch]);
  
  //загрузка
  if (!isloaded) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <CircularProgress size={'5rem'} />
          </Box>
        </Box>
      </ThemeProvider>
    );
  }
  
  //main
  return (
      <>
      {/*console.log(drawing)*/}      
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {!user ? (
            navigate('/login')
          ) : (
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
                  {/*<Content />*/}                
                </Box>            
              </Box>
              <Box component="footer" sx={{ paddingLeft: 1, paddingRight: 1, paddingBottom: 1, bgcolor: '#eaeff1' }}>
                <Copyright />
              </Box>
            </Box>
          )}          
        </Box>
      </ThemeProvider>
      </>
  );
}

export {CrudPage};