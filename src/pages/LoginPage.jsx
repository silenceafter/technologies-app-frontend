import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
//import { loginUser, rolesUser, checkAuthStatus, selectLoading, selectError, selectIsAuthenticated } from '../store/slices/authSlice';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { signIn } from '../store/slices/usersSlice';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    //
    const [notification, setNotification] = useState({ severity: null, message: '' });
    const [errors, setErrors] = useState({});
    const [userErrorLoading, setUserErrorLoading] = useState(false);

    //селекторы
    const isAuthenticated = false;//useSelector(selectIsAuthenticated);
    const loading = useSelector((state) => state.users.loading);//useSelector(selectLoading);
    //const error = null;//useSelector(selectError);
    const userError = useSelector((state) => state.users.error);

    /*useEffect(() => {
    if (userError) {
      try {
        // Предположим, вы хотите парсить ошибку как JSON
        const parsedError = JSON.parse(userError);
        console.log('Parsed error:', parsedError);
      } catch (e) {
        // Если это не JSON — обрабатываем как обычную строку
        console.warn('Ошибка не является JSON:', userError);
      }
    }
  }, [userError]);*/

    useEffect(() => {
        if (userErrorLoading) {
            if (userError == '') {
                //success
                setNotification({severity: 'success', message: 'Вход выполнен'});
                setTimeout(() => {
                    navigate('/');
                }, 1000);
                //
            } else if (userError) {
                //error
                setNotification({severity: 'error', message: userError || 'Неудачная попытка входа'});
            }
        }        
    }, [userErrorLoading, userError]);
    
    const handleLogin = async () => {
        dispatch(signIn({ login: login , password: password }));
        setUserErrorLoading(true);
    };

    const validate = () => {
        const newErrors = {};
        if (!login) newErrors.login = 'Поле "логин" обязательно для заполнения';
        if (!password) newErrors.password = 'Поле "пароль" обязательно для заполнения';
        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setNotification({ severity: 'error', message: 'Пожалуйста, заполните все обязательные поля' });
            return;
        }
        
        setErrors({});
        setNotification({ severity: null, message: '' });
        handleLogin();
    };

    const handleLoginChange = (event) => {
        setLogin(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    //
    return (        
        <>       
        {console.log(userError)}
        <Container component="main" maxWidth="xs" 
            sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Вход
                </Typography>
                {notification.severity && (
                    <Alert severity={notification.severity} sx={{ width: '100%', mb: 2 }} onClose={() => setNotification({ severity: null, message: '' })}>
                        {notification.message}
                    </Alert>
                )}
                {userError && !notification.severity && (
                    <Alert severity='error' sx={{ width: '100%', mb: 2 }}>
                        {userError}
                    </Alert>
                )}

                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="login"
                        label="Логин"
                        name="login"
                        autoComplete="username"
                        autoFocus
                        value={login}
                        onChange={handleLoginChange}
                        error={!!errors.login}
                        helperText={errors.login}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Пароль"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={handlePasswordChange}
                        error={!!errors.password}
                        helperText={errors.password}
                    />
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Запомнить"
                    />
                    {loading 
                        ? (
                            <Box display="flex" justifyContent="center" sx={{ mt: 3, mb: 2 }}>
                                <CircularProgress />
                            </Box>
                        ) 
                        : (
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Войти
                            </Button>
                        )
                    }
                    <Grid container>
                        <Grid item xs>
                            <Link component={RouterLink} to="/forgot" variant="body2">
                                Забыли пароль?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link component={RouterLink} to="/register" variant="body2">
                                {"Нет аккаунта? Регистрация"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
        </>
    );
};

export { LoginPage };