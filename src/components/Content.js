import React, { useState, useEffect, useMemo, useContext, createContext, useCallback } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Divider, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import { ButtonGroup, Tabs, Tab } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import TechnologiesTree from './TechnologiesTree';
import ProductsTree from './ProductsTree';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { OperationsSearch } from './OperationsSearch';
import { ProfessionsSearch } from './JobsSearch';
import { MeasuringToolsSearch } from './MeasuringToolsSearch';
import { ToolingSearch } from './ToolingSearch';
import { ComponentsSearch } from './ComponentsSearch';
import { MaterialsSearch } from './MaterialsSearch';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { MemoizedTabPanel as TabPanel } from './TabPanel';
import { useDispatch, useSelector } from 'react-redux';
import { setUnsavedChanges } from '../store/slices/unsavedChangesSlice';
import { selectItems as technologiesSelectItems, selectLoading as technologiesSelectLoading, selectError as technologiesSelectError} from '../store/slices/technologiesSlice';
import { selectDrawingExternalCode, selectTechnology, setTechnology, setOperation, selectOperation } from '../store/slices/drawingsSlice';
import { setTabs, resetTabs, addTab, removeTab, updateTab, setTabValue, incrementTabCnt, decrementTabCnt, incrementTabValue, setData } from '../store/slices/operationsTabsSlice';

import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { OperationCard } from './OperationCard';
import CloseIcon from "@mui/icons-material/Close";
import { selectOperations, fetchData } from '../store/slices/operationsSlice';
import CircularProgress from '@mui/material/CircularProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { TechnologyBreadcrumbs } from './TechnologyBreadcrumbs';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Content() {
  const dispatch = useDispatch();

  //объекты
  //стейты  
  const [validateForm, setValidateForm] = useState(() => () => true);
  const [autocompleteOptions, setAutocompleteOptions] = useState({});
  const [isAutocompleteLoaded, setIsAutocompleteLoaded] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [expanded, setExpanded] = useState('panel1');
  const [currentOperationSelectedItemId, setCurrentOperationSelectedItemId] = useState(null);
  const [isUserClosedAllTabs, setIsUserClosedAllTabs] = useState(false);
  
  //селекторы
  const hasUnsavedChanges = useSelector((state) => state.unsavedChanges.hasUnsavedChanges);
  const technologiesItems = useSelector(technologiesSelectItems);
  const technologiesLoading = useSelector(technologiesSelectLoading);
  const technologiesErrors = useSelector(technologiesSelectError);
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const currentTechnology = useSelector(selectTechnology);
  const currentOperation = useSelector(selectOperation);
  const operationSelectedItemId = useSelector((state) => state.technologies.selectedItemId);

  const { tabs, tabValue, tabCnt, expandedPanelsDefault } = useSelector((state) => state.operationsTabs);
  const bb = useSelector((state) => state.operationsTabs.validateForm);

  const operationsSelectors = useSelector(selectOperations);
  const operationsItems = operationsSelectors?.items;
  const operationsLoading = operationsSelectors?.loading;

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
      if (!technologiesLoading && technologiesItems.length > 0) {
        if (tabs.length === 0 && !isUserClosedAllTabs) {
          //изначально вкладки создаются из technologiesItems 
          const newTabs = technologiesItems[0].children
            .filter(operation => operation.orderNumber)
            .map(operation => {
              // Ищем существующую вкладку, чтобы сохранить ошибки и состояние панелей
              const existingTab = tabs.find(tab => tab.id === operation.orderNumber);
              const data = {
                orderNumber: operation.orderNumber,
                operationDescription: operation.operationDescription,
                shopNumber: operation.shopNumber,
                areaNumber: operation.areaNumber,
                document: operation.document,
                grade: operation.grade,
                workingConditions: operation.workingConditions,
                numberOfWorkers: operation.numberOfWorkers,
                numberOfProcessedParts: operation.numberOfProcessedParts,
                laborEffort: operation.laborEffort,
                jobCode: { code: operation.jobCode, name: operation.jobName },
                operationCode: { code: operation.label, name: operation.secondaryLabel, cnt: operation.labelId },
              };
              //
              return {
                id: operation.orderNumber,
                label: `${operation.secondaryLabel} (${operation.label})`,/*`Операция ${operation.orderNumber}`,*/
                content: {
                  dbValues: data,
                  formValues: data,
                  formErrors: existingTab?.content?.formErrors || {}, // Сохраняем ошибки
                  changedValues: existingTab?.content?.changedValues || {}, //реквизиты, в которых были изменения
                  expandedPanels: existingTab?.content?.expandedPanels || expandedPanelsDefault, // Сохраняем раскрытые панели                                    
                }
              };
            }
          );
          //
          dispatch(setTabs(newTabs));
          dispatch(setTabValue(0)); //первая вкладка активна по умолчанию
        }
      }
  
      // Устанавливаем текущую выбранную технологию
      dispatch(setTechnology({ name: technologiesItems[0].secondaryLabel, code: technologiesItems[0].label }));
    } catch (error) {
      console.error("Ошибка при обработке технологий:", error);
    }
  }, [technologiesLoading, technologiesItems, tabs, isUserClosedAllTabs]);

  /*useEffect(() => {
    if (tabs.length === 0) {
      dispatch(setTabValue(0)); // или 0, если вкладок нет
    }
  }, [tabs, dispatch]);*/

  //очистить стейт вкладок/карточек
  useEffect(() => {
    if (!drawingExternalCode) {
      //setTabValue(0);
      //setTabs([]);
    }
  }, [drawingExternalCode]);

  //следим за текущей выбранной операцией
  useEffect(() => {
    if (!technologiesLoading && technologiesItems.length > 0) {
      //поиск технологии
      //if (technologiesItems.id == operationSelectedItemId) {
        
      //}
    }
    

    //для null
    /*if (currentOperationSelectedItemId == null) {
      setCurrentOperationSelectedItemId(operationSelectedItemId);
      return;
    }
    //
    if (operationSelectedItemId != currentOperationSelectedItemId) {
      setCurrentOperationSelectedItemId(operationSelectedItemId);

      //закрыть открытые вкладки операций   
    }*/
  }, [operationSelectedItemId]);

  //корректируем tabValue для того, чтобы сохранялась активная вкладка при удалении других вкладок
  useEffect(() => {
    if (tabValue >= tabs.length) {
      dispatch(setTabValue(tabs.length - 1));
    }
  }, [tabs, tabValue, dispatch]);
  
  //события
  const handleAddTab = useCallback(() => {
    const newTab = {
      id: tabCnt,
      label: `Новая операция ${tabCnt}`,
      content: {
        dbValues: {},
        formValues: {},
        formErrors: {},
        changedValues: {},
        expandedPanels: expandedPanelsDefault,                
      }
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

  const handleAccordeonChange = useCallback((panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  }, [setExpanded]);

  /*const handleTabMouseUp = (event, tabId) => {
    if (event.button === 1) {
      handleCloseTab(tabId);
    }
  };

  const handleTabWheelCapture = (event, tabId) => {
    if (event.button === 1) {
      event.preventDefault();  // Блокируем стандартное поведение
      handleCloseTab(tabId);   // Закрываем вкладку
    }
  };*/

  //отправка
  const handleSuccess = () => {
    setRequestStatus('success');
    setOpen(true);
  };

  // Функция, имитирующая ошибку отправки
  const handleError = () => {
    setRequestStatus('error');
    setOpen(true);
  };

  //alert
  const [open, setOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState(false);
  const handleClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  //buttonGroup
  const [loading, setLoading] = useState({ save: false });
  /*const handleSave = async () => {
    setLoading((prev) => ({ ...prev, save: true }));  
    await new Promise((resolve) => setTimeout(() => {
      setOpen(true);
      //validateForm();
      setLoading((prev) => ({ ...prev, save: false }));
      //dispatch(setUnsavedChanges(false));
    }, 2000));
  }*/

  const handleSave = async () => {
    //сохранение
    setLoading((prev) => ({ ...prev, save: true }));  
    await new Promise((resolve) => setTimeout(() => {
      setOpen(true);
      //dispatch(toggleValidateFormInSlice());      
      if (validateForm()) {
        dispatch(setData(tabs[tabValue]?.content));
        setRequestStatus('success');         
      } else {
        setRequestStatus('error');
      }
      setLoading((prev) => ({ ...prev, save: false }));
      //dispatch(setUnsavedChanges(false));
    }, 500));
  };    

  //Tabs, Tab
  const MemoizedTabs = React.memo(({ tabs, tabValue, handleRemoveTab, setTabValue }) => {
    return (
      <Tabs
        value={tabValue}
        onChange={(event, newValue) => setTabValue(newValue)}
        variant='scrollable'
        scrollButtons='auto'
        textColor="inherit"
        sx={{ maxWidth: '100%', overflow: 'hidden' }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.id}
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {tab.label}
                {loadingTimer && <CircularProgress size={20} color="inherit" />}
                <IconButton
                  size="small"
                  sx={{ marginLeft: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTab(tab.id);
                  }}
                >
                  <CloseIcon fontSize="small" sx={{ color: 'white' }} />
                </IconButton>
              </Box>
            }
            /*onMouseUp={(e) => handleTabMouseUp(e, tab.id)}*/
          />
        ))}
      </Tabs>
    );
  }, 
  /*(prevProps, nextProps) => {
    return prevProps.tabs === nextProps.tabs && prevProps.tabValue === nextProps.tabValue;
  }*/
  );

  //вывод
  return (
    <>
      {console.log(tabs[tabValue]?.content)}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '22%',/*24rem*/
        height: '705px',
        overflow: 'hidden',
      }}>
        <Accordion defaultExpanded
          expanded={expanded === 'panel1'} 
          onChange={handleAccordeonChange('panel1')}
          elevation={3} 
          sx={{ bgcolor: 'white', color: 'white', width: '100%', overflow: 'hidden', flexShrink: 0 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{ backgroundColor: 'primary.main' }}
          >
            <Typography component="span">Технологии и операции</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0, overflow: 'auto', maxHeight: '525px' }}>
            <Box sx={{ height: '100%' /*, display: 'flex', flexDirection: 'column', gap: 2*/ }}>
              <TechnologiesTree />
            </Box>              
          </AccordionDetails>
          <AccordionActions>
            {/*<Button
              sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                Добавить технологию
            </Button>*/}
          </AccordionActions>
        </Accordion>
        <Accordion /*defaultExpanded*/ expanded={false}
          /*expanded={expanded === 'panel2'} 
          onChange={handleAccordeonChange('panel2')}*/
          elevation={3} 
          sx={{ bgcolor: 'white', color: 'white', width: '100%', overflow: 'hidden', flexShrink: 0 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2-content"
            id="panel2-header"
            sx={{ backgroundColor: 'primary.main' }}
          >
            <Typography component="span">Изделия</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0, overflow: 'auto', maxHeight: '573px', minHeight: '100px' }}>
            <Box sx={{ height: 'auto' }}>
              <ProductsTree />
            </Box>
          </AccordionDetails>          
        </Accordion>
      </Box>
      <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 2,                   
          padding: 0,
          paddingBottom: 0,
          paddingRight: 0,
          backgroundColor: 'rgb(245,245,245)',
          borderRadius: 1,          
          boxShadow: 0,
          width: '100%',/*90.5rem*/
          height: '100%',
        }}>
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
                        onUpdate={handleOperationUpdate/*(newData) => handleUpdateTabContent(tabs[tabValue]?.id, newData, validateForm)*/}
                        setValidateForm={setValidateFormStable}
                        autocompleteOptions={autocompleteOptions}
                      />
                    </TabPanel>
                  ) : null}                  
                </Box>
                )
              }
              {tabs.length == 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center',/* alignItems: 'center',*/ margin: 2, height: '90%' }}>
                    <Typography>Нет открытых вкладок</Typography>
                    </Box>
                  )}
              
              
              {/* уведомления */}
              <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} //нижний правый угол
              >
                <Alert
                  onClose={handleClose}
                  severity={requestStatus === 'success' ? 'success' : 'error'}
                  variant="filled"
                  sx={{ width: '100%' }}
                >
                  {requestStatus === 'success' ? 'Успешно сохранено!' : 'Ошибка при отправке!'}
                </Alert>
              </Snackbar>
            </Box>
          </Paper>    
          <Box>
            <ButtonGroup variant="contained" aria-label="Loading button group">
              <LoadingButton loading={loading.save} onClick={handleSave}>Сохранить</LoadingButton>
              <Button>Предварительный просмотр</Button>
              <Button>Печать</Button>
              <LoadingButton>Экспорт в CSV</LoadingButton>
              <LoadingButton>Экспорт в XLSX</LoadingButton>
            </ButtonGroup>
          </Box>             
        </Box>
    </>
  );
}

export {Content};