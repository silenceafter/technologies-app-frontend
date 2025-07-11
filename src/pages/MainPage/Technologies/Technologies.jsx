import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Accordion, 
  AccordionActions, 
  AccordionSummary, 
  AccordionDetails, 
  AppBar, 
  Backdrop,
  Box, 
  Button, 
  ButtonGroup, 
  CircularProgress, 
  IconButton, 
  Paper, 
  Tabs, 
  Tab, 
  Typography, 
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';

import { ButtonGroupPanel } from './components/ButtonGroupPanel';
import TechnologiesTree from './components/TechnologiesTree';
import ProductsTree from './components/ProductsTree';
import { OperationsSearch } from './components/OperationsSearch';
import { ProfessionsSearch } from './components/JobsSearch';
import { MeasuringToolsSearch } from './components/MeasuringToolsSearch';
import { ToolingSearch } from './components/ToolingSearch';
import { ComponentsSearch } from './components/ComponentsSearch';
import { MaterialsSearch } from './components/MaterialsSearch';
import { OperationTabPanel } from './components/OperationTabPanel';
import { TechnologyTabPanel } from './components/TechnologyTabPanel';

import { 
  getSavedData as technologiesFetchData,
  /*clearItems as technologiesSetItems,*/
  selectCurrentItems,
  updateOperation, updateTechnologyFormErrors, updateOperationFormErrors
} from '../../../store/slices/technologiesSlice';
import { setData, setShouldReloadTabs } from '../../../store/slices/operationsSlice';
import { fetchData, selectTechnologies } from '../../../store/slices/lists/technologiesListSlice';
import { selectDrawingExternalCode } from '../../../store/slices/drawingsSlice';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { setStatus } from '../../../store/slices/notificationsSlice';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Technologies({ setSmartBackdropActive, showLoading }) {
  const dispatch = useDispatch();
  //объекты
  //стейты  
  //const [validateForm, setValidateForm] = useState(() => () => false);
  const [accordionTechnologiesTreeExpanded, setAccordionTechnologiesTreeExpanded] = useState(true);
  const [accordionProductsTreeExpanded, setAccordionProductsTreeExpanded] = useState(true);
  const [accordionTechnologyTabPanelExpanded, setAccordionTechnologyTabPanelExpanded] = useState(true);
  const [accordionOperationTabPanelExpanded, setAccordionOperationTabPanelExpanded] = useState(true);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState({ save: false });
  const [currentTechnology, setCurrentTechnology] = useState(null);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [newTechnology, setNewTechnology] = useState(null);
  const [autocompleteOptions, setAutocompleteOptions] = useState({});
  const [isAutocompleteLoaded, setIsAutocompleteLoaded] = useState(true);//false
  const [technologyFormValues, setTechnologyFormValues] = useState([]);
  const [technologyFormErrors, setTechnologyFormErrors] = useState([]);
  const [operationFormValues, setOperationFormValues] = useState([]);
  const [operationFormErrors, setOperationFormErrors] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [formErrors, setFormErrors] = useState(false);
  
  //селекторы
  const hasUnsavedChanges = useSelector((state) => state.technologies.hasUnsavedChanges);
  const user = useSelector((state) => state.users.user);
  //const { tabs } = useSelector((state) => state.operations);
  const currentItems = useSelector(selectCurrentItems);
  const technologiesListSelectors = useSelector(selectTechnologies);
  const technologiesListItems = technologiesListSelectors?.items;
  const technologiesListLoading = technologiesListSelectors?.loading;
  const technologiesItems = useSelector((state) => state.technologies.items);
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const drawing = useSelector((state) => state.drawings.drawing);
  const dbResponse = useSelector((state) => state.operations.response);
  
  //события
  const handleAccordeonTechnologiesTreeChange = () => {
    setAccordionTechnologiesTreeExpanded(!accordionTechnologiesTreeExpanded);
  };
  const handleAccordeonProductsTreeChange = () => {
    setAccordionProductsTreeExpanded(!accordionProductsTreeExpanded);
  };
  const handleAccordeonTechnologyTabPanelChange = () => {
    setAccordionTechnologyTabPanelExpanded(!accordionTechnologyTabPanelExpanded);
  };
  const handleAccordeonOperationTabPanelChange = () => {
    setAccordionOperationTabPanelExpanded(!accordionOperationTabPanelExpanded);
  };

  const validateForm = () => {
    if (!technologyFormValues || !operationFormValues) { return { isValid: false, technologyErrors: [], operationErrors: [] }; }
    const technologyErrors = {};
    const operationErrors = {};
    const textFieldMessage = 'Поле обязательно для заполнения';
    const autocompleteTextFieldMessage = 'Выберите значение из списка';

    //технология
    if (!technologyFormValues.prefix && currentTechnology.content.isNewRecord && !currentTechnology.content.isDeleted) {
      technologyErrors.prefix = autocompleteTextFieldMessage;
    }

    //операция
    //orderNumber
    if (!operationFormValues.orderNumber) {
      operationErrors.orderNumber = textFieldMessage;
    }

    //operationCode
    if (!operationFormValues.operationCode) {
      operationErrors.operationCode = autocompleteTextFieldMessage;
    }
    
    //shopNumber
    if (!operationFormValues.shopNumber) {
      operationErrors.shopNumber = textFieldMessage;
    }

    //document
    if (!operationFormValues.document) {
      operationErrors.document = textFieldMessage;
    }

    //jobCode
    if (!operationFormValues.jobCode) {
      operationErrors.jobCode = autocompleteTextFieldMessage;
    }

    //grade
    if (!operationFormValues.grade) {
      operationErrors.grade = textFieldMessage;
    }

    //workingConditions
    if (!operationFormValues.workingConditions) {
      operationErrors.workingConditions = textFieldMessage;
    }

    //numberOfWorkers
    if (!operationFormValues.numberOfWorkers) {
      operationErrors.numberOfWorkers = textFieldMessage;
    }

    //numberOfProcessedParts
    if (!operationFormValues.numberOfProcessedParts) {
      operationErrors.numberOfProcessedParts = textFieldMessage;
    }

    //laborEffort
    if (!operationFormValues.laborEffort) {
      operationErrors.laborEffort = textFieldMessage;
    }

    //equipmentCode
    /*if (operationFormValues.equipmentCode) {
      if (operationFormValues.equipmentCode.length == 0) {
        operationErrors.equipmentCode = autocompleteTextFieldMessage;
      }      
    }

    //toolingCode
    if (operationFormValues.toolingCode) {
      if (operationFormValues.toolingCode.length == 0) {
        operationErrors.toolingCode = autocompleteTextFieldMessage;
      }
    }*/

    //components
    /*if (!operationFormValues.components) {
      operationErrors.components = autocompleteTextFieldMessage;
    }

    //materials
    if (!operationFormValues.materials) {
      operationErrors.materials = autocompleteTextFieldMessage;
    }

    //measuringTools
    if (!operationFormValues.measuringTools) {
      operationErrors.measuringTools = autocompleteTextFieldMessage;
    }*/
    return { 
      isValid: Object.keys(technologyErrors).length === 0 && Object.keys(operationErrors).length === 0, 
      technologyErrors,
      operationErrors
    };
  };

  const handleClose = useCallback((reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpen(false);
  }, []);
  
  const handleSave = async () => {   
    if (!hasUnsavedChanges) {
      //сохранение не требуется
      dispatch(setStatus({ statusValue: 'info', responseValue: dbResponse }));//setRequestStatus('info');
      showSnackbar();
      return;
    }

    //сохранение
    setSmartBackdropActive(true);
    setLoading((prev) => ({ ...prev, save: true }));
    const { isValid, technologyErrors, operationErrors } = validateForm(); // валидация     
    if (isValid) {
      try {
        //обновление
        const result = await dispatch(setData({ user: user, technologies: technologiesItems })).unwrap();
        if (result) {
          //успешно
          //dispatch(productsSetItems());
          //dispatch(technologiesSetItems()); //очистить компонент технологий
          //dispatch(productsFetchData({limit: 50, page: 1}));            
          //dispatch(resetTabs());
          dispatch(technologiesFetchData({ externalCode: drawingExternalCode, user: user })); //обновить items в technologiesSlice
          //
          dispatch(setStatus({ statusValue: 'success', responseValue: dbResponse }));//setStatusMessage('success');
        } else {
          //ошибка
          dispatch(setStatus({ statusValue: 'error', responseValue: dbResponse }));//setStatusMessage('error');
        }
      } catch (error) {
        dispatch(setStatus({ statusValue: 'error', responseValue: dbResponse }));//setStatusMessage('error');          
      } finally {
        handleClose();
        showSnackbar();
      }
    } else {
      //обновить ошибки в redux
      if (currentTechnology) {
        dispatch(updateTechnologyFormErrors({ id: currentTechnology.id, formErrors: technologyErrors }));
      }
      if (currentOperation) {
        dispatch(updateOperationFormErrors({ id: currentOperation.id, formErrors: operationErrors }));
      }
      //
      handleClose();
      dispatch(setStatus({ statusValue: 'warning', responseValue: dbResponse }));//setRequestStatus('warning');
      showSnackbar();
    }
    setLoading((prev) => ({ ...prev, save: false }));
    setSmartBackdropActive(false);
  };

  const showSnackbar = useCallback(() => {
    setTimeout(() => {
      setOpen(true); 
    }, 300);
  }, []);

  //эффекты
  useEffect(() => {
    if (drawing) {
      dispatch(technologiesFetchData({ drawing: drawing, user: user }));
    }
  }, [drawing]);

  useEffect(() => {
    if (!currentItems) { return; }
    if (!currentItems[0]) { return; }
    try {
      setCurrentTechnology(currentItems[0]);
      setCurrentOperation(currentItems[1]);
    } catch (e) {
      console.error('Ошибка при получении данных из хранилища', e);
    }
  }, [currentItems]);

  useEffect(() => {
    if (currentTechnology) {
      setTechnologyFormValues(currentTechnology.content.formValues);
      setTechnologyFormErrors(currentTechnology.content.formErrors);
    }
    if (currentOperation) {
      setOperationFormValues(currentOperation.content.formValues);
      setOperationFormErrors(currentOperation.content.formErrors);
    }
  }, [currentTechnology, currentOperation]);

  useEffect(() => {
    if (!technologiesListLoading && technologiesListItems) {
      setAutocompleteOptions(prevState => ({
        ...prevState,
        technologies: technologiesListSelectors
      }));
      setIsAutocompleteLoaded(true); //загрузка items завершена
    }
  }, [technologiesListItems, technologiesListLoading]);
  
  //вывод
  return (
    <>
    {console.log(currentTechnology)}
      {drawingExternalCode && <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        height: '100%',
        width: '35%', /*27*/
      }}>
        <Accordion defaultExpanded
          expanded={accordionTechnologiesTreeExpanded}
          onChange={handleAccordeonTechnologiesTreeChange}
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
          <AccordionDetails sx={{ padding: 0, overflow: 'auto', maxHeight: '525px', color: 'black', marginLeft: 2, marginTop: 2, /*border: '1px solid rgba(0, 0, 0, 0.12)'*/ }}>
            <Box sx={{ height: '100%', /*, display: 'flex', flexDirection: 'column', gap: 2*/ }}>
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
        <Accordion /*defaultExpanded*/ 
          expanded={false}
          onChange={handleAccordeonProductsTreeChange}
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
              {/*<ProductsTree />*/}
            </Box>
          </AccordionDetails>          
        </Accordion>
      </Box>}
      {drawingExternalCode && <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        alignItems: 'flex-start',
        backgroundColor: 'rgb(234, 239, 241)',
        borderRadius: 1,          
        boxShadow: 0,
        width: '100%',
        height: '100%',
        overflowY:'hidden'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            backgroundColor: 'rgb(234, 239, 241)',
            borderRadius: 1,          
            boxShadow: 0,
            width: '100%',
            height: '95%',
            overflowY:'hidden',
          }}
        >
          <Accordion defaultExpanded
            expanded={accordionTechnologyTabPanelExpanded}
            onChange={handleAccordeonTechnologyTabPanelChange}
            elevation={3} 
            sx={{ bgcolor: 'white', color: 'white', width: '100%', overflow: 'hidden', flexShrink: 0 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
              sx={{ backgroundColor: 'primary.main' }}
            >
              {currentTechnology ? (
                <Typography component="span">Технология: {currentTechnology.secondaryLabel} ({currentTechnology.label})</Typography>  
              ) : (
                <Typography component="span">Технология</Typography>  
              )}
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0, overflow: 'auto', maxHeight: '573px', minHeight: '100px' }}>
              <TechnologyTabPanel handleClose={handleClose} showLoading={showLoading} autocompleteOptions={autocompleteOptions}
              isAutocompleteLoaded={isAutocompleteLoaded} />
            </AccordionDetails>        
          </Accordion>
          <Accordion defaultExpanded
            expanded={accordionOperationTabPanelExpanded}
            onChange={handleAccordeonOperationTabPanelChange}
            elevation={3} 
            sx={{ bgcolor: 'white', color: 'white', width: '100%', overflow: 'hidden', flexShrink: 0 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel4-content"
              id="panel4-header"
              sx={{ backgroundColor: 'primary.main' }}
            >
              {currentOperation ? (
                <Typography component="span">Операция: {currentOperation.secondaryLabel} ({currentOperation.label})</Typography>
              ) : (
                <Typography component="span">Операция</Typography>
              )}
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0, overflow: 'auto', /*maxHeight: '525px', minHeight: '100px'*/ }}>
              <OperationTabPanel handleClose={handleClose} open={open} showLoading={showLoading} />
            </AccordionDetails>
          </Accordion>
        </Box>
        {<Box sx={{ paddingTop: 2, }}>
          <ButtonGroupPanel handleSave={handleSave} loading={showLoading} />
        </Box>}
      </Box>}
    </>
  );
}

export {Technologies};