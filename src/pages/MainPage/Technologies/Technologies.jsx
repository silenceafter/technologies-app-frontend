import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  rgbToHex
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { ButtonGroupPanel } from './components/ButtonGroupPanel';
import TechnologiesTree from './components/TechnologiesTree';
import ProductsTree from './components/ProductsTree';
import { OperationTabPanel } from './components/OperationTabPanel';
import { TechnologyTabPanel } from './components/TechnologyTabPanel';

import { 
  getSavedData as technologiesFetchData,
  setData as technologiesSetData,
  selectCurrentItems,
  updateTechnologyFormErrors, updateOperationFormErrors,
} from '../../../store/slices/technologiesSlice';
//import { fetchData, selectTechnologies } from '../../../store/slices/lists/technologiesListSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSnackbar } from 'notistack';

function Technologies({ showLoading }) {
  const dispatch = useDispatch();

  //стейты  
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
  const [isSaving, setIsSaving] = useState(false);
  
  //селекторы
  const hasUnsavedChanges = useSelector((state) => state.technologies.hasUnsavedChanges);
  const user = useSelector((state) => state.users.user);
  const currentItems = useSelector(selectCurrentItems);
  /*const technologiesListSelectors = useSelector(selectTechnologies);
  const technologiesListItems = technologiesListSelectors?.items;
  const technologiesListLoading = technologiesListSelectors?.loading;*/
  const technologiesItems = useSelector((state) => state.technologies.items);
  const drawing = useSelector((state) => state.drawings.drawing);
  const technologiesSaveError = useSelector((state) => state.technologies.setDataError);

  //рефы
  //хуки
  const { enqueueSnackbar } = useSnackbar();

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

  const handleClose = useCallback((reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpen(false);
  }, []);
  
  //сохранение
  const handleSave = async () => {   
    if (!hasUnsavedChanges) {
      enqueueSnackbar(`Сохранение не требуется`, { variant: 'info' });
      return;
    }

    try {
      // Сначала не активируем затемнение, а только через 300мс (для быстрых операций)
      setIsSaving(true);

      const { isValid, technologyErrors, operationErrors } = validateForm(); // валидация
      if (isValid) {      
        //выполняем сохранение
        const result = await dispatch(technologiesSetData({ 
          user: user, 
          technologies: technologiesItems 
        })).unwrap();
        
        if (result) {
          //успешно
          //dispatch(productsSetItems());
          //dispatch(technologiesSetItems()); //очистить компонент технологий
          //dispatch(productsFetchData({limit: 50, page: 1}));            
          dispatch(technologiesFetchData({ drawing: drawing, user: user })); //обновить items в technologiesSlice
          
          //уведомление
          enqueueSnackbar(`Сохранено успешно`, { variant: 'success' });
        } else {
          //ошибка
          enqueueSnackbar(`Ошибка: ${technologiesSaveError}`, { variant: 'error' });
        }   
      } else {
        //обработка ошибок валидации
        if (currentTechnology) {
          dispatch(updateTechnologyFormErrors({ 
            id: currentTechnology.id, 
            formErrors: technologyErrors 
          }));
        }
        if (currentOperation) {
          dispatch(updateOperationFormErrors({ 
            id: currentOperation.id, 
            formErrors: operationErrors 
          }));
        }
        enqueueSnackbar(`Незаполнена форма!`, { variant: 'warning' }); 
      }
    } catch (error) {
      // Очищаем таймаут при ошибке
      enqueueSnackbar(`Ошибка: ${technologiesSaveError}`, { variant: 'error' });
    } finally {  
      // Убедимся, что устанавливаем состояние только если компонент всё ещё смонтирован
      setIsSaving(false);
      handleClose();
    }
  };

  //эффекты
  useEffect(() => {
    if (drawing) {
      dispatch(technologiesFetchData({ drawing: drawing, user: user }));
    }
  }, [drawing]);

  useEffect(() => {
    if (!currentItems) { return; }
    /*if (!currentItems[0]) { return; }*/
    try {
      setCurrentTechnology(currentItems[0] ? currentItems[0] : null);
      setCurrentOperation(currentItems[1] ? currentItems[1] : null);
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

  /*useEffect(() => {
    if (!technologiesListLoading && technologiesListItems) {
      setAutocompleteOptions(prevState => ({
        ...prevState,
        technologies: technologiesListSelectors
      }));
      setIsAutocompleteLoaded(true); //загрузка items завершена
    }
  }, [technologiesListItems, technologiesListLoading]);*/
  
  useEffect(() => {
    if (showLoading) {
      showLoading(isSaving);
    }
  }, [isSaving, showLoading]);

  useEffect(() => {
    return () => {
      // Просто сбрасываем состояние при размонтировании
      setIsSaving(false);
    };
  }, []);

  //валидация
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
    }*/

    //materialCode
    if (operationFormValues.materialCode && Array.isArray(operationFormValues.materialCode) && operationFormValues.materialCode.length > 0) {
      //operationErrors.materialCode = autocompleteTextFieldMessage;
      // Создаем объект ошибок с ID материалов
      const massErrors = {};
      let hasMassErrors = false;
      
      operationFormValues.materialCode.forEach(material => {
        // Используем ID материала как ключ
        const materialId = material.id || material.cnt;
        
        if (!material.mass || material.mass === '') {
          massErrors[materialId] = 'Укажите массу';
          hasMassErrors = true;
        } else {
          // Сохраняем существующую ошибку валидации, если она есть
          const existingError = formErrors?.materials?.masses?.[materialId];
          if (existingError) {
            massErrors[materialId] = existingError;
            hasMassErrors = true;
          } else {
            massErrors[materialId] = null;
          }
        }
      });
      
      if (hasMassErrors) {
        if (!operationErrors.materials) {
          operationErrors.materials = { masses: massErrors };
        } else {
          operationErrors.materials.masses = massErrors;
        }
      }
    }

    //componentCode
    if (operationFormValues.componentCode && Array.isArray(operationFormValues.componentCode) && operationFormValues.componentCode.length > 0) {
      // Создаем объект ошибок с ID материалов
      const quantityErrors = {};
      let hasQuantityErrors = false;
      
      operationFormValues.componentCode.forEach(component => {
        // Используем ID материала как ключ
        const componentId = component.id || component.cnt;
        
        if (!component.quantity || component.quantity === '') {
          quantityErrors[componentId] = 'Укажите количество';
          hasQuantityErrors = true;
        } else {
          // Сохраняем существующую ошибку валидации, если она есть
          const existingError = formErrors?.components?.quantity?.[componentId];
          if (existingError) {
            quantityErrors[componentId] = existingError;
            hasQuantityErrors = true;
          } else {
            quantityErrors[componentId] = null;
          }
        }
      });
      
      if (hasQuantityErrors) {
        if (!operationErrors.components) {
          operationErrors.components = { quantity: quantityErrors };
        } else {
          operationErrors.components.quantity = quantityErrors;
        }
      }
    }
    return { 
      isValid: Object.keys(technologyErrors).length === 0 && Object.keys(operationErrors).length === 0, 
      technologyErrors,
      operationErrors
    };
  };

  //вывод
  return (
    <>
    {/*console.log(operationFormValues)*/}
      <Box sx={{
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
            expandIcon={<ExpandMoreIcon sx={{ color: 'white'}} />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{ backgroundColor: "primary.main", }}
          >
            <Typography component="span">Список технологий</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0, overflow: 'auto', minHeight: '360px', maxHeight: '525px', color: 'black', marginLeft: 2, marginTop: 2, paddingBottom: 0, /*border: '1px solid rgba(0, 0, 0, 0.12)'*/ }}>
            <Box sx={{ height: '100%', minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
              <TechnologiesTree />
            </Box>              
          </AccordionDetails>          
        </Accordion>

        <Accordion defaultExpanded
          expanded={accordionProductsTreeExpanded}
          onChange={handleAccordeonProductsTreeChange}
          elevation={3} 
          sx={{ bgcolor: 'white', color: 'white', width: '100%', overflow: 'hidden', flexShrink: 0 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'white'}} />}
            aria-controls="panel2-content"
            id="panel2-header"
            sx={{ backgroundColor: 'primary.main' }}
          >
            <Typography component="span">Изделия</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0, overflow: 'auto', maxHeight: '573px', minHeight: '100px', color: 'black', marginLeft: 2, marginTop: 2, }}>
            <Box sx={{ height: '100%', minHeight: '360px', display: 'flex', flexDirection: 'column', }}>
              <ProductsTree />
            </Box>
          </AccordionDetails>          
        </Accordion>
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        alignItems: 'flex-start',
        backgroundColor: 'rgb(234, 239, 241)',
        borderRadius: 1,          
        boxShadow: 0,
        width: '100%',
        /*height: '100%',*/
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
              expandIcon={<ExpandMoreIcon sx={{ color: 'white'}} />}
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
              <TechnologyTabPanel showLoading={showLoading} isAutocompleteLoaded={isAutocompleteLoaded} />
            </AccordionDetails>        
          </Accordion>

          <Accordion defaultExpanded
            expanded={accordionOperationTabPanelExpanded}
            onChange={handleAccordeonOperationTabPanelChange}
            elevation={3} 
            sx={{ bgcolor: 'white', color: 'white', width: '100%', overflow: 'hidden', flexShrink: 0 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white'}} />}
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
              <OperationTabPanel showLoading={showLoading} />
            </AccordionDetails>
          </Accordion>
        </Box>
        
        {<Box sx={{ paddingTop: 2, }}>
          <ButtonGroupPanel handleSave={handleSave} loading={showLoading} isDisabled={!drawing} />
        </Box>}
      </Box>
      
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 10,
          /*transition: 'opacity 300ms'*/
        }}
        open={isSaving}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

export {Technologies};