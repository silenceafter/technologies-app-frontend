import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import HelpIcon from '@mui/icons-material/Help';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import { Autocomplete, Box, CircularProgress, Input, ListItem, ListItemText, Toolbar } from '@mui/material';
import { fetchDataGet } from '../store/thunk/thunks';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData, setSearch, setLimit, setMax, selectSearch, selectLimit, selectMax } from '../store/slices/headerSlice';

const lightColor = 'rgba(255, 255, 255, 0.7)';

function Header(props) {
  const { onDrawerToggle } = props;
  const theme = useTheme();
  const dispatch = useDispatch();

  const [value, setValue] = useState(null);
  const { key, ...restProps } = props;
  

  //запросы
  const userDataRequest = useSelector((state) => state.getRequest.userDataRequest);
  const search = useSelector(selectSearch);
  const limit = useSelector(selectLimit);
  const max = useSelector(selectMax);

  //запросы для прокрутки списка
  const { items, loading, error } = useSelector((state) => state.header);
  const listboxRef = useRef(null);

  const shouldFetchData = search !== undefined && limit !== undefined && max !== undefined;

  useEffect(() => {
    if (shouldFetchData) {
      dispatch(fetchData({ search, limit, max }));
    }      
  }, [dispatch, search, limit, max, shouldFetchData]);

  const handleScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop === clientHeight) {
      //dispatch(setPage(page + 1));
      console.log('handleScroll');
    }
  };

  return (
    <React.Fragment>
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
              <IconButton color="inherit" sx={{ p: 0.5 }}>
                <Avatar src="/static/images/avatar/1.jpg" alt="My Avatar" />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar component="div" color="primary" position="static" elevation={0} sx={{ zIndex: 0 }}>
        <Toolbar>
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid item xs>
              <Typography color="inherit" variant="h5" component="h1">
                Ввод чертежей
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
      <AppBar component="div" position="static" elevation={0} sx={{ zIndex: 0, paddingBottom: '0.5rem' }}>
        <Toolbar>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid item>
              <SearchIcon color="inherit" sx={{ display: 'block' }} />
            </Grid>
            <Grid item xs>
              <Autocomplete
                options={items?.html || []}
                getOptionLabel={(option) => option.ex_code || option.label}
                filterOptions={(options, state) => {
                  const { inputValue } = state;
                  return options.filter(option =>
                    option.ex_code.toLowerCase().includes(inputValue.toLowerCase()) ||
                    option.name.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
                onChange={(event, newValue) => {
                  setValue(newValue);
                  console.log('Выбранное значение:', newValue); // Здесь вы можете выполнять действия с выбранным значением
                }}
                noOptionsText="нет результатов"
                ListboxProps={{
                  onScroll: handleScroll,
                  sx: {
                    maxHeight: '80vh',
                    overflowY: 'auto'
                  }
                }}
                renderOption={(props, option) => (
                  <ListItem {...props} style={{ padding: '8px 16px' }}>
                    <ListItemText
                      primary={option.ex_code}
                      secondary={option.name}
                      primaryTypographyProps={{ style: { fontWeight: 'bold' } }}
                      secondaryTypographyProps={{ style: { fontSize: 'small', color: 'gray' } }}
                    />
                  </ListItem>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Код/Наименование"
                    variant="outlined"
                    sx={{ backgroundColor: '#fff', borderRadius: 1, width: '30%' }}
                    size='small'
                    
                  />
                )}
                sx={{
                  '& .MuiAutocomplete-listbox': {
                    backgroundColor: '#fff',
                    boxShadow: 2
                  },
                  '& .MuiAutocomplete-option': {
                    padding: '8px 16px'
                  },
                }}
                value={value}
              />
            </Grid>        
          </Grid>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

Header.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
};

export default Header;
