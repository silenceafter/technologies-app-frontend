import React, { useState, useEffect, useMemo } from 'react';
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
import { TabPanel } from './TabPanel';
import { useDispatch, useSelector } from 'react-redux';
import { setUnsavedChanges } from '../store/slices/unsavedChangesSlice';
import { selectItems as technologiesSelectItems, selectLoading as technologiesSelectLoading, selectError as technologiesSelectError} from '../store/slices/technologiesSlice';
import { selectDrawingExternalCode, selectTechnology, setTechnology } from '../store/slices/drawingsSlice';

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

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Content() {
  const dispatch = useDispatch();

  //объекты
  const expandedPanelsDefault = { 
    parameters: true,
    equipment: true,
    components: true,
    materials: true,
    tooling: true,
    measuringTools: true
  };

  //стейты  
  const [tabs, setTabs] = useState([]); //useState([{ id: 1, label: 'Новая операция'}]);
  const [tabValue, setTabValue] = useState(0);
  const [validateForm, setValidateForm] = useState(() => () => true);
  
  //селекторы
  const hasUnsavedChanges = useSelector((state) => state.unsavedChanges.hasUnsavedChanges);
  const technologiesItems = useSelector(technologiesSelectItems);
  const technologiesLoading = useSelector(technologiesSelectLoading);
  const technologiesErrors = useSelector(technologiesSelectError);
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const currentTechnology = useSelector(selectTechnology);

  const updateTabContent = (tabId, newContent, newValidateForm) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId 
          ? { 
              ...tab, 
              content: /*newContent*/
              {
                ...tab.content,
                formValues: newContent.formValues,
                formErrors: newContent.formErrors || tab.content.formErrors,
                expandedPanels: newContent.expandedPanels || tab.content.expandedPanels,
              }, 
              validateForm: newValidateForm 
            } 
          : tab
      )
    );
  };
  
  //стейт вкладок/карточек
  useEffect(() => {
    try {
      if (!technologiesLoading && technologiesItems.length > 0) {
        setTabs((prevTabs) => {
          // Создаем новые вкладки
          const newTabs = technologiesItems[0].children
            .filter(operation => operation.orderNumber)
            .map(operation => {
              const existingTab = prevTabs.find(tab => tab.id === operation.orderNumber);
              return {
                id: operation.orderNumber,
                label: `Операция ${operation.orderNumber}`,
                content: {
                  formValues: {
                    orderNumber: operation.orderNumber,
                  },
                  formErrors: existingTab?.content?.formErrors || {},
                  expandedPanels: existingTab?.content?.expandedPanels || expandedPanelsDefault,
                }
              };
            });
  
          // Если tabs уже загружены, не обновляем их
          return prevTabs.length === 0 ? newTabs : prevTabs;
        });
  
        // Устанавливаем текущую выбранную технологию
        dispatch(setTechnology({ name: technologiesItems[0].label, code: technologiesItems[0].secondaryLabel }));
      }
    } catch (error) {
      console.error("Ошибка при обработке технологий:", error);
    }
  }, [technologiesLoading, technologiesItems]);
  

  //очистить стейт вкладок/карточек
  useEffect(() => {
    if (!drawingExternalCode) {
      setTabValue(0);
      setTabs([]);
    }
  }, [drawingExternalCode]);
 
  const handleAddTab = () => {
    const maxId = Math.max(...tabs.map((tab) => tab.id), 0);
    const newTab = {
      id: maxId + 1,
      label: `Новая операция ${maxId + 1}`,
      content: {
        formValues: { orderNumber: maxId + 1 },
        formErrors: {},
        expandedPanels: expandedPanelsDefault,
      },
    };
    //
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setTabValue(tabs.length);
  };

  const handleCloseTab = (tabId) => {
    setTabs((prevTabs) => {
      const tabIndex = prevTabs.findIndex((tab) => tab.id === tabId);
      const newTabs = prevTabs.filter((tab) => tab.id !== tabId);
      //
      if (tabValue === tabIndex) {
        //закрытая вкладка была активной
        const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0; //берем предыдущую вкладку, если есть
        setTabValue(newTabs.length > 0 ? newActiveIndex : null);
      } else if (tabValue > tabIndex) {
        //если закрыли вкладку перед активной, уменьшаем tabValue
        setTabValue((prev) => Math.max(prev - 1, 0));
      }  
      return newTabs;
    });
  };

  const handleTabMouseUp = (event, tabId) => {
    if (event.button === 1) {
      handleCloseTab(tabId);
    }
  };

  const handleTabWheelCapture = (event, tabId) => {
    if (event.button === 1) {
      event.preventDefault();  // Блокируем стандартное поведение
      handleCloseTab(tabId);   // Закрываем вкладку
    }
  };

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
      if (validateForm()) {
        setRequestStatus('success');
      } else {
        setRequestStatus('error');
      }  
      setLoading((prev) => ({ ...prev, save: false }));
      //dispatch(setUnsavedChanges(false));
    }, 2000));
  };    

  const [expanded, setExpanded] = useState('panel1');
  const handleAccordeonChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  }  
  //
  return (
    <>
    {console.log(tabs)}
    {console.log(`tabsValue: ${tabValue}`)}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '24rem',
        height: '705px',
        overflow: 'hidden'
        
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
        <Accordion defaultExpanded
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
          backgroundColor: 'background.paper',
          borderRadius: 1,          
          boxShadow: 0,
          width: '90.5rem',
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
                {/*<Tabs value={tabsValue} onChange={handleTabsChange} textColor="inherit">
                  <Tab label="Параметры" />
                  <Tab label="Описание операции" />
                  <Tab label="Измерительный инструмент" />
                  <Tab label="Оснастка" />
                  <Tab label="Комплектующие" />
                  <Tab label="Материалы" />
                </Tabs>*/}
                <Tabs 
                  value={tabValue} 
                  onChange={(e, newValue) => setTabValue(newValue)}
                  variant='scrollable' 
                  scrollButtons='auto' 
                  textColor="inherit"
                  sx={{ maxWidth: '100%', overflow: 'hidden'}}
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
                              handleCloseTab(tab.id);
                            }}
                          >
                            <CloseIcon fontSize="small" sx={{color: 'white'}}/>
                          </IconButton>
                        </Box>                      
                      }
                      /*onMouseUp={(e) => handleTabMouseUp(e, tab.id)}*/
                    />
                  ))}                
                </Tabs>
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
              overflowY: 'auto'
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {tabs.length > 0 && tabs[tabValue] ? (
                  <TabPanel key={tabs[tabValue].id} value={tabValue} index={tabValue}>
                    <OperationCard
                      content={tabs[tabValue]?.content} 
                      onUpdate={(newData) => updateTabContent(tabs[tabValue]?.id, newData)}
                      setValidateForm={setValidateForm}                        
                    />
                  </TabPanel>
                ) : null}
                


                
                
              </Box>
              
              
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