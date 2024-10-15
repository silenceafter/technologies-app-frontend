import React, { useEffect, useState, useRef } from 'react';
import { 
    Autocomplete, 
    Box,
    Chip,
    CircularProgress, 
    ListItem, 
    ListItemText,
    TextField
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData, setSearch, setPage, selectSearch, selectLimit, selectPage } from '../store/slices/rigSlice';
import { debounce } from 'lodash';

function RigSearch({ id, selectedValue, onOptionSelect }) {
  const dispatch = useDispatch();

  //TextField
  const [inputValue, setInputValue] = useState('');
  
  //запросы
  const search = useSelector(selectSearch);
  const limit = useSelector(selectLimit);
  const page = useSelector(selectPage);

  //запросы для прокрутки списка
  const { items, loading, error, hasMore } = useSelector((state) => state.rig);
  const listRef = useRef(null);

  const debouncedFetchData = debounce(() => {
    dispatch(fetchData({ search: inputValue, limit, page: 1 }));
  }, 200);

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
  return (
    <>
        <Autocomplete
          multiple
          options={items || []}
          getOptionLabel={(option) => `${option.code} ${option.name}`}
          filterOptions={(options, state) => {
              const { inputValue } = state;
              return options.filter(option =>
              option.code.toLowerCase().includes(inputValue.toLowerCase()) ||
              option.name.toLowerCase().includes(inputValue.toLowerCase())
              );
          }}
          onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
          }}
          onChange={(event, newValue) => {
              onOptionSelect(id, newValue);
          }}
          inputValue={inputValue}
          loadingText="поиск данных"
          noOptionsText="нет результатов"
          loading={loading}
          ListboxProps={{                  
              onScroll: handleScroll,
              ref: listRef,
              sx: {
              maxHeight: '48vh',
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
              <ListItem {...props} key={`${option.code}-${option.name}`} style={{ padding: '8px 16px' }}>
              <ListItemText
                  primary={option.code}
                  secondary={option.name}
                  primaryTypographyProps={{ style: { fontWeight: 'bold' } }}
                  secondaryTypographyProps={{ style: { fontSize: 'small', color: 'gray' } }}
              />
              </ListItem>
          )}
          renderInput={(params) => (
              <TextField
              {...params}
              required
              fullWidth
              id="rig-14"
              placeholder="Оснастка"
              variant="outlined"
              sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              size='small'           
              />
          )}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                key={index}
                label={option.name || option.label}
                {...getTagProps({ index })}         
              />
            ))
          }
          sx={{
              '& .MuiAutocomplete-listbox': {
              backgroundColor: '#fff',
              boxShadow: 2
              },
              '& .MuiAutocomplete-option': {
              padding: '8px 16px'
              },
          }}
          value={selectedValue}
            />
    </>
  );
}

export { RigSearch };