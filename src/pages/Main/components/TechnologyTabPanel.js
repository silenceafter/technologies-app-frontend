import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Backdrop,
    Box,
    Breadcrumbs,
    CircularProgress,
    Grid,
    Paper,
    IconButton,
    Skeleton,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from "@mui/icons-material/Close";
import { Notifications } from '../components/Notifications';
import { OperationCard } from '../components/OperationCard';
import { MemoizedTabPanel as TabPanel } from '../components/TabPanel';
import { TechnologyBreadcrumbs } from '../components/TechnologyBreadcrumbs';
import { MemoizedTabs } from '../components/MemoizedTabs';
import Toolbar from '@mui/material/Toolbar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  selectItems as technologiesSelectItems, 
  selectLoading as technologiesSelectLoading,
  setTabs, setTabValue, setShouldReloadTabs, selectCurrentItems, updateTechnology,
} from '../../../store/slices/technologiesSlice';
import { selectDrawingExternalCode, selectTechnology, setTechnology } from '../../../store/slices/drawingsSlice';
import { selectOperations, fetchData } from '../../../store/slices/lists/operationsListSlice';
import { TechnologySearch } from '../components/TechnologySearch';
import _ from 'lodash';

function TechnologyTabPanel({ handleClose, open, requestStatus, showLoading, autocompleteOptions, isAutocompleteLoaded }) {
  const dispatch = useDispatch();

  //стейты
  const [isUserClosedAllTabs, setIsUserClosedAllTabs] = useState(false);
  const [validateForm, setValidateForm] = useState(() => () => true);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [currentTechnology, setCurrentTechnology] = useState(null);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [newTechnology, setNewTechnology] = useState(null);
  const [localData, setLocalData] = useState({ 
    dbValues: {},
    formValues: {},
    formErrors: {}, 
    changedValues: {},
    expandedPanels: {},             
  });

  //селекторы
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const { tabs, tabValue, tabCnt, expandedPanelsDefault, shouldReloadTabs } = useSelector((state) => state.technologies);
  const technologiesItems = useSelector(technologiesSelectItems);
  const technologiesLoading = useSelector(technologiesSelectLoading);
  const selectedIds = useSelector((state) => state.technologies.selectedId);
  const hasUnsavedChanges = useSelector((state) => state.technologies.hasUnsavedChanges);
  const currentItems = useSelector(selectCurrentItems);

  //события
  /*const handleOptionSelect = useCallback((id, option) => {
    // Обновляем значение поля
    setLocalData((prev) => {
      const prevOption = prev.content.dbValues[id];
      //проверяем изменения
      if (!_.isEqual(prevOption, option)) {
        //есть изменения
        return {
          ...prev,
          content: {
            ...prev.content,
            formValues: {
              ...prev.formValues,
              [id]: option || null,
            },
            changedValues: {
              ...prev.changedValues,
              [id]: option || null,
            }
          },          
        };        
      } else {
        //нет изменений
        return {
          ...prev,
          content: {
            ...prev.content,
            formValues: {
              ...prev.formValues,
              [id]: option || null,
            },
            changedValues: {
              ...prev.changedValues,
              [id]: option || null,
            }, 
          },          
        };
      }
    });
  
    //убираем ошибку для этого поля
    setLocalData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        formErrors: {
          ...prev.formErrors,
          [id]: '',
        },
      },
    }));
  
    //передаем изменения в родительский компонент
    dispatch(updateTechnology(
      { id: currentTechnology.id,
        newContent: {
          ...localData.content,
            formValues: { ...localData.formValues, [id]: option || null }, 
            formErrors: { ...localData.formErrors, [id]: '' },
            changedValues: { ...localData.changedValues, [id]: option || null },
        }        
      }
    ));
}, [localData]);*/

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
    if (currentItems.length > 0 && currentItems[0]) {
      setCurrentTechnology(currentItems[0]);
      setCurrentOperation(currentItems[1]);
      setLocalData(currentItems[0]);
    }
  }, [currentItems]);
  //
  return (
    <>
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
                /*<TechnologySearch
                  props={{id: "technology-code", name: "newTechnology", placeholder: "Технология"}}
                  selectedValue={currentTechnology?.content.formValues.technologyCode}
                  onChange={handleOptionSelect}
                  options={autocompleteOptions.technologies || null}
                  content={currentTechnology?.content}
                  errorValue={localData?.formErrors?.operationCode}
                />*/
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