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
import { OperationCard } from './OperationCard';
import { TechnologyBreadcrumbs } from './TechnologyBreadcrumbs';
import Toolbar from '@mui/material/Toolbar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';

import {
  selectItems as technologiesSelectItems, 
  selectLoading as technologiesSelectLoading,
  updateOperation, selectCurrentItems,
} from '../../../../store/slices/technologiesSlice';
import { selectOperations, fetchData as operationsFetchData} from '../../../../store/slices/lists/operationsListSlice';
import { selectJobs, fetchData as jobsFetchData } from '../../../../store/slices/lists/jobsListSlice';
import { selectEquipment, fetchData as equipmentFetchData } from '../../../../store/slices/lists/equipmentListSlice';
import { selectTooling, fetchData as toolingFetchData } from '../../../../store/slices/lists/toolingListSlice';
import { selectMaterials, fetchData as materialsFetchData } from '../../../../store/slices/lists/materialsListSlice';
import { selectComponents, fetchData as componentsFetchData } from '../../../../store/slices/lists/componentsListSlice';
import { selectMeasuringTools, fetchData as measuringToolsFetchData } from '../../../../store/slices/lists/measuringToolsListSlice';

function OperationTabPanel({ showLoading }) {
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
  const drawing = useSelector((state) => state.drawings.drawing);
  const technologiesItems = useSelector(technologiesSelectItems);
  const technologiesLoading = useSelector(technologiesSelectLoading);
  const operationsSelectors = useSelector(selectOperations);
  const operationsItems = operationsSelectors?.items;
  const operationsLoading = operationsSelectors?.loading;
  const selectedIds = useSelector((state) => state.technologies.selectedId);
  const currentItems = useSelector(selectCurrentItems);
  const user = useSelector((state) => state.users.user);
  const hasAccess = useSelector((state) => state.technologies.hasAccess);

  //jobCode
  const jobsSelectors = useSelector(selectJobs);
  const jobsItems = jobsSelectors?.items;
  const jobsLoading = jobsSelectors?.loading;

  //equipment
  const equipmentSelectors = useSelector(selectEquipment);
  const equipmentItems = equipmentSelectors?.items;
  const equipmentLoading = equipmentSelectors?.loading;

  //tooling
  const toolingSelectors = useSelector(selectTooling);
  const toolingItems = toolingSelectors?.items;
  const toolingLoading = toolingSelectors?.loading;

  //materials
  const materialsSelectors = useSelector(selectMaterials);
  const materialsItems = materialsSelectors?.items;
  const materialsLoading = materialsSelectors?.loading;

  //components
  const componentsSelectors = useSelector(selectComponents);
  const componentsItems = componentsSelectors?.items;
  const componentsLoading = componentsSelectors?.loading;

  //measuringTools
  const measuringToolsSelectors = useSelector(selectMeasuringTools);
  const measuringToolsItems = measuringToolsSelectors?.items;
  const measuringToolsLoading = measuringToolsSelectors?.loading;

  //события
  const handleOperationUpdate = useCallback(
    (newData) => {
      if (currentOperation) {
        dispatch(updateOperation({ id: currentOperation.id, newContent: newData }));
      }
    },
    [currentOperation]
  );

  //эффекты
  //анимация загрузки вкладки
  useEffect(() => {
    if (drawing) {
      setLoadingTimer(true);
      setTimeout(() => {
        setLoadingTimer(false);
      }, 1000);
    }
  }, [drawing]);

  useEffect(() => {
    dispatch(operationsFetchData({ search: '', limit: 50, page: 1 })); /* 350 записей */
    dispatch(jobsFetchData({ search: '', limit: 500, page: 1 })); /* 100 записей = загружаем полностью */
    dispatch(equipmentFetchData({ search: '', limit: 10, page: 1 })); /* 1500 записей */
    dispatch(toolingFetchData({ search: '', limit: 10, page: 1 })); /* 16000 записей */
    dispatch(materialsFetchData({ search: '', limit: 10, page: 1 })); /* 5000 записей */
    dispatch(componentsFetchData({ search: '', limit: 10, page: 1 })); /* 8500 записей */
    dispatch(measuringToolsFetchData({ search: '', limit: 10, page: 1 })); /* 2000 записей */
  }, [dispatch]);

  useEffect(() => {
    if (!operationsLoading && operationsItems &&
        !jobsLoading && jobsItems &&
        !equipmentLoading && equipmentItems &&
        !toolingLoading && toolingItems &&
        !materialsLoading && materialsItems &&
        !componentsLoading && componentsItems &&
        !measuringToolsLoading && measuringToolsItems
      ) {
      setAutocompleteOptions(prevState => ({
        ...prevState,
        operations: operationsSelectors,
        jobs: jobsSelectors,
        equipment: equipmentSelectors,
        tooling: toolingSelectors,
        materials: materialsSelectors,
        components: componentsSelectors,
        measuringTools: measuringToolsSelectors,
      }));
      setIsAutocompleteLoaded(true); //загрузка items завершена
    }
  }, [operationsItems, operationsLoading, jobsItems, jobsLoading, equipmentItems, equipmentLoading, toolingItems, toolingLoading, materialsItems, materialsLoading, componentsItems, componentsLoading, measuringToolsItems, measuringToolsLoading]);

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
    /*if (!currentItems[0]) { return; }*/
    try {
      setCurrentTechnology(currentItems[0] ? currentItems[0] : null);
      setCurrentOperation(currentItems[1] ? currentItems[1] : null);
    } catch (e) {
      console.error('Ошибка при получении данных из хранилища', e);
    }
  }, [currentItems]);
  //
  return (
    <>
    {/*console.log(currentTechnology)*/}
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
            {currentOperation ? (
              <OperationCard
                content={currentOperation.content}
                onUpdate={handleOperationUpdate}
                autocompleteOptions={autocompleteOptions}
                access={hasAccess}
              />) : (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 2,
                      color: 'black'            
                    }}
                  >
                    <WarningIcon color='warning' />
                    <Typography>Компонент будет доступен при выборе операции</Typography>
                  </Box>
                </>  
              )
            }
          </Box>
          )
        }
      </Box>
    </>
  );
}

export { OperationTabPanel };