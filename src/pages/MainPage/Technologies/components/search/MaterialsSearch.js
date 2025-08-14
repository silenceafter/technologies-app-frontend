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
import { debounce } from 'lodash';
import { fetchData, setLimit, setPage, setSearch } from '../../../../../store/slices/lists/materialsListSlice';

// Функция для безопасного форматирования одного элемента
const formatOption = (option) => {
  if (!option) return '';
  const code = option.code !== undefined && option.code !== null ? option.code : '';
  const name = option.name !== undefined && option.name !== null ? option.name : '';
  return `${code} ${name}`.trim();
};

// Функция для форматирования массива элементов
const formatOptions = (options) => {
  if (!options) return '';
  if (Array.isArray(options)) {
    return '';//options.map(formatOption).filter(Boolean).join(', ');
  }
  return formatOption(options);
};

const MaterialsSearch = React.memo(({ props, id, selectedValue, options, onChange, errorValue, access }) => {
  const dispatch = useDispatch();
  const onOptionSelect = onChange;
  
  // Стейт
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Рефы
  const listRef = useRef(null);
  
  // Запросы
  const { 
    search = '',
    limit = 500,
    page = 1,
    items = [],
    loading = false,
    hasMore = false
  } = options;

  const debouncedFetchData = debounce(() => {
    dispatch(fetchData({ search: inputValue, limit, page: 1 }));
  }, 1);

  // Эффекты
  useEffect(() => {
    // Установка начального значения только при первой загрузке
    if (isInitialLoad) {
      const formattedValue = formatOptions(selectedValue);
      setInputValue(formattedValue);
      setSelectedOption(selectedValue || []);
      setIsInitialLoad(false); // отключаем флаг начальной загрузки
    }
  }, []);

  useEffect(() => {
    // Обновление значения только если компонент уже инициализирован
    if (!isInitialLoad) {
      setInputValue(formatOptions(selectedValue));
      setSelectedOption(selectedValue || []);
    }
  }, [selectedValue]);

  useEffect(() => {
    // Загрузка данных при пустом поисковом запросе
    if (!search && !isInitialLoad) {
      dispatch(fetchData({ search: '', limit, page: 1 }));
    }
  }, [dispatch, search, limit, page, isInitialLoad]);

  useEffect(() => {
    // Поиск при изменении значения поля ввода
    if (!isInitialLoad && inputValue !== search) {
      dispatch(setSearch(inputValue));
      debouncedFetchData();
    }
  }, [inputValue, search, debouncedFetchData, dispatch, isInitialLoad]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // очищаем обработчик
  }, [loading, hasMore]);

  // События
  const handleScroll = (event) => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && hasMore) {
        dispatch(setPage(page + 1));
        dispatch(fetchData({ search, limit, page: page + 1 }));
      }
    }
  };

  // Обработчик выбора опции
  const handleChange = (event, newValue) => {
    setSelectedOption(newValue);
    if (onOptionSelect) {
      onOptionSelect('materialCode', newValue);
    }
  };

  return (
    <>
    {console.log(selectedValue)}
      {access ? (        
        <Autocomplete
          fullWidth
          multiple
          options={items || []}
          getOptionLabel={(option) => formatOption(option)}
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
          }}
          onChange={handleChange}
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
                  padding: '10px'}}>
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
              name='materialCode6'
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
      ) : (
        <TextField
          fullWidth
          name='materialCode6'
          id={id}
          label="Код материала"
          placeholder={props.placeholder}
          variant="outlined"
          sx={{ backgroundColor: '#fff', borderRadius: 1 }}
          size='small'
          value={
            Array.isArray(selectedOption)
              ? selectedOption.map(formatOption).join(', ')
              : formatOption(selectedOption)
          }
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

export { MaterialsSearch };