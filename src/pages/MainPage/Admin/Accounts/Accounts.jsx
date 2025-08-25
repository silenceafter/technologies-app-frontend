import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Grid, /*TableCell, TableRow,*/ Box, Chip, Typography, TextField } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from '../../../../theme';
import { Navigate, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { getAddedUsers } from '../../../../store/slices/adminSlice';

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */
  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
  };
}

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
  const addedUsersItems = useSelector((state) => state.admin.addedUsersItems);
  const addedUsersLoading = useSelector((state) => state.admin.addedUsersLoading);

  //переменные
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
    backgroundColor: 'rgb(8, 22, 39)',
    color: theme.palette.common.white,
    // Добавляем разделитель справа
    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
    // Убираем разделитель у последней ячейки
    '&:last-child': {
      borderRight: 'none'
    }
  }));

  const UserChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
  }));
  
  const AdminChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  }));

  //события
  //эффекты
  useEffect(() => {
    dispatch(getAddedUsers());
  }, []);

  
  
  return (    
      <>
      {console.log(addedUsersItems)}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 4 }}>
            <Typography variant='h6'>Пользователи</Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell sx={{ fontWeight: 'bold' }}>ФИО</StyledTableCell>
                    <StyledTableCell sx={{ fontWeight: 'bold' }}>Роль</StyledTableCell>
                    <StyledTableCell sx={{ fontWeight: 'bold' }}>Отдел</StyledTableCell>
                    <StyledTableCell sx={{ fontWeight: 'bold' }}>Бюро</StyledTableCell>
                    <StyledTableCell sx={{ fontWeight: 'bold' }}>Должность</StyledTableCell>                    
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addedUsersItems.map((row, index) => (
                    <TableRow
                      key={`addedUsersTableRow-${index}`}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '300px' }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        <Avatar {...stringAvatar(`${row?.lastname} ${row?.firstname}`)} />
                        <Typography>{`${row.lastname} ${row.firstname} ${row.patronimic}`}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{row.status === 'Администратор' ? <AdminChip label={`${row.status}`} variant='outlined' /> : <UserChip label={`${row.status}`} variant='outlined' />}</TableCell>
                      <TableCell sx={{ whiteSpace: 'normal', maxWidth: '150px' }}>{row.division}</TableCell>
                      <TableCell sx={{ whiteSpace: 'normal', maxWidth: '200px' }}>{row.group}</TableCell>
                      <TableCell sx={{ whiteSpace: 'normal', maxWidth: '150px' }}>{row.post}</TableCell>                      
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        </Box>
      </>
  );
}

export {Accounts};