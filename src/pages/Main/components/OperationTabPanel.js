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
  setTabs, updateOperation, setTabValue, setShouldReloadTabs, selectCurrentItems,
} from '../../../store/slices/technologiesSlice';
import { selectDrawingExternalCode } from '../../../store/slices/drawingsSlice';
import { selectOperations, fetchData } from '../../../store/slices/lists/operationsListSlice';
import { selectJobs, fetchData as jobsFetchData } from '../../../store/slices/lists/jobsListSlice';
import { selectEquipment, fetchData as equipmentFetchData } from '../../../store/slices/lists/equipmentListSlice';

function OperationTabPanel({ handleClose, open, showLoading }) {
  const dispatch = useDispatch();

  //стейты
  const [autocompleteOptions, setAutocompleteOptions] = useState({});
  const [isAutocompleteLoaded, setIsAutocompleteLoaded] = useState(false);
  const [isUserClosedAllTabs, setIsUserClosedAllTabs] = useState(false);
  //const [validateForm, setValidateForm] = useState(() => () => true);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [currentTechnology, setCurrentTechnology] = useState(null);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [expanded, setExpanded] = useState('panel1');

  //селекторы
  //const currentTechnology = useSelector(selectTechnology);
  const drawingExternalCode = useSelector(selectDrawingExternalCode);
  const { tabs, tabValue, tabCnt, expandedPanelsDefault, shouldReloadTabs } = useSelector((state) => state.technologies);
  const technologiesItems = useSelector(technologiesSelectItems);
  const technologiesLoading = useSelector(technologiesSelectLoading);
  const operationsSelectors = useSelector(selectOperations);
  const operationsItems = operationsSelectors?.items;
  const operationsLoading = operationsSelectors?.loading;
  const selectedIds = useSelector((state) => state.technologies.selectedId);
  const currentItems = useSelector(selectCurrentItems);

  //jobCode
  const jobsSelectors = useSelector(selectJobs);
  const jobsItems = jobsSelectors?.items;
  const jobsLoading = jobsSelectors?.loading;

  //equipment
  const equipmentSelectors = useSelector(selectEquipment);
  const equipmentItems = equipmentSelectors?.items;
  const equipmentLoading = equipmentSelectors?.loading;

  //события
  const handleOperationUpdate = useCallback(
    (newData) => {
      if (currentOperation) {
        dispatch(updateOperation({ id: currentOperation.id, newContent: newData })); //handleUpdateTabContent(currentOperation.id, newData);
      }
    },
    [currentOperation]
  );

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
    dispatch(fetchData({ search: '', limit: 10, page: 1 }));
    dispatch(jobsFetchData({ search: '', limit: 500, page: 1 }));
    dispatch(equipmentFetchData({ search: '', limit: 10, page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    if (!operationsLoading && operationsItems &&
        !jobsLoading && jobsItems &&
        !equipmentLoading && equipmentItems) {
      setAutocompleteOptions(prevState => ({
        ...prevState,
        operations: operationsSelectors,
        jobs: jobsSelectors,
        equipment: equipmentSelectors,
      }));
      setIsAutocompleteLoaded(true); //загрузка items завершена
    }
  }, [operationsItems, operationsLoading, jobsItems, jobsLoading, equipmentItems, equipmentLoading]);

  //очистить стейт вкладок/карточек
  useEffect(() => {
    if (!drawingExternalCode) {
      //setTabValue(0);
      //setTabs([]);
    }
  }, [drawingExternalCode]);

  const findNodeById = (items, targetId) => {
    for (let item of items) {
      if (item.id === targetId) {
        return item; //нашли элемент
      }
      
      //рекурсия для детей
      if (item.children && item.children.length > 0) {
        let foundInChildren = findNodeById(item.children, targetId);        
        if (foundInChildren !== undefined) {
          return foundInChildren; //вернули найденный элемент из потомков
        }
      }
    }
    return undefined; //ничего не нашли
  }

  useEffect(() => {
    if (!currentItems) { return; }
    if (!currentItems[0]) { return; }
    if (currentItems.length > 0 && currentItems[0]) {
      setCurrentTechnology(currentItems[0]);
      setCurrentOperation(currentItems[1]);
    }
  }, [currentItems]);
  //
  return (
    <>
    {console.log(autocompleteOptions)}
      <Box sx={{           
        height: '100%',
        overflowY: 'auto'
      }}>
        {!isAutocompleteLoaded || showLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center', py: 5 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: 2/*, height: '90%'*/ }}>
            {currentOperation && (
              <OperationCard
                content={currentOperation.content}
                onUpdate={handleOperationUpdate}
                autocompleteOptions={autocompleteOptions}
              />)}
          </Box>
          )
        }        
        <Notifications handleClose={handleClose} open={open} />
      </Box>
    </>
  );
}

export { OperationTabPanel };