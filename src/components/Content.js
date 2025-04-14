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
import { OperationsTabPanel } from '../pages/Main/components/OperationsTabPanel';

import { 
  getSavedData as technologiesFetchData,
  clearItems as technologiesSetItems
} from '../store/slices/technologiesSlice';
import { setData, setShouldReloadTabs } from '../store/slices/operationsSlice';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Content({ setSmartBackdropActive, showLoading }) {
  const dispatch = useDispatch();
  //объекты
  //стейты  
  const [validateForm, setValidateForm] = useState(() => () => true);
  const [expanded, setExpanded] = useState('panel1');
  const [open, setOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState(false);
  const [loading, setLoading] = useState({ save: false });
  
  //селекторы
  //const hasUnsavedChanges = useSelector((state) => state.unsavedChanges.hasUnsavedChanges);
  const user = useSelector((state) => state.users.user);
  const { tabs } = useSelector((state) => state.operations);
  
  //события
  const handleAccordeonChange = useCallback((panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  }, [setExpanded]);

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
  
  //вывод
  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '27%',/*22*/
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
              {/*<ProductsTree />*/}
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
        }}
      >
        <OperationsTabPanel handleClose={handleClose} open={open} requestStatus={requestStatus} showLoading={showLoading} />
        <Box>
          <ButtonGroupPanel handleSave={handleSave} loading={showLoading} requestStatus={requestStatus} />
        </Box>             
      </Box>
    </>
  );
}

export {Content};