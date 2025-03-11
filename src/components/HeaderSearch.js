import React, { useEffect, useState, useRef, useMemo } from 'react';
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
import { fetchData, setSearch, setPage, selectSearch, selectLimit, selectPage } from '../store/slices/headerSlice';
import { setDrawing, clearDrawing, setTechnology, clearTechnology } from '../store/slices/drawingsSlice';
import { fetchData as productsFetchData, setItems as productsSetItems } from '../store/slices/productsSlice';
import { getSavedData as technologiesFetchData, clearItems as technologiesSetItems } from '../store/slices/technologiesSlice';
import { debounce } from 'lodash';

function HeaderSearch(props) {
  const dispatch = useDispatch();

  const [value, setValue] = useState(null);
  const { key, ...restProps } = props;

  //TextField
  const [inputValue, setInputValue] = useState('');
  
  //селекторы
  const userDataRequest = useSelector((state) => state.getRequest.userDataRequest);
  const search = useSelector(selectSearch);
  const limit = useSelector(selectLimit);
  const page = useSelector(selectPage); 

  //запросы для прокрутки списка
  const { items, loading, error, hasMore } = useSelector((state) => state.header);
  const memoizedItems = useMemo(() => items, [items]);
  const listRef = useRef(null);

  const debouncedFetchData = debounce(() => {
    dispatch(fetchData({ search: inputValue, limit, page: 1 }));
  }, 500); //задержка в 500 мс

  useEffect(() => {
    //загрузка данных при пустом поисковом запросе
    if (!search) {
      dispatch(fetchData({ search: '', limit, page: 1 }));
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

  const handleScroll = (event) => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && !hasMore) {
        dispatch(setPage(page + 1));
        dispatch(fetchData({ search, limit, page: page + 1 }));
      }
    }
  };
  //
  return (
    <>
      <AppBar component="div" position="static" elevation={0} sx={{ zIndex: 0, paddingBottom: '0.5rem' }}>
        <Toolbar>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid item>
              {/*<SearchIcon color="inherit" sx={{ display: 'block' }} />*/}
            </Grid>
            <Grid item xs>
              {/*<Autocomplete
                disableListWrap                
                autoComplete={false}
                autoHighlight={false}
                freeSolo={false}
                options={memoizedItems || []}
                getOptionLabel={(option) => option.external_code || option.label}
                filterOptions={(options, state) => {
                  const { inputValue } = state;
                  return options.filter(option =>
                    option.external_code.toLowerCase().includes(inputValue.toLowerCase()) ||
                    option.name.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
                onInputChange={(event, newInputValue) => {
                  setInputValue(newInputValue);
                }}
                onChange={(event, newValue) => {
                  setValue(newValue);              

                  //обновить выбранное значение в redux                 
                  if (newValue) {
                    dispatch(setDrawing(
                      {
                        externalCode: newValue.external_code, 
                        internalCode: newValue.internal_code, 
                        name: newValue.name
                      }
                    ));                
                  } else {
                    dispatch(clearDrawing());
                    dispatch(clearTechnology());
                  }
                  //
                  dispatch(productsSetItems());
                  dispatch(technologiesSetItems());                
                  dispatch(productsFetchData({limit: 50, page: 1}));
                  dispatch(technologiesFetchData({}));
                }}
                onClose={console.log('clear')}
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
                    key={`${option.external_code}-${option.internal_code}-${option.name}`} 
                    style={{ padding: '8px 16px' }}
                  >
                    <ListItemText
                      primary={option.external_code}
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
              />*/}
            </Grid>        
          </Grid>
        </Toolbar>
      </AppBar>
    </>
  );

}

export { HeaderSearch };