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
import { fetchData as productsFetchData, setItems as productsSetItems } from '../store/slices/lists/productsListSlice';
import { getSavedData as technologiesFetchData, clearItems as technologiesSetItems } from '../store/slices/technologiesSlice';
import { debounce } from 'lodash';
import { Navigate, useNavigate } from 'react-router-dom';

function HeaderSearchT(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [value, setValue] = useState(null);
  const { key, ...restProps } = props;

  //TextField
  const [inputValue, setInputValue] = useState('');
  const [loadingValues, setLoadingValues] = useState(false);
  
  //селекторы
  const search = useSelector(selectSearch);
  const limit = useSelector(selectLimit);
  const page = useSelector(selectPage);

  //запросы для прокрутки списка
  const { items, loading, error, hasMore } = useSelector((state) => state.header);
  const memoizedItems = useMemo(() => items, [items]);
  const listRef = useRef(null);

  const debouncedFetchData = debounce(() => {
    dispatch(fetchData({ search: inputValue, limit, page: 1 }));
  }, 500);

  useEffect(() => {
    //загрузка данных при пустом поисковом запросе
    if (!search) {
      dispatch(fetchData({ search: '', limit, page: 1 }));
    }
  }, [dispatch, search, limit, page]);

  useEffect(() => {
    if (loadingValues) {
      const timeoutId = setTimeout(() => {
        debouncedFetchData();
        setLoadingValues(false);        
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [loadingValues]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);//чистим обработчик при размонтировании
  }, [loading, hasMore]);

  const handleScroll = (event) => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 40 && !loading && !hasMore) {
        dispatch(setPage(page + 1));
        dispatch(fetchData({ search, limit, page: page + 1 }));
      }
    }
  };
  //
  return (
    <>
    <Autocomplete      
      autoHighlight={true}
      freeSolo={false}
      options={memoizedItems || []}
      getOptionLabel={(option) => option == null || option == undefined ? '' : option.external_code}
      filterOptions={(options, state) => {
        const { inputValue } = state;
        return options.filter(option =>
          option.external_code.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.name.toLowerCase().includes(inputValue.toLowerCase())
        );
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        setLoadingValues(true);
      }}
      onChange={(event, newValue) => {
        setValue(newValue);                
        dispatch(setSearch(inputValue));
        
        //обновить список и завершить таймер
        debouncedFetchData();     
        setLoadingValues(false);

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

        navigate('/crud');
      }}
      inputValue={inputValue}
      loadingText="поиск данных"
      noOptionsText="нет результатов"
      loading={loadingValues}
      ListboxProps={{                  
        onScroll: handleScroll,
        ref: listRef,
        sx: {
          maxHeight: '50vh',/*80vh*/
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
          sx={{ backgroundColor: '#fff', borderRadius: 1 }}
          size='small'
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loadingValues ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            },
          }}
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
      value={value || null}
    />    
    </>
  );
}

export { HeaderSearchT };