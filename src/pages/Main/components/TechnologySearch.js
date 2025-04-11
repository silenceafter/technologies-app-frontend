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
import { fetchData, setSearch, setPage } from '../../../store/slices/technologiesSlice';
import { debounce } from 'lodash';

const TechnologySearch = React.memo(({ props, selectedValue, onChange}) => {
  //const dispatch = useDispatch();

  //стейты
  const [inputValue, setInputValue] = useState('');
  //const [selectedOption, setSelectedOption] = useState(selectedValue || null);
  
  //запросы
  const search = useSelector((state) => state.technologies.search);
  const limit = useSelector((state) => state.technologies.limit);
  const page = useSelector((state) => state.technologies.page);

  const items = useSelector((state) => state.technologies.searchedItems);
  const loading = useSelector((state) => state.technologies.searchedLoading);
  const error = useSelector((state) => state.technologies.searchingError);
  const hasMore = useSelector((state) => state.technologies.searchingHasMore);

  //эффекты
  /*useEffect(() => {
      setInputValue(selectedValue ? `${selectedValue?.code} ${selectedValue?.name}` : '');
      setSelectedOption(selectedValue || null);
      //dispatch(setOperation(selectedValue ? { code: selectedValue.code, name: selectedValue.name } : { code: '', name: `Новая операция ${tabs ? tabs.length : ''}` }));
    }, [selectedValue, dispatch]);*/

  /*const debouncedFetchData = debounce(() => {
    dispatch(fetchData({ search: inputValue, limit, page: 1 }));
  }, 1);*/

  /*useEffect(() => {
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
  }, [inputValue, search, debouncedFetchData, dispatch]);*/

  /*useEffect(() => {
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
  };*/
  return (
    <>
    {console.log(selectedValue)}
        <Autocomplete          
          options={items || []}
          getOptionLabel={(option) => option == null || option == undefined ? '' : `${option.code} ${option.name}`}
          isOptionEqualToValue={(option, value) =>
            option.code === value?.code && option.name === value?.name
          }
          //getOptionSelected={(option, value) => option.code === value.code && option.name === value.name}
          /*filterOptions={(options, state) => {
            const { inputValue } = state;
            return options.filter(option =>
              option.code.toLowerCase().includes(inputValue.toLowerCase()) ||
              option.name.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}*/
          onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
          }}
          onChange={(event, newValue) => {
            //setSelectedOption(newValue);
            //dispatch(setOperation({ code: !newValue ? '' : newValue.code, name: !newValue ? '' : newValue.name }));
            //
              onChange(newValue); //onOptionSelect('technologyCode', newValue);
          }}
          inputValue={inputValue}
          loadingText="поиск данных"
          noOptionsText="нет результатов"
          loading={loading}
          /*ListboxProps={{                  
              /*onScroll: handleScroll,*/
              /*ref: listRef,*/
        /*      sx: {
              maxHeight: '48vh',
              overflowY: 'auto'
              }
          }}*/
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
              <ListItem {...props} key={`${option?.code}-${option?.name}`} style={{ padding: '8px 16px' }}>
              <ListItemText
                  primary={option?.code}
                  secondary={option?.name}
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
                name={props.name + 'Visible'}
                id={props.id}
                /*error={!!errorValue}
                helperText={errorValue}*/
                placeholder={props.placeholder}
                variant="outlined"
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                size='small'
                /*value={props.placeholder}*/
                onClick={(e) => e.stopPropagation()}
                /*onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    //handleSave();
                  } else if (e.key === 'Escape') {
                    //handleCancel();
                  }
                }}
                onBlur={(e) => {
                  if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
                    // handleCancel(); или не делать ничего
                  }
                }} */               
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
              width: '100%',
              '& .MuiAutocomplete-listbox': {
              backgroundColor: '#fff',
              boxShadow: 2
              },
              '& .MuiAutocomplete-option': {
              padding: '8px 16px'
              },
          }}
          value={selectedValue || null}
        />
        <input 
          type='hidden'
          name='newTechnologyCode'
          value={selectedValue?.code || ''}
        />
        <input 
          type='hidden'
          name='newTechnologyName'
          value={selectedValue?.name || ''}
        />
    </>
  );
});

export { TechnologySearch };