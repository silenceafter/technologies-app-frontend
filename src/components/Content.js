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
import { ProfessionsSearch } from './ProfessionsSearch';
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

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Content() {
  const dispatch = useDispatch();

  //стейты  
  const [operationCards, setOperationCards] = useState([{ id: 1, number: 1}]);//карточки операций, операции

  //селекторы
  const hasUnsavedChanges = useSelector((state) => state.unsavedChanges.hasUnsavedChanges);
  const technologiesItems = useSelector(technologiesSelectItems);
  const technologiesLoading = useSelector(technologiesSelectLoading);
  const technologiesErrors = useSelector(technologiesSelectError);
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const currentTechnology = useSelector(selectTechnology);

  //вкладки
  const [tabs, setTabs] = useState([]); //useState([{ id: 1, label: 'Новая операция'}]);
  const [tabValue, setTabValue] = useState(0);

  //добавить карточку операции в стейт
  const addOperationCard = () => {
    setOperationCards(prevCards => {
      const nextNumber = prevCards.length + 1; // Определяем следующий номер
      return [...prevCards, { id: nextNumber, number: nextNumber }];
    });
  };

  //найти номер следующей карточки
  const findNextNumber = () => {
    let findMaxNumber = Math.max(...operationCards);
    return ++findMaxNumber;
  }
  
  //стейт вкладок/карточек
  useEffect(() => { 
    try {
      if (!technologiesLoading && technologiesItems.length> 0) {
        let cnt = 1;                 
        for(const operation of technologiesItems[0].children) {
          //вкладки
          setTabs((prevOperation) => {
            return [...prevOperation, { id: operation.orderNumber, label: `Операция ${operation.orderNumber}`}];
          });
          cnt = operation.orderNumber + 1;

          //текущая выбранная технология по умолчанию
          dispatch(setTechnology({ name: technologiesItems[0].label, code: technologiesItems[0].secondaryLabel}));
        }

        //добавить новую вкладку
        setTabs((prevOperation) => {
          return [...prevOperation, { id: cnt, label: `Новая операция ${cnt}`}];
        });
      }
    } catch(error) {
    }
  }, [technologiesLoading, technologiesItems]);

  //очистить стейт вкладок/карточек
  useEffect(() => {
    if (!drawingExternalCode) {
      setTabs([]);
    }
  }, [drawingExternalCode]);
 
    


  //список числовых полей (для последующей валидации вместо type="number")
/*  const numericFields = [
    'operationNumber1', 
    'workshopNumber3', 
    'workshopAreaNumber4',
    'workerCategory7',
    'workerConditions8',
    'numberEmployees9',
    'numberProcessedParts10',
    'toilsomeness11'
  ];

  //значения полей формы
  const [formValues, setFormValues] = useState({
    operationNumber1: '',
    operationCode2: '',
    workshopNumber3: '',
    workshopAreaNumber4: '',
    documentName5: '',
    professionCode6: '',
    workerCategory7: '',
    workerConditions8: '',
    numberEmployees9: '',
    numberProcessedParts10: '',
    toilsomeness11: '',
    operationDescription12: '',
    measuringTools13: '',
    tooling14: '',
    components15: '',
    materials16: ''
  });

  //значения ошибок (валидация)
  const [formErrors, setFormErrors] = useState({
    operationNumber1: '',
    operationCode2: '',
    workshopNumber3: '',
    workshopAreaNumber4: '',
    documentName5: '',
    professionCode6: '',
    workerCategory7: '',
    workerConditions8: '',
    numberEmployees9: '',
    numberProcessedParts10: '',
    toilsomeness11: '',
    operationDescription12: '',
    measuringTools13: '',
    tooling14: '',
    components15: '',
    materials16: ''
  });*/

  

  const addTab = () => {
    const newTab = {
      id: tabs.length + 1,
      label: `Новая операция ${tabs.length + 1}`,
    };
    setTabs([...tabs, newTab]);
    setTabValue(tabs.length);
  };

  //проверка формы
  /*const validateForm = () => {
    const errors = {};
    const textFieldMessage = 'Поле обязательно для заполнения';
    const autocompleteTextFieldMessage = 'Выберите значение из списка';

    //operationNumber1
    if (!formValues.operationNumber1) {
      errors.operationNumber1 = textFieldMessage;
    }

    //operationCode2
    if (!formValues.operationCode2) {
      errors.operationCode2 = autocompleteTextFieldMessage;
    }
    
    //workshopNumber3
    if (!formValues.workshopNumber3) {
      errors.workshopNumber3 = textFieldMessage;
    }

    //documentName5
    if (!formValues.documentName5) {
      errors.documentName5 = textFieldMessage;
    }

    //professionCode6
    if (!formValues.professionCode6) {
      errors.professionCode6 = autocompleteTextFieldMessage;
    }

    //workerCategory7
    if (!formValues.workerCategory7) {
      errors.workerCategory7 = textFieldMessage;
    }

    //workerConditions8
    if (!formValues.workerConditions8) {
      errors.workerConditions8 = textFieldMessage;
    }

    //numberEmployees9
    if (!formValues.numberEmployees9) {
      errors.numberEmployees9 = textFieldMessage;
    }

    //numberProcessedParts10
    if (!formValues.numberProcessedParts10) {
      errors.numberProcessedParts10 = textFieldMessage;
    }

    //toilsomeness11
    if (!formValues.toilsomeness11) {
      errors.toilsomeness11 = textFieldMessage;
    }

    //measuringTools13
    if (formValues.measuringTools13.length == 0) {
      errors.measuringTools13 = autocompleteTextFieldMessage;
    }

    //tooling14
    if (formValues.tooling14.length == 0) {
      errors.tooling14 = autocompleteTextFieldMessage;
    }

    //components15
    if (formValues.components15.length == 0) {
      errors.components15 = autocompleteTextFieldMessage;
    }

    //materials16
    if (formValues.materials16.length == 0) {
      errors.materials16 = autocompleteTextFieldMessage;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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

  //autocomplete
  /*const handleOptionSelect = (id, option) => {
    //задать значение в formValues
    const value = option ? option : null;
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [id]: value,
    }));

    //убрать ошибку в formErrors    
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [id]: '',
    }));
  };*/

  //buttonGroup
  const [loading, setLoading] = useState({ save: false });
  const handleSave = async () => {
    setLoading((prev) => ({ ...prev, save: true }));  
    await new Promise((resolve) => setTimeout(() => {
      setOpen(true);
      //validateForm();
      setLoading((prev) => ({ ...prev, save: false }));
      dispatch(setUnsavedChanges(false));
    }, 2000));
  }

  //textField
  /*const handleInputChange = (e) => {
    //значения формы
    const { name, value } = e.target;    
    const errorMessage = numericFields.includes(name) && (value && !/^\d*$/.test(value))
      ? 'Это поле должно содержать только цифры'
      : undefined;
    //
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    dispatch(setUnsavedChanges(true));
  };*/

  const [expanded, setExpanded] = useState('panel1');
  const handleAccordeonChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  }
  //
  return (
    <>
    {console.log(currentTechnology)}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '24rem',
        height: '705px',
        overflow: 'hidden'
        
      }}>
        <Accordion 
          /*expanded={expanded === 'panel1'} 
          onChange={handleAccordeonChange('panel1')}*/
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
            <Box sx={{ height: '100%' }}>
              <TechnologiesTree />
            </Box>              
          </AccordionDetails>
          <AccordionActions>
            <Button sx={{ backgroundColor: 'primary.main', color: 'white' }}>Добавить технологию</Button>
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
                    <Tab key={tab.id} label={tab.label} />
                  ))}                
                </Tabs>
                <IconButton 
                  onClick={addTab}
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                {/*tabs.map((tab, index) => (
                  <TabPanel key={tab.id} value={tabValue} index={index}>
                    <OperationCard operationNumber={tab.id} />
                  </TabPanel>
                ))*/} {/* index + 1 */}
                {
                  tabs.map((tab, index) => (
                    <TabPanel key={tab.id} value={tabValue} index={index}>
                      <OperationCard operationNumber={tab.id} />
                    </TabPanel>
                  ))
                }
                


                
                
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