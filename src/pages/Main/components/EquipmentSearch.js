import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { fetchData, setPage } from '../../../store/slices/lists/equipmentListSlice';

const EquipmentSearch = React.memo(({props, id, selectedValue, options, onChange, errorValue }) => {
  const dispatch = useDispatch();
  const onOptionSelect = onChange;

  //стейты
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState(selectedValue || []);
  
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
    setInputValue('');
    setSelectedOption(selectedValue || []);
  }, [selectedValue, dispatch]);
  //
  return (    
    <>
    {console.log(items)}
        <Autocomplete
          /*freeSolo*/
          multiple
          options={items || []}
          getOptionLabel={(option) => option == null || option == undefined ? '' : `${option.name} ${option.type ? option.type : ''}`}
          getOptionSelected={(option, value) => option.name === value.name && option.type === value.type}
          filterOptions={(options, state) => {
            const { inputValue } = state;
            return options.filter(option =>
              option.type
                ? option.name.toLowerCase().includes(inputValue.toLowerCase()) || option.type.toLowerCase().includes(inputValue.toLowerCase())
                : option.name.toLowerCase().includes(inputValue.toLowerCase()));
          }}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
            dispatch(fetchData({ search: newInputValue, limit, page: 1 }));
          }}
          onChange={(event, newValue) => {
            setSelectedOption(newValue);
            //
            if (onOptionSelect) {
              onOptionSelect('equipmentCode', newValue);
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
            <ListItem {...props} key={`${option.name} ${option.type ? option.type : ''}`} style={{ padding: '8px 16px' }}>
            <ListItemText
                primary={option.name}
                secondary={option.type}
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
                name='equipment'
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
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                key={index}
                label={`${option.name} ${option.type ? option.type : ''}` || option.label}
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
          value={selectedOption || []}
        />
    </>
  );
});

export { EquipmentSearch };