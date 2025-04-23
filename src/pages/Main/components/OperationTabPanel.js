import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
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

//import { setTabs, addTab, removeTab, updateTab, setTabValue, setShouldReloadTabs } from '../../../store/slices/operationsSlice';
import {
  selectItems as technologiesSelectItems, 
  selectLoading as technologiesSelectLoading,
  setTabs, addTab, removeTab, updateTab, setTabValue, setShouldReloadTabs,
} from '../../../store/slices/technologiesSlice';
import { selectDrawingExternalCode, selectTechnology, setTechnology } from '../../../store/slices/drawingsSlice';
import { selectOperations, fetchData } from '../../../store/slices/lists/operationsListSlice';

function OperationTabPanel({ handleClose, open, requestStatus, showLoading }) {
  const dispatch = useDispatch();

  //стейты
  const [autocompleteOptions, setAutocompleteOptions] = useState({});
  const [isAutocompleteLoaded, setIsAutocompleteLoaded] = useState(false);
  const [isUserClosedAllTabs, setIsUserClosedAllTabs] = useState(false);
  const [validateForm, setValidateForm] = useState(() => () => true);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [currentTechnology, setCurrentTechnology] = useState(null);
  const [currentOperation, setCurrentOperation] = useState(null);

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
  const hasUnsavedChanges = useSelector((state) => state.technologies.hasUnsavedChanges);

  //события
  const handleUpdateTabContent = useCallback(
    (tabId, newContent, newValidateForm) => {
      dispatch(updateTab({ id: tabId, newContent: newContent, newValidateForm: newValidateForm }));
    }, 
    [dispatch]
  );

  const handleOperationUpdate = useCallback(
    (newData) => {
      //const currentTab = tabs[tabValue];
      if (/*currentTab && currentTab.id*/ currentOperation.id) {
        handleUpdateTabContent(/*currentTab.id*/ currentOperation.id, newData, newData.validateForm);
      }
    },
    [handleUpdateTabContent, currentOperation]
  );

  const setValidateFormStable = useCallback(
    (newValidateForm) => setValidateForm(newValidateForm),
    [setValidateForm]
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
  /*useEffect(() => {
    try {
      if (!technologiesLoading && (tabs.length === 0 && !isUserClosedAllTabs || shouldReloadTabs) 
        && technologiesItems.length > 0 && drawingExternalCode.length > 0) {
          //изначально вкладки создаются из technologiesItems 
          const newTabs = technologiesItems[0].children
            .filter(operation => operation.content.dbValues.orderNumber)
            .map(operation => {
              // Ищем существующую вкладку, чтобы сохранить ошибки и состояние панелей
              const existingTab = tabs.find(tab => tab.id === operation.content.dbValues.orderNumber);
              const data = {                
                //parameters
                orderNumber: operation.content.dbValues.orderNumber,
                operationCode: { code: operation.label, name: operation.secondaryLabel, cnt: operation.proxy.proxyOId },                
                shopNumber: operation.content.dbValues.shopNumber,
                areaNumber: operation.content.dbValues.areaNumber,
                document: operation.content.dbValues.document,
                operationDescription: operation.content.dbValues.operationDescription,
              
                //jobs  
                grade: operation.content.dbValues.grade,
                workingConditions: operation.content.dbValues.workingConditions,
                numberOfWorkers: operation.content.dbValues.numberOfWorkers,
                numberOfProcessedParts: operation.content.dbValues.numberOfProcessedParts,
                laborEffort: operation.content.dbValues.laborEffort,
                job: { code: operation.content.dbValues.jobCode, name: operation.content.dbValues.jobName },
              };
              //
              return {
                id: operation.content.dbValues.orderNumber,
                label: `${operation.secondaryLabel} (${operation.label})`,                
                operation: { code: operation.label, name: operation.secondaryLabel },
                technology: {
                  code: technologiesItems[0].label, 
                  name: technologiesItems[0].secondaryLabel,
                  userId: technologiesItems[0].userId,
                  creationDate: technologiesItems[0].creationDate,
                  lastModified: technologiesItems[0].lastModified
                },
                drawing: { code: drawingExternalCode },
                content: {
                  dbValues: data,
                  formValues: data,
                  formErrors: existingTab?.content?.formErrors || {}, // Сохраняем ошибки
                  changedValues: existingTab?.content?.changedValues || {}, //реквизиты, в которых были изменения
                  expandedPanels: existingTab?.content?.expandedPanels || expandedPanelsDefault, // Сохраняем раскрытые панели
                  isDeleted: false,
                },
                proxy: {
                  proxyDTId: operation.proxy.proxyDTId,
                  proxyTOId: operation.proxy.proxyTOId,
                  keyHex: technologiesItems[0].keyHex,
                  ivHex: technologiesItems[0].ivHex
                }
              };
            }
          );
          //
          dispatch(setTabs(newTabs));
          dispatch(setTabValue(0)); //первая вкладка активна по умолчанию
      }
  
      //устанавливаем текущую выбранную технологию
      dispatch(setTechnology(technologiesItems[0]));
      dispatch(setShouldReloadTabs(false));
    } catch (error) {
      console.error("Ошибка при обработке технологий:", error);
    }
  }, [technologiesLoading, technologiesItems, drawingExternalCode, shouldReloadTabs]);*/

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
    if (selectedIds == null) { return; }
    if (selectedIds[1] == null) { return; }
    if (!(!technologiesLoading && technologiesItems.length > 0 && drawingExternalCode.length > 0)) { return; }
    //
    setCurrentTechnology(findNodeById(technologiesItems, selectedIds[0]));
    setCurrentOperation(findNodeById(technologiesItems, selectedIds[1]));
  }, [technologiesItems, selectedIds]);

  //
  return (
    <>
    {console.log(technologiesItems)}
      <Paper elevation={3} sx={{ width: '100%', margin: 0, flexGrow: 1, overflow: 'auto' }}>
        <Box sx={{ overflow: 'hidden' }}>
          <AppBar
            position="static"
            color="primary"
            elevation={0}
            sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}
          >
            <Toolbar>
              {currentOperation ? (
                <Typography>Операция: {currentOperation.secondaryLabel} ({currentOperation.label})</Typography>
                ) : (
                <Typography>Операция</Typography>
                )}
            </Toolbar>
          </AppBar>
        </Box>        
        <Box sx={{           
          height: '91%',
          overflowY: 'auto'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 2, paddingTop: 2 }}>
            {drawingExternalCode && !showLoading && currentTechnology && currentOperation && /*tabs.length > 0 && tabs[tabValue] &&*/ (
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
              {currentOperation && (
                <OperationCard
                  content={currentOperation.content}
                  onUpdate={handleOperationUpdate}
                  setValidateForm={setValidateFormStable}
                  autocompleteOptions={autocompleteOptions}
                  hasUnsavedChanges={hasUnsavedChanges}
                />)}
            </Box>
            )
          }
          {/*tabs.length == 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 2, height: '90%' }}>
              <Typography>Нет открытых вкладок</Typography>
              </Box>
            )*/
          }          
          <Notifications handleClose={handleClose} open={open} requestStatus={requestStatus} />
        </Box>
      </Paper>      
    </>
  );
}

export { OperationTabPanel };