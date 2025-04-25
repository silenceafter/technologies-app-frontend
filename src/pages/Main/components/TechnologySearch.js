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
import { fetchData, setSearch, setPage } from '../../../store/slices/lists/technologiesListSlice';

const TechnologySearch = React.memo(({ props, selectedValue, onChange, options, content, errorValue}) => {
  const dispatch = useDispatch();

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

  //эффекты
  useEffect(() => {
    setInputValue(selectedValue ? `${selectedValue?.code} ${selectedValue?.name}` : '');
    setSelectedOption(selectedValue || null);
  }, [selectedValue, dispatch]);
  //
  return (
    <>
      <Autocomplete          
        options={items || []}
        getOptionLabel={(option) => option == null || option == undefined ? '' : `${option.code} ${option.name}`}
        isOptionEqualToValue={(option, value) =>
          option.code === value?.code && option.name === value?.name
        }
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
          setSelectedOption(newValue);
          if (onChange) {
            onChange('technologyCode', newValue);
          }              
        }}
        inputValue={inputValue}
        loadingText="поиск данных"
        noOptionsText="нет результатов"
        loading={loading}
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
              error={!!errorValue}
              helperText={errorValue}
              placeholder={props.placeholder}
              variant="outlined"
              sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              size='small'              
              onClick={(e) => e.stopPropagation()}                      
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
        value={selectedOption || null}
      />
    </>
  );
});

export { TechnologySearch };