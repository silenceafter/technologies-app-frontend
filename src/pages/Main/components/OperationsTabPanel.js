import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    AppBar,
    Box,
    CircularProgress,
    Paper,
    IconButton,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from "@mui/icons-material/Close";
import { Notifications } from '../components/Notifications'; //'../pages/Main/components/Notifications';
import { OperationCard } from '../components/OperationCard'; //'../pages/Main/components/OperationCard';
import { MemoizedTabPanel as TabPanel } from '../components/TabPanel'; //'../pages/Main/components/TabPanel';
import { TechnologyBreadcrumbs } from '../components/TechnologyBreadcrumbs'; //'../pages/Main/components/TechnologyBreadcrumbs';
import { MemoizedTabs } from '../components/MemoizedTabs'; //'../pages/Main/components/MemoizedTabs';

import { setTabs, addTab, removeTab, updateTab, setTabValue, setData } from '../../../store/slices/operationsTabsSlice'; //'../store/slices/operationsTabsSlice';
import {
  selectItems as technologiesSelectItems, 
  selectLoading as technologiesSelectLoading
} from '../../../store/slices/technologiesSlice'; //'../store/slices/technologiesSlice';
import { selectDrawingExternalCode, selectTechnology, setTechnology, selectOperation } from '../../../store/slices/drawingsSlice'; //'../store/slices/drawingsSlice';
import { selectOperations, fetchData } from '../../../store/slices/operationsSlice'; //'../store/slices/operationsSlice';

function OperationsTabPanel({ handleClose, open, requestStatus, loadingTimer, setLoadingTimer }) {
  const dispatch = useDispatch();

  //стейты
  const [autocompleteOptions, setAutocompleteOptions] = useState({});
  const [isAutocompleteLoaded, setIsAutocompleteLoaded] = useState(false);
  const [isUserClosedAllTabs, setIsUserClosedAllTabs] = useState(false);
  const [validateForm, setValidateForm] = useState(() => () => true);

  //селекторы
  const currentTechnology = useSelector(selectTechnology);
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const { tabs, tabValue, tabCnt, expandedPanelsDefault } = useSelector((state) => state.operationsTabs);
  const technologiesItems = useSelector(technologiesSelectItems);
  const technologiesLoading = useSelector(technologiesSelectLoading);
  const operationsSelectors = useSelector(selectOperations);
  const operationsItems = operationsSelectors?.items;
  const operationsLoading = operationsSelectors?.loading;
  

  //события
  const handleAddTab = useCallback(() => {
    if (!currentTechnology) {
      return;
    }
    //
    const newTab = {
      id: tabCnt,
      label: `Новая операция ${tabCnt}`,
      content: {
        dbValues: {},
        formValues: {},
        formErrors: {},
        changedValues: {},
        expandedPanels: expandedPanelsDefault,
        isDeleted: false,
      },
      drawing: { code: drawingExternalCode },
      operation: null,
      technology: {
        code: technologiesItems[0].label, 
        name: technologiesItems[0].secondaryLabel,
        userId: technologiesItems[0].userId,
        creationDate: technologiesItems[0].creationDate,
        lastModified: technologiesItems[0].lastModified
      },
      proxy: {
        proxyDTId: currentTechnology.proxyId,
        ivHex: currentTechnology.ivHex,
        keyHex: currentTechnology.keyHex,
      },
    };
    //
    dispatch(addTab(newTab));
    dispatch(setTabValue(tabs.length));
    //dispatch(setOperation({name: '', code: ''}));
  }, [dispatch, tabCnt, tabs]);

  const handleRemoveTab = useCallback(
    (id) => {
      const removedIndex = tabs.findIndex(tab => tab.id === id);
      dispatch(removeTab(id));
      //
      let newTabValue = tabValue;    
      if (removedIndex === tabValue) {
        //если удалили активную вкладку:
        if (removedIndex === tabs.length - 1) {          
          newTabValue = Math.max(0, removedIndex - 1);//удалили последнюю вкладку — выбрать предыдущую
        } else {          
          newTabValue = removedIndex;//выбрать следующую вкладку
        }
      }
      //      
      if (tabs.length === 1) {
        newTabValue = 0;//если после удаления вкладок остался 0, установить tabValue в 0 (или null)
        setIsUserClosedAllTabs(true);//флаг
      } 
      dispatch(setTabValue(newTabValue)); 
    },
    [dispatch, tabs, tabValue, setIsUserClosedAllTabs]
  );
  
  const handleUpdateTabContent = useCallback(
    (tabId, newContent, newValidateForm) => {
      dispatch(updateTab({ id: tabId, newContent: newContent, newValidateForm: newValidateForm }));
    }, 
    [dispatch]
  );

  const handleOperationUpdate = useCallback(
    (newData) => {
      const currentTab = tabs[tabValue];
      if (currentTab && currentTab.id) {
        handleUpdateTabContent(currentTab.id, newData, newData.validateForm);
      }
    },
    [handleUpdateTabContent, tabValue, tabs/*, validateForm*/]
  );

  const setValidateFormStable = useCallback(
    (newValidateForm) => setValidateForm(newValidateForm),
    [setValidateForm]
  );

  //эффекты
  //анимация загрузки вкладки
  useEffect(() => {
    if (drawingExternalCode != '') {
      setLoadingTimer(true);
      setTimeout(() => {
        setLoadingTimer(false);
      }, 500); 
    }
  }, [drawingExternalCode]);

  useEffect(() => {    
    dispatch(fetchData({ search: '', limit: 10, page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    if (!operationsLoading && operationsItems) {
      setAutocompleteOptions(prevState => ({
        ...prevState,
        operations: operationsSelectors
      }));
      setIsAutocompleteLoaded(true); //загрузка items завершена
    }
  }, [operationsItems, operationsLoading]);
  
  //стейт вкладок/карточек
  useEffect(() => {
    try {
      if (/*!technologiesLoading && technologiesItems.length > 0 &&*/ drawingExternalCode.length > 0) {
        if (tabs.length === 0 && !isUserClosedAllTabs) {
          //изначально вкладки создаются из technologiesItems 
          const newTabs = technologiesItems[0].children
            .filter(operation => operation.orderNumber)
            .map(operation => {
              // Ищем существующую вкладку, чтобы сохранить ошибки и состояние панелей
              const existingTab = tabs.find(tab => tab.id === operation.orderNumber);
              const data = {                
                //parameters
                orderNumber: operation.orderNumber,
                operationCode: { code: operation.label, name: operation.secondaryLabel, cnt: operation.proxyOId },                
                shopNumber: operation.parameters.shopNumber,
                areaNumber: operation.parameters.areaNumber,
                document: operation.parameters.document,
                operationDescription: operation.parameters.operationDescription,
              
                //jobs  
                grade: operation.jobs.grade,
                workingConditions: operation.jobs.workingConditions,
                numberOfWorkers: operation.jobs.numberOfWorkers,
                numberOfProcessedParts: operation.jobs.numberOfProcessedParts,
                laborEffort: operation.jobs.laborEffort,
                job: { code: operation.jobs.jobCode, name: operation.jobs.jobName },
              };
              console.log(data);
              //
              return {
                id: operation.orderNumber,
                label: `${operation.secondaryLabel} (${operation.label})`,                
                operation: { code: operation.label, name: operation.secondaryLabel },
                technology: {
                  code: technologiesItems[0].label, 
                  name: technologiesItems[0].secondaryLabel,
                  userId: technologiesItems[0].userId,
                  creationDate: technologiesItems[0].creationDate,
                  lastModified: technologiesItems[0].lastModified
                },
                drawing: { code: drawingExternalCode },
                content: {
                  dbValues: data,
                  formValues: data,
                  formErrors: existingTab?.content?.formErrors || {}, // Сохраняем ошибки
                  changedValues: existingTab?.content?.changedValues || {}, //реквизиты, в которых были изменения
                  expandedPanels: existingTab?.content?.expandedPanels || expandedPanelsDefault, // Сохраняем раскрытые панели
                  isDeleted: false,
                },
                proxy: {
                  proxyDTId: operation.proxyDTId,
                  proxyTOId: operation.proxyTOId,
                  keyHex: technologiesItems[0].keyHex,
                  ivHex: technologiesItems[0].ivHex
                }
              };
            }
          );
          //
          dispatch(setTabs(newTabs));
          dispatch(setTabValue(0)); //первая вкладка активна по умолчанию
        }
      }
  
      //устанавливаем текущую выбранную технологию
      dispatch(setTechnology(technologiesItems[0]));
    } catch (error) {
      console.error("Ошибка при обработке технологий:", error);
    }
  }, [technologiesLoading, technologiesItems, /*drawingExternalCode, tabs, isUserClosedAllTabs*/]);

  //очистить стейт вкладок/карточек
  useEffect(() => {
    if (!drawingExternalCode) {
      //setTabValue(0);
      //setTabs([]);
    }
  }, [drawingExternalCode]);

  //корректируем tabValue для того, чтобы сохранялась активная вкладка при удалении других вкладок
  useEffect(() => {
    if (tabValue >= tabs.length) {
      dispatch(setTabValue(tabs.length - 1));
    }
  }, [tabs, tabValue, dispatch]);
  //
  return (
    <>
      <Paper elevation={3} sx={{ width: '100%', margin: 0, flexGrow: 1, overflow: 'auto' }}>
        <Box sx={{ overflow: 'hidden' }}>
          <AppBar
            position="static"
            color="primary"
            elevation={0}
            sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}
          >
            <MemoizedTabs
              tabs={tabs}
              tabValue={tabValue}
              handleRemoveTab={handleRemoveTab}
              setTabValue={(newValue) => dispatch(setTabValue(newValue))}
              loadingTimer={loadingTimer}
            />                
            <IconButton 
              onClick={handleAddTab}
              size="small" 
              sx={{ 
                ml: 1, 
                '&:hover': { background: 'transparent'} 
              }}
            >
              <AddIcon sx={{ color: 'white' }} />
            </IconButton>
          </AppBar>
        </Box>            
        <Box sx={{           
          height: '91%',
          overflowY: 'auto',
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 2, paddingTop: 2 }}>
            {drawingExternalCode && !loadingTimer && tabs.length > 0 && tabs[tabValue] && (
              <TechnologyBreadcrumbs operationLabel={tabs[tabValue].label} />             
            )}                
          </Box>
          {!isAutocompleteLoaded || loadingTimer ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center', py: 5 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {tabs.length > 0 && tabs[tabValue] ? (
                <TabPanel key={tabs[tabValue].id} value={tabValue} index={tabValue}>
                  <OperationCard
                    content={tabs[tabValue]?.content}
                    onUpdate={handleOperationUpdate}
                    setValidateForm={setValidateFormStable}
                    autocompleteOptions={autocompleteOptions}
                  />
                </TabPanel>
              ) : null}                  
            </Box>
            )
          }
          {tabs.length == 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 2, height: '90%' }}>
              <Typography>Нет открытых вкладок</Typography>
              </Box>
            )
          }          
          <Notifications handleClose={handleClose} open={open} requestStatus={requestStatus} />
        </Box>
        </Paper>
    </>
  );
}

export { OperationsTabPanel };