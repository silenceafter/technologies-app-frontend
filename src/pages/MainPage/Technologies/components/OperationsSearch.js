import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    Autocomplete, 
    Box, 
    CircularProgress, 
    ListItem, 
    ListItemText,
    TextField
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData, setPage } from '../../../../store/slices/lists/operationsListSlice';

const OperationsSearch = React.memo(({props, id, selectedValue, options, onChange, errorValue, access }) => {
  const dispatch = useDispatch();
  const onOptionSelect = onChange;

  //стейты
  const [inputValue, setInputValue] = useState(selectedValue ? `${selectedValue?.code} ${selectedValue?.name}` : '');
  const [selectedOption, setSelectedOption] = useState(selectedValue || null);
  
  //запросы
  const { 
    search = '', 
    limit = 10, 
    page = 1, 
    items = [], 
    loading = false, 
    hasMore = false 
  } = options;

  //рефы
  const listRef = useRef(null);

  //события
  const handleScroll = useCallback((event) => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && !hasMore) {
        dispatch(setPage(page + 1));
        dispatch(fetchData({ search, limit, page: page + 1 }));
      }
    }
  }, [dispatch, page, search, limit, loading, hasMore]);
  
  useEffect(() => {
    setInputValue(selectedValue ? `${selectedValue?.code} ${selectedValue?.name}` : '');
    setSelectedOption(selectedValue || null);
  }, [selectedValue, dispatch]);
  //
  return (    
    <> 
      {/* access = true => autocomplete, access = false => textfield readonly */}
      {access ? (
          <Autocomplete
            /*freeSolo*/
            options={items || []}
            getOptionLabel={(option) => option == null || option == undefined ? '' : `${option.code} ${option.name}`}
            getOptionSelected={(option, value) => option.code === value.code && option.name === value.name}
            filterOptions={(options, state) => {
              const { inputValue } = state;
              return options.filter(option =>
                option.code.toLowerCase().includes(inputValue.toLowerCase()) ||
                option.name.toLowerCase().includes(inputValue.toLowerCase())
              );
            }}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
              dispatch(fetchData({ search: newInputValue, limit, page: 1 }));
            }}
            onChange={(event, newValue) => {
              setSelectedOption(newValue);
              //
              if (onOptionSelect) {
                onOptionSelect('operationCode', newValue);
              }
            }}
            inputValue={inputValue}
            loadingText="поиск данных"
            noOptionsText="нет результатов"
            loading={loading}
            ListboxProps={{                  
                onScroll: handleScroll,
                ref: listRef,
                sx: {
                maxHeight: '42.5vh',
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
                  name='operationCode2'
                  id={props.id}
                  error={!!errorValue}
                  helperText={errorValue}
                  placeholder={props.placeholder}
                  variant="outlined"
                  sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                  size='small'
                  value={props.placeholder}
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
            value={selectedOption || null}
          />
      ) 
      : (
        <TextField                          
          fullWidth
          name='operationCode2'
          id={props.id}
          label="Описание операции"
          placeholder={props.placeholder}
          variant="outlined"
          sx={{ backgroundColor: '#fff', borderRadius: 1 }}
          size='small'
          value={`${selectedOption?.code}-${selectedOption?.name}` || ''}
          slotProps={{
            formHelperText: {
              sx: { whiteSpace: 'nowrap' },
            },
            input: { readOnly: true }
          }}
        />
      )}
    </>
  );
});

export { OperationsSearch };