import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Backdrop,
    Box,
    Breadcrumbs,
    CircularProgress,
    Paper,
    IconButton,
    Skeleton,
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
  setTabs, addTab, removeTab, updateTab, setTabValue, setShouldReloadTabs, selectCurrentItems,
} from '../../../store/slices/technologiesSlice';
import { selectDrawingExternalCode, selectTechnology, setTechnology } from '../../../store/slices/drawingsSlice';
import { selectOperations, fetchData } from '../../../store/slices/lists/operationsListSlice';
import { TechnologySearch } from '../components/TechnologySearch';

function TechnologyTabPanel({ handleClose, open, requestStatus, showLoading }) {
  const dispatch = useDispatch();

  //стейты
  const [autocompleteOptions, setAutocompleteOptions] = useState({});
  const [isAutocompleteLoaded, setIsAutocompleteLoaded] = useState(false);
  const [isUserClosedAllTabs, setIsUserClosedAllTabs] = useState(false);
  const [validateForm, setValidateForm] = useState(() => () => true);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [currentTechnology, setCurrentTechnology] = useState(null);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [newTechnology, setNewTechnology] = useState(null);

  //селекторы
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const { tabs, tabValue, tabCnt, expandedPanelsDefault, shouldReloadTabs } = useSelector((state) => state.technologies);
  const technologiesItems = useSelector(technologiesSelectItems);
  const technologiesLoading = useSelector(technologiesSelectLoading);
  const operationsSelectors = useSelector(selectOperations);
  const operationsItems = operationsSelectors?.items;
  const operationsLoading = operationsSelectors?.loading;
  const selectedIds = useSelector((state) => state.technologies.selectedId);
  const hasUnsavedChanges = useSelector((state) => state.technologies.hasUnsavedChanges);
  const currentItems = useSelector(selectCurrentItems);

  //события

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
    if (!operationsLoading && operationsItems) {
      setAutocompleteOptions(prevState => ({
        ...prevState,
        operations: operationsSelectors
      }));
      setIsAutocompleteLoaded(true); //загрузка items завершена
    }
  }, [operationsItems, operationsLoading]);

  useEffect(() => {
    if (currentItems.length > 0 && currentItems[0]) {
      setCurrentTechnology(currentItems[0]);
      setCurrentOperation(currentItems[1]);
    }
  }, [currentItems]);
  //
  return (
    <>
      <Box sx={{           
        height: '100%',
        overflowY: 'auto'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 2, paddingTop: 2 }}>
          {drawingExternalCode && !showLoading && currentTechnology && currentOperation && (
          <>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="inherit">Чертежи</Typography>
              <Typography color="inherit">{drawingExternalCode}</Typography>
              <Typography color="inherit">Технологии</Typography>
              <Typography color="inherit">{currentTechnology.secondaryLabel} ({currentTechnology.label})</Typography>
              <Typography color="inherit">Операции</Typography>                  
              <Typography sx={{ color: 'text.primary' }}>{currentOperation.secondaryLabel} ({currentOperation.label})</Typography>
            </Breadcrumbs>
          </>
          )}                
        </Box>
        {!isAutocompleteLoaded || showLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center', py: 5 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: 2/*, height: '90%'*/ }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2, width: '500px' }}>
              {<TechnologySearch
                props={{id: "technology-code", name: "newTechnology", placeholder: "Технология"}}
                selectedValue={newTechnology}
                onChange={setNewTechnology}
                /*onChange={(e) => handleOptionSelect('operationCode', e.target.value)}
                selectedValue={localData.formValues.operationCode}
                errorValue={localData.formErrors.operationCode}*/
              />}
            </Box>
          </Box>
          )
        }        
      </Box>
    </>
  );
}

export { TechnologyTabPanel };