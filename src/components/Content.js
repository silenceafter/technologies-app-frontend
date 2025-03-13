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
import { selectDrawingExternalCode, selectTechnology, setTechnology, selectOperation } from '../store/slices/drawingsSlice';
import { setTabs, resetTabs, addTab, removeTab, updateTab, setTabValue, incrementTabCnt, decrementTabCnt } from '../store/slices/operationsTabsSlice';

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
  
  //селекторы
  const hasUnsavedChanges = useSelector((state) => state.unsavedChanges.hasUnsavedChanges);
  const technologiesItems = useSelector(technologiesSelectItems);
  const technologiesLoading = useSelector(technologiesSelectLoading);
  const technologiesErrors = useSelector(technologiesSelectError);
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const currentTechnology = useSelector(selectTechnology);
  const currentOperation = useSelector(selectOperation);

  const { tabs, tabValue, tabCnt, expandedPanelsDefault } = useSelector((state) => state.operationsTabs);

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
        const newTabs = technologiesItems[0].children
        .filter(operation => operation.orderNumber)
        .map(operation => {
          // Ищем существующую вкладку, чтобы сохранить ошибки и состояние панелей
          const existingTab = tabs.find(tab => tab.id === operation.orderNumber);

          return {
            id: operation.orderNumber,
            label: `Операция ${operation.orderNumber}`,
            content: {
              formValues: {
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
              },
              formErrors: existingTab?.content?.formErrors || {}, // Сохраняем ошибки
              expandedPanels: existingTab?.content?.expandedPanels || expandedPanelsDefault, // Сохраняем раскрытые панели
            }
          };
        });

        //
        if (tabs.length === 0) {
          dispatch(setTabs(newTabs));
          dispatch(setTabValue(0)); //первая вкладка активна по умолчанию
        }
      }
  
        // Устанавливаем текущую выбранную технологию
        dispatch(setTechnology({ name: technologiesItems[0].secondaryLabel, code: technologiesItems[0].label }));
    } catch (error) {
      console.error("Ошибка при обработке технологий:", error);
    }
  }, [technologiesLoading, technologiesItems, tabs]);

  useEffect(() => {
    if (tabs.length === 0) {
      dispatch(setTabValue(0)); // или 0, если вкладок нет
    }
  }, [tabs, dispatch]);

  //очистить стейт вкладок/карточек
  useEffect(() => {
    if (!drawingExternalCode) {
      //setTabValue(0);
      //setTabs([]);
    }
  }, [drawingExternalCode]);
  
  //события
  const handleAddTab = useCallback(() => {
    const newTab = {
      id: Date.now().toString(),
      label: `Новая операция ${tabCnt}`,
      content: {
        formValues: {},
        formErrors: {},
        expandedPanels: expandedPanelsDefault,
      }
    };
    dispatch(addTab(newTab));
    dispatch(setTabValue(tabs.length));
  }, [dispatch, tabCnt/*, tabs*/]); 

  const handleRemoveTab = useCallback(
    (id) => {
      dispatch(removeTab(id));
      dispatch(setTabValue(1));
    },
    [dispatch]
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
        handleUpdateTabContent(currentTab.id, newData, validateForm);
      }
    },
    [handleUpdateTabContent, tabValue, tabs, validateForm]
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
        setRequestStatus('success');
      } else {
        setRequestStatus('error');
      }
      setLoading((prev) => ({ ...prev, save: false }));
      //dispatch(setUnsavedChanges(false));
    }, 2000));
  };    

  //Tabs, Tab
  const MemoizedTabs = React.memo(({ tabs, tabValue, handleRemoveTab, setTabValue }) => {
    return (
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
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
            onClick={(e) => console.log(e, tabValue)}
            /*onMouseUp={(e) => handleTabMouseUp(e, tab.id)}*/
          />
        ))}
      </Tabs>
    );
  });

  //вывод
  return (
    <>
    {console.log(tabCnt)}
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
                {/*<Tabs 
                  value={tabValue} 
                  onChange={(e, newValue) => dispatch(setTabValue(newValue))}
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
                          <IconButton
                            size="small"
                            sx={{ marginLeft: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTab(tab.id);
                            }}
                          >
                            <CloseIcon fontSize="small" sx={{color: 'white'}}/>
                          </IconButton>
                        </Box>                      
                      }
                      onClick={(e) => console.log(e, tabValue)}
                      /*onMouseUp={(e) => handleTabMouseUp(e, tab.id)}*/
                 /*   />
                  ))}                
                </Tabs>*/}
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
                {drawingExternalCode && !loadingTimer && (
                  <TechnologyBreadcrumbs />
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
                        setValidateForm={setValidateForm}
                        autocompleteOptions={autocompleteOptions}
                      />
                    </TabPanel>
                  ) : null}
                </Box>
                )
              }
              
              
              
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