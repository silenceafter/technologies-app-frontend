import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authenticate } from './store/slices/usersSlice';
import React, { useState, useEffect } from 'react';
import { Grid, Paper, AppBar, Toolbar, Tabs, Tab, TextField, InputAdornment, Box, Typography, Button, Link, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navigator from './components/Navigator';
import { Content } from './components/DrawingsContent';
import { Header } from './components/Header';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from './theme';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isloaded, setIsLoaded] = useState(false);

  const user = useSelector((state) => state.users.user);
  const loading = useSelector((state) => state.users.loading);
  const error = useSelector((state) => state.users.error);
  const isCrud = useSelector((state) => state.users.isCrud);

  // Проверяем аутентификацию пользователя при монтировании компонента
  useEffect(() => {
      dispatch(authenticate({})).then(() => {
        /*if (!user) {
          navigate('/login'); // Если пользователь не авторизован, переходим на страницу входа
        }*/
        setIsLoaded(true);
      });
  }, [dispatch]);

  // Проверяем доступ к странице
  useEffect(() => {
    if (user) {
      /*if ((user.idstatus != 3 && user.idstatus != 2) || 
        (user.idstatus == 2 && user.taskStatusId != 1 && user.taskStatusId != 2)) {
        navigate('/access-denied'); // Если нет прав доступа, переходим на страницу "доступ запрещен"
      }*/
      if ((user.idstatus != 3 && user.idstatus != 2) || (!user.role)) {
        navigate('/access-denied'); // Если нет прав доступа, переходим на страницу "доступ запрещен"
      }
    }
  }, [navigate, user]);

  // Если ещё загружается информация о пользователе, показываем спиннер
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

  // Если пользователь не авторизован, выполняем перенаправление
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Если пользователь не имеет прав доступа, выполняем перенаправление
  /*if (user.division !== 1 && user.status.toLowerCase() !== 'администратор') {
    return <Navigate to="/access-denied" replace />;
  }*/

  // Если все проверки пройдены, рендерим дочерние компоненты
  return children;
}

export default ProtectedRoute;