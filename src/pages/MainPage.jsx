import React, { useState, useEffect } from 'react';
import { Grid2, Paper, AppBar, Tabs, Tab, TextField, InputAdornment, Box, Typography, Button, Link } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
//import Navigator from './Navigator';
import { Content } from '../components/Content';
import { Header } from '../components/Header';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from '../theme';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserData, setTokens } from '../store/slices/usersSlice';
import { use } from 'react';

function Copyright() {
  return (
    <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}

function MainPage() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  //стейты
  const [loaded, setLoaded] = useState(false);

  //селекторы
  const user = useSelector((state) => state.users.user);
  const loading = useSelector((state) => state.users.loading);
  const error = useSelector((state) => state.users.error);
  
  //получить данные пользователя
  useEffect(() => {
    if (!user) {
      dispatch(getUserData({}));
      setLoaded(true);
    }      
  }, [user]);

  /*if (!user && !loaded) {
    navigate('/login');
  }*/

  //
  return (
      <>
      {console.log(user)}
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Header onDrawerToggle={handleDrawerToggle} />
            <Box component="main" sx={{ flex: 1, py: 2, px: 2, bgcolor: '#eaeff1' }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 2,                   
                padding: 2,
                backgroundColor: 'background.paper',
                borderRadius: 1,          
                boxShadow: 3,
                height: '735px',
                overflow: 'hidden',                
              }}>
                <Content />
              </Box>            
            </Box>
            <Box component="footer" sx={{ p: 1, bgcolor: '#eaeff1' }}>
              <Copyright />
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
      </>
  );
}

export {MainPage};