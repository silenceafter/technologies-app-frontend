import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    CircularProgress,
    FormControl,
    FormHelperText,
    Grid,
    MenuItem,
    InputLabel,
    Select,
    TextField
} from '@mui/material';
import {
  selectItems as technologiesSelectItems, 
  selectLoading as technologiesSelectLoading,
  setTabs, setTabValue, setShouldReloadTabs, selectCurrentItems, updateTechnology,
} from '../../../../store/slices/technologiesSlice';
import { selectDrawingExternalCode } from '../../../../store/slices/drawingsSlice';
import { fetchData as technologiesPrefixFetchData} from '../../../../store/slices/technologiesPrefixSlice';
import _ from 'lodash';

function TechnologyTabPanel({ handleClose, showLoading, autocompleteOptions, isAutocompleteLoaded }) {
  const dispatch = useDispatch();
  const dateOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'shortOffset'
  };

  //стейты
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [currentTechnology, setCurrentTechnology] = useState(null);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [prefixList, setPrefixList] = useState('');
  const [prefixHasError, setPrefixHasError] = useState(false);
  const [technologyCreationDate, setTechnologyCreationDate] = useState(null);

  //селекторы
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const currentItems = useSelector(selectCurrentItems);
  const technologiesPrefixItems = useSelector((state) => state.technologiesPrefix.items);
  const technologiesPrefixLoading = useSelector((state) => state.technologiesPrefix.loading);
  const user = useSelector((state) => state.users.user);

  //события
  const handleChange = (event) => {
    dispatch(updateTechnology({ id: currentTechnology.id, prefixValue: event.target.value}));
  };

  //эффекты
  //анимация загрузки вкладки
  useEffect(() => {
    if (drawingExternalCode != '') {
      setLoadingTimer(true);
      setTimeout(() => {
        setLoadingTimer(false);
      }, 1000); 
    }
  }, [drawingExternalCode]);

  useEffect(() => {
    if (!currentItems) { return; }
    try {
      setCurrentTechnology(currentItems[0]);
      setCurrentOperation(currentItems[1]);
    } catch (e) {
      console.error('Ошибка при получении данных из хранилища', e);
    }      
  }, [currentItems, currentTechnology]);

  useEffect(() => {
    if (user) {
      dispatch(technologiesPrefixFetchData({ UID: user.UID, ivHex: user.ivHex, keyHex: user.keyHex }));
    }
  }, [user]);


  useEffect(() => {
    if (!technologiesPrefixLoading && technologiesPrefixItems.length > 0) {
      const menuItems = technologiesPrefixItems.map(option => (
        <MenuItem key={option.prefix} value={option.prefix}>{option.prefix}</MenuItem>
      ));
      setPrefixList(menuItems);
    }
  }, [technologiesPrefixItems, technologiesPrefixLoading]);

  useEffect(() => {
    if (currentTechnology) {
      setPrefixHasError(('prefix' in currentTechnology?.content?.formErrors && !currentTechnology?.content?.formValues?.prefix ? true : false));
      setTechnologyCreationDate(new Date(currentTechnology.creationDate));
    }
  }, [currentTechnology]);
  //
  return (
    <>
    {console.log(currentTechnology)}
      <Box sx={{           
        height: '100%',
        overflowY: 'auto'
      }}>
        {!isAutocompleteLoaded || showLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center', py: 5 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: 2/*, height: '90%'*/ }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2, width: '100%' }}>
              {currentTechnology && (
                <form>
                  <Grid container spacing={2} columns={{xs:5}}>
                    {/* Первая строка */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={2.4}>
                          <TextField                       
                            fullWidth           
                            name='technologyCode'
                            id="technology-code-1"
                            label="Код технологии"
                            type="text"
                            size="small"
                            value={currentTechnology.content.formValues.technologyCode?.code || currentTechnology.label}
                            slotProps={{
                              formHelperText: {
                                sx: { whiteSpace: 'nowrap' },
                              },
                              input: { readOnly: true }
                            }}
                          >
                          </TextField>
                        </Grid>
                        <Grid item xs={2.4}>
                          <TextField                       
                            fullWidth           
                            name='technologyName'
                            id="technology-name-2"
                            label="Название технологии"
                            type="text"
                            size="small"
                            value={currentTechnology.content.formValues.technologyCode?.name || currentTechnology.secondaryLabel}
                            slotProps={{
                              formHelperText: {
                                sx: { whiteSpace: 'nowrap' },
                              },
                              input: { readOnly: true }
                            }}
                          >
                          </TextField>
                        </Grid>
                        {currentTechnology?.content?.isNewRecord && (<Grid item xs={4.8}>
                          <FormControl size='small' fullWidth required error={prefixHasError}>
                            <InputLabel id="technologies-prefix-select-label">Префикс</InputLabel>
                            <Select
                              labelId="technologies-prefix-select-label"
                              id="technologies-prefix-select"
                              value={currentTechnology?.content?.formValues?.prefix}
                              label="Префикс *"
                              onChange={(e) => handleChange(e)}
                            >
                              {prefixList}
                            </Select>
                            {prefixHasError && <FormHelperText>{currentTechnology?.content?.formErrors?.prefix}</FormHelperText>}
                          </FormControl>
                        </Grid>)}
                      </Grid>                    
                    </Grid>
                    {/* Вторая строка */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={4.8}>
                          <TextField                       
                            fullWidth           
                            name='technologyCreationDate'
                            id="technology-creation-date-3"
                            label="Дата создания"
                            placeholder={!technologyCreationDate ? 'Дата создания' : ''}
                            type="text"
                            size="small"
                            value={technologyCreationDate && technologyCreationDate.toLocaleString('ru-RU', dateOptions) || null}
                            slotProps={{
                              formHelperText: {
                                sx: { whiteSpace: 'nowrap' },
                              },
                              input: { readOnly: true },
                              inputLabel: { shrink: !!technologyCreationDate }
                            }}
                          >
                          </TextField>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Box>
          </Box>
          )
        }        
      </Box>
    </>
  );
}

export { TechnologyTabPanel };