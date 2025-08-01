import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { 
    AppBar,
    Autocomplete, 
    Box, 
    CircularProgress, 
    Grid,
    Link,
    ListItem, 
    ListItemText,
    TextField,
    Toolbar
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData as drawingsFetchData, setSearch, setPage, setDrawing } from '../store/slices/drawingsSlice';
import { fetchData as productsFetchData, setItems as productsSetItems } from '../store/slices/lists/productsListSlice';
import { debounce } from 'lodash';

function HeaderSearch({onReset}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  //селекторы
  const { 
    items, 
    loading, 
    error, 
    hasMore, 
    search, 
    limit, 
    page, 
    drawing
  } = useSelector((state) => state.drawings);
  
  //стейты
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState(null);

  //запросы для прокрутки списка
  
  const memoizedItems = useMemo(() => items, [items]);
  const listRef = useRef(null);

  const debouncedFetchData = debounce(() => {
    dispatch(drawingsFetchData({ search: inputValue, limit, page: 1 }));
  }, 500); //задержка в 500 мс

  //хуки
  //эффекты
  useEffect(() => {
    //загрузка данных при пустом поисковом запросе
    if (!search) {
      dispatch(drawingsFetchData({ search: '', limit, page: 1 }));
    }
  }, [dispatch, search, limit, page]);

  useEffect(() => {
    //поиск при изменении значения в поле ввода
    if (inputValue !== search) {
      dispatch(setSearch(inputValue));
      debouncedFetchData();
    }
  }, [inputValue, search, debouncedFetchData, dispatch]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);//чистим обработчик при размонтировании
  }, [loading, hasMore]);

  //события
  const handleScroll = (event) => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && !hasMore) {
        dispatch(setPage(page + 1));
        dispatch(drawingsFetchData({ search, limit, page: page + 1 }));
      }
    }
  };

  //autocomplete -> onChange
  const handleValueSelect = (value) => {
    setValue(value);
    //обновить выбранное значение в redux
    if (value) {
      //установить значение в redux
      dispatch(setDrawing(value));
      navigate('/technologies');
    } else {
      handleValueClear();
    }
  };

  const handleValueClear = () => {
    //сбросить состояние redux до исходного
    //resetUserData();
    if (onReset && typeof onReset === 'function') {
      onReset();
    }
  };
  //
  return (
    <>
    {console.log(limit)}
      <AppBar component="div" position="static" elevation={0} sx={{ zIndex: 0, paddingBottom: '0.5rem' }}>
        <Toolbar>
          <Grid container spacing={0} sx={{ alignItems: 'center' }}>
            <Grid item>
              {/*<SearchIcon color="inherit" sx={{ display: 'block' }} />*/}
            </Grid>
            <Grid item xs>
              <Autocomplete
                disableListWrap                
                autoComplete={false}
                autoHighlight={false}
                freeSolo={false}
                options={memoizedItems || []}
                getOptionLabel={(option) => option.externalcode || option.label}
                filterOptions={(options, state) => {
                  const { inputValue } = state;
                  return options.filter(option =>
                    option.externalcode.toLowerCase().includes(inputValue.toLowerCase()) ||
                    option.name.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
                onInputChange={(event, newInputValue) => {
                  setInputValue(newInputValue);
                }}
                onChange={(event, newValue) => {
                  handleValueSelect(newValue);
                  //dispatch(productsSetItems());
                  //dispatch(technologiesSetItems());                
                  //dispatch(productsFetchData({limit: 50, page: 1}));
                  //dispatch(technologiesFetchData({ drawing: newValue, user: user }));
                }}
                inputValue={inputValue}
                loadingText="поиск данных"
                noOptionsText="нет результатов"
                loading={loading}
                ListboxProps={{                  
                  onScroll: handleScroll,
                  ref: listRef,
                  sx: {
                    maxHeight: '80vh',
                    overflowY: 'auto'
                  }
                }}
                renderGroup={(params) => (
                  <div key={params.key}>
                    {params.children}
                    {loading && (
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '10px'}}
                      >
                        <CircularProgress size={24} />
                      </Box>
                    )}
                  </div>
                )}
                renderOption={(props, option) => (
                  <ListItem 
                    {...props} 
                    key={`${option.externalcode}-${option.internalcode}-${option.name}`} 
                    style={{ padding: '8px 16px' }}
                  >
                    <ListItemText
                      primary={option.externalcode}
                      secondary={option.name}
                      primaryTypographyProps={{ style: { fontWeight: 'bold' } }}
                      secondaryTypographyProps={{ style: { fontSize: 'small', color: 'gray' } }}
                    />
                  </ListItem>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="код/наименование чертежа"
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
                value={value || drawing || null}
              />
            </Grid>        
          </Grid>
        </Toolbar>
      </AppBar>
    </>
  );
}

export { HeaderSearch };