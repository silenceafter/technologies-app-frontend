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

import { ButtonGroupPanel } from '../pages/Main/components/ButtonGroupPanel';
import TechnologiesTree from '../pages/Main/components/TechnologiesTree';
import ProductsTree from '../pages/Main/components/ProductsTree';
import { OperationsSearch } from '../pages/Main/components/OperationsSearch';
import { ProfessionsSearch } from '../pages/Main/components/JobsSearch';
import { MeasuringToolsSearch } from '../pages/Main/components/MeasuringToolsSearch';
import { ToolingSearch } from '../pages/Main/components/ToolingSearch';
import { ComponentsSearch } from '../pages/Main/components/ComponentsSearch';
import { MaterialsSearch } from '../pages/Main/components/MaterialsSearch';
import { OperationTabPanel } from '../pages/Main/components/OperationTabPanel';
import { TechnologyTabPanel } from '../pages/Main/components/TechnologyTabPanel';

import { 
  getSavedData as technologiesFetchData,
  clearItems as technologiesSetItems,
  selectCurrentItems
} from '../store/slices/technologiesSlice';
import { setData, setShouldReloadTabs } from '../store/slices/operationsSlice';
import { fetchData, selectTechnologies } from '../store/slices/lists/technologiesListSlice';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Content({ setSmartBackdropActive, showLoading }) {
  const dispatch = useDispatch();
  //объекты
  //стейты  
  const [validateForm, setValidateForm] = useState(() => () => true);
  const [accordionTechnologiesTreeExpanded, setAccordionTechnologiesTreeExpanded] = useState(true);
  const [accordionProductsTreeExpanded, setAccordionProductsTreeExpanded] = useState(false);
  const [accordionTechnologyTabPanelExpanded, setAccordionTechnologyTabPanelExpanded] = useState(false);
  const [accordionOperationTabPanelExpanded, setAccordionOperationTabPanelExpanded] = useState(true);
  const [open, setOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState(false);
  const [loading, setLoading] = useState({ save: false });
  const [currentTechnology, setCurrentTechnology] = useState(null);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [newTechnology, setNewTechnology] = useState(null);
  const [autocompleteOptions, setAutocompleteOptions] = useState({});
  const [isAutocompleteLoaded, setIsAutocompleteLoaded] = useState(false);
  
  //селекторы
  //const hasUnsavedChanges = useSelector((state) => state.unsavedChanges.hasUnsavedChanges);
  const user = useSelector((state) => state.users.user);
  const { tabs } = useSelector((state) => state.operations);
  const currentItems = useSelector(selectCurrentItems);
  const technologiesSelectors = useSelector(selectTechnologies);
  const technologiesItems = technologiesSelectors?.items;
  const technologiesLoading = technologiesSelectors?.loading;

  const bb = useSelector((state) => state.technologies.items);
  
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
  
  const handleSave = async () => {
    //сохранение
    setSmartBackdropActive(true);
    setLoading((prev) => ({ ...prev, save: true }));  
    await new Promise((resolve) => setTimeout(async () => {      
      if (validateForm()) {
        try {
          //обновление
          /*setTimeout(() => {
            setLoadingTimer(false);
          }, 1000);*/

          await dispatch(setData({ user: user, tabs: tabs })).unwrap();
          //dispatch(productsSetItems());
          dispatch(technologiesSetItems()); //очистить компонент технологий
          //dispatch(productsFetchData({limit: 50, page: 1}));
          
          //dispatch(resetTabs());
          dispatch(technologiesFetchData({})); //обновить items в technologiesSlice
          dispatch(setShouldReloadTabs(true));

          handleClose();
          setRequestStatus('success');
          showSnackbar();

          
          
        } catch (error) {
          handleClose();
          setRequestStatus('error');
          showSnackbar();
        }
      } else {
        handleClose();
        setRequestStatus('error');
        showSnackbar();
      }
      setLoading((prev) => ({ ...prev, save: false }));        
    }, 0));
  };

  const showSnackbar = useCallback(() => {
    setTimeout(() => {
      setOpen(true); 
    }, 300);
  }, []);

  //эффекты
  useEffect(() => {
    if (currentItems.length > 0 && currentItems[0]) {
      if (!currentItems[0]) {
        //технология скрыта, операция открыта
        setAccordionTechnologyTabPanelExpanded(false);
        setAccordionOperationTabPanelExpanded(true);
      } else if (!currentItems[1]) {
        //технология открыта, операция скрыта
        setAccordionTechnologyTabPanelExpanded(true);
        setAccordionOperationTabPanelExpanded(false);        
      } else {
        //технология скрыта, операция открыта
        setAccordionTechnologyTabPanelExpanded(false);
        setAccordionOperationTabPanelExpanded(true);
      }
      //
      setCurrentTechnology(currentItems[0]);
      setCurrentOperation(currentItems[1]);
    }
  }, [currentItems]);

  useEffect(() => {
    if (!technologiesLoading && technologiesItems) {
      setAutocompleteOptions(prevState => ({
        ...prevState,
        technologies: technologiesSelectors
      }));
      setIsAutocompleteLoaded(true); //загрузка items завершена
    }
  }, [technologiesItems, technologiesLoading]);

  useEffect(() => {
    dispatch(fetchData({ search: '', limit: 50, page: 1 }));
  }, [dispatch]);
  
  //вывод
  return (
    <>
    {console.log(bb)}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '27%',/*22*/
        height: '705px',
        overflow: 'hidden',
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
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        backgroundColor: 'rgb(245,245,245)',
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
            backgroundColor: 'rgb(245,245,245)',
            borderRadius: 1,          
            boxShadow: 0,
            width: '100%',
            height: '95%',
            overflowY:'hidden'
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
              <TechnologyTabPanel handleClose={handleClose} open={open} requestStatus={requestStatus} showLoading={showLoading} autocompleteOptions={autocompleteOptions}
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
            <AccordionDetails sx={{ padding: 0, overflow: 'auto', maxHeight: '525px', minHeight: '100px' }}>
              <OperationTabPanel handleClose={handleClose} open={open} requestStatus={requestStatus} showLoading={showLoading} />
            </AccordionDetails>
          </Accordion>
        </Box>
        <Box sx={{ paddingTop: 2 }}>
          <ButtonGroupPanel handleSave={handleSave} loading={showLoading} requestStatus={requestStatus} />
        </Box>
      </Box>   
    </>
  );
}

export {Content};