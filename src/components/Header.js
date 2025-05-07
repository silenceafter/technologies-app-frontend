import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import HelpIcon from '@mui/icons-material/Help';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AppBar, Avatar, Button, Grid, IconButton, Link, Toolbar, Tooltip, Typography, Stack, Box } from '@mui/material';
import { HeaderSearch } from './HeaderSearch';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from '../store/slices/usersSlice';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';

const lightColor = 'rgba(255, 255, 255, 0.7)';

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

function Header(props) {
  const { onDrawerToggle } = props;
  const dispatch = useDispatch();

  //стейты
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  //селекторы
  const user = useSelector((state) => state.users.user);
  const loading = useSelector((state) => state.users.loading);
  const error = useSelector((state) => state.users.error);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserExitClose = async () => {
    //Учетная запись -> Выйти
    dispatch(signOut());
    setAnchorEl(null);
  };
  //
  return (
    <>
      <AppBar color="primary" position="sticky" elevation={0}>
        <Toolbar>
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid item>
              <IconButton color="inherit" aria-label="open drawer" onClick={onDrawerToggle} edge="start">
                <MenuIcon />
              </IconButton>
            </Grid>
            <Grid item xs />
            <Grid item>
              <Link href="/" variant="body2" sx={{ textDecoration: 'none', color: lightColor }}>
                Go to docs
              </Link>
            </Grid>
            <Grid item>
              <Tooltip title="Alerts • No alerts">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <IconButton onClick={handleClick} color="inherit" sx={{ p: 0.5 }}>
                {!loading && !error ? (
                  <Avatar {...stringAvatar(`${user?.lastname} ${user?.firstname}`)} />
                ) : (
                  <Avatar {...stringAvatar('Неизвестный пользователь')} />
                )}                
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleClose}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    
                      <IconButton onClick={handleClick} color="inherit" sx={{ p: 0.5 }}>
                        {!loading && !error ? (
                          <Avatar {...stringAvatar(`${user?.lastname} ${user?.firstname}`)} />
                        ) : (
                          <Avatar {...stringAvatar('Неизвестный пользователь')} />
                        )}                
                      </IconButton> 
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography>{user?.lastname} {user?.firstname} {user?.patronimic}</Typography>
                        <Typography sx={{ fontStyle: 'italic'}}>{user?.status}</Typography>
                      </Box>                    
                  </Box>
                </MenuItem>
                <Divider />                
                <MenuItem onClick={handleClose}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Настройки
                </MenuItem>
                <MenuItem onClick={handleUserExitClose}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Выйти
                </MenuItem>
              </Menu>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar component="div" color="primary" position="static" elevation={0} sx={{ zIndex: 0 }}>
        <Toolbar>
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid item xs>
              <Typography color="inherit" variant="h5" component="h1">
                Технологии
              </Typography>
            </Grid>
            <Grid item>
              <Button sx={{ borderColor: lightColor }} variant="outlined" color="inherit" size="small">
                Web setup
              </Button>
            </Grid>
            <Grid item>
              <Tooltip title="Help">
                <IconButton color="inherit">
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <HeaderSearch props={props} />      
    </>
  );
}

Header.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
};

export {Header};
