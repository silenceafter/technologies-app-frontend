import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Paper, Card, CardActions, CardContent, AppBar, Toolbar, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment, Box, Typography, Button, Link, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { createTheme, rgbToHex, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from '../../../theme';
import { Navigate, useNavigate } from 'react-router-dom';
import { use } from 'react';
import { styled } from '@mui/material/styles'; 
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
//import Tooltip from '@mui/material/Tooltip';
import Backdrop from '@mui/material/Backdrop';
import { selectLoading } from '../../../store/slices/technologiesSlice';
import { getTechnologiesCreatedByUser } from '../../../store/slices/dashboardSlice'; //'../../store/slices/dashboardSlice';
import { tableCellClasses } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Rectangle } from 'recharts';

function Dashboard() {
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
  const technologiesCreatedByUserLastMonthActionsEmpty = Array.from({ length: 30 }).map((_, i) => ({
    date: `День ${i+1}`,
    actions_count: 0,
  }));
  const cardMessages = ['Карточка 3', 'Карточка 4', 'Карточка 5'];//временные карточки

  //события
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  //эффекты
  useEffect(() => {
    if (user) {
      dispatch(getTechnologiesCreatedByUser({ user: user }));
    }
  }, [user]);
  
  //main
  return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 4 }}>
            <Typography variant='h6'>Статистика</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <Card sx={{ flexGrow: 1, flexBasis: '275px' }}>
                <CardContent sx={{ gap: 0, paddingBottom: 0 }}>
                  <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                    Создано техпроцессов
                  </Typography>
                  <Typography variant="h5" component="div">
                    {technologiesCreatedByUserCount ? technologiesCreatedByUserCount : 'Нет данных' } 
                  </Typography>                          
                </CardContent>
                <CardActions>
                  <Button size="small">Подробнее</Button>
                </CardActions>
              </Card>                      

              <Card sx={{ flexGrow: 1, flexBasis: '275px' }}>
                <CardContent sx={{ gap: 0, paddingBottom: 0 }}>
                  <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                    Дата создания последнего техпроцесса
                  </Typography>
                  <Typography variant="h5" component="div">
                    {technologiesCreatedByUserLastCreationDate 
                      ? formatDate(technologiesCreatedByUserLastCreationDate) 
                      : 'Нет данных' }
                  </Typography>                          
                </CardContent>
                <CardActions>
                  <Button size="small">Подробнее</Button>
                </CardActions>
              </Card>

                {cardMessages.map((message, index) => (        
                <Card sx={{ flexGrow: 1, flexBasis: '275px' }}>
                  <CardContent sx={{ gap: 0, paddingBottom: 0 }}>
                    <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                      {message}
                    </Typography>
                    <Typography variant="h5" component="div">
                      Текст {index + 1}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Подробнее</Button>
                  </CardActions>
                </Card>
              ))}                  
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant='h6'>Активность</Typography>
                { 
                  <Card variant="outlined" style={{ width: '100%', maxWidth: '600px', height: '100%' }}>
                    <CardContent>                        
                      <Typography color="text.secondary">
                        Количество выполненных действий за месяц
                      </Typography>                       
                      <BarChart
                        width={600}
                        height={370}
                        data={
                          technologiesCreatedByUserLastMonthActions 
                            ? technologiesCreatedByUserLastMonthActions 
                            : technologiesCreatedByUserLastMonthActionsEmpty
                          }
                        margin={{
                          top: 15,
                          right: 30,
                          left: -30,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis dataKey="actions_count" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="day" name='Дата' fill="#82ca9d" activeBar={<Rectangle fill="pink" stroke="purple" />} />
                        <Bar dataKey="actions_count" name='Кол-во действий' fill="#8884d8" activeBar={<Rectangle fill="gold" stroke="blue" />} />
                      </BarChart>
                    </CardContent>
                  </Card>                                                          
                }
            </Box>

            {technologiesCreatedByUserHeaders ? (
              <Box sx={{ display: 'flex', flexDirection: 'column',  gap: 2, width: '100%' }}>
                <Typography variant='h6'>Последние добавленные техпроцессы</Typography>
                <TableContainer component={Paper} sx={{ height: '100%'}}>
                  <Table sx={{ minWidth: 700, height: '100%' }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        {Object.entries(technologiesCreatedByUserHeaders).map(([key, value], index) => (
                          <StyledTableCell key={key}>{value}</StyledTableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {technologiesCreatedByUserItems.map((row, index) => (
                        <StyledTableRow key={index}>
                          {Object.entries(technologiesCreatedByUserHeaders).map(([key, _], colIndex) => (
                            <StyledTableCell key={`${index}-${colIndex}`}>{key == 'creation_date' || key == 'last_modified' ? formatDate(row[key]) : row[key]}</StyledTableCell>
                          ))}
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column',  gap: 2, width: '100%' }}>
                <Typography variant='h6'>Последние добавленные техпроцессы</Typography>
                <Card sx={{ minWidth: 275, height: 'auto' }}>
                  <CardContent sx={{ gap: 0, paddingBottom: 0 }}>
                    <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                      Дата создания последнего техпроцесса
                    </Typography>
                    <Typography variant="h5" component="div">
                    Нет данных
                    </Typography>                          
                  </CardContent>
                  <CardActions>
                    <Button size="small">Подробнее</Button>
                  </CardActions>
                </Card>   
              </Box>
            )}
          </Box>                 
        </Box>
      </>
  );
}

export {Dashboard};