import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Button, 
  Chip,
  Checkbox,
  CircularProgress, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  IconButton, 
  Menu, 
  MenuItem, 
  SpeedDial, 
  SpeedDialIcon, 
  SpeedDialAction, 
  Stack, 
  TextField, 
  Typography 
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { 
  TreeItem2, 
  TreeItem2IconContainer
} from '@mui/x-tree-view/TreeItem2';
import { useTreeItem2Utils, useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { 
  setSelectedId,
  restoreItems, restoreItem,
  setCheckedItems,
  addTechnology,
  addOperation,
  deleteItems, deleteItem,
  selectCurrentItems,
  setAccess,
  copyItems, clearError,
} from '../../../../store/slices/technologiesSlice';
import AdjustIcon from '@mui/icons-material/Adjust';
import CheckIcon from '@mui/icons-material/Check';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import RestoreIcon from '@mui/icons-material/Restore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import { useAccessActions } from '../../../../hooks/useAccessActions';
import { useSnackbar } from 'notistack';
import WarningIcon from '@mui/icons-material/Warning';

const TechnologiesTree = () => {
  const dispatch = useDispatch();

  //стейты
  const [expandedItems, setExpandedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [newTechnology, setNewTechnology] = useState(null);
  const [currentTechnology, setCurrentTechnology] = useState(null);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [checkAccess, setCheckAccess] = useState(false);
  //const [actions, setActions] = useState([]);
  const [currentTechnologyLabel, setCurrentTechnologyLabel] = useState('');

  //селекторы
  const items = useSelector((state) => state.technologies.items);
  const loading = useSelector((state) => state.technologies.getSavedDataLoading);
  const error = useSelector((state) => state.technologies.getSavedDataError);
  const drawing = useSelector((state) => state.drawings.drawing);//значение строки поиска (чертежей)
  const { /*selectedItems,*/ disabledItems, checkedItems, selectedId, hasUnsavedChanges } = useSelector((state) => state.technologies);
  const user = useSelector((state) => state.users.user);
  const currentItems = useSelector(selectCurrentItems);
  const hasAccess = useSelector((state) => state.technologies.hasAccess);

  //рефы
  const itemRef = useRef(null);
  const apiRef = useTreeViewApiRef();

  //хуки
  const actions = useAccessActions({ user, currentTechnology });
  const { enqueueSnackbar } = useSnackbar();

  const StyledTreeItem2 = styled(TreeItem2)(({ theme, hasSecondaryLabel }) => ({
    color: theme.palette.grey[200],
    [`& .${treeItemClasses.content}`]: {
      borderRadius: theme.spacing(0.5),
      padding: theme.spacing(0.5, 1),
      margin: theme.spacing(0.2, 0),  
      [`& .${treeItemClasses.label}`]: {
        fontSize: '0.8rem',
        fontWeight: 500,
      },
    },
    [`& .${treeItemClasses.iconContainer}`]: {
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.dark,
      padding: theme.spacing(0, 1.2),
      ...theme.applyStyles('light', {
        backgroundColor: alpha(theme.palette.primary.main, 0.25),
      }),
      ...theme.applyStyles('dark', {
        color: theme.palette.primary.contrastText,
      }),
    },
    [`& .${treeItemClasses.groupTransition}`]: {
      marginLeft: 15,
      paddingLeft: 18,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
    [`&[data-component-type="technology"] .${treeItemClasses.content}`]: {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
      },
    },
    [`&[data-disabled]`]: {
      backgroundColor: alpha(theme.palette.action.disabledBackground, 0), // основной цвет с альфа-прозрачностью
    },
    [`& .TechnologySelected`]: {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
    },
    [`& .OperationSelected`]: {
      backgroundColor: alpha(theme.palette.secondary.main, 0.2),
    },
    ...theme.applyStyles('light', {
      color: theme.palette.grey[800],
    }),
    ...(hasSecondaryLabel && {
      paddingLeft: theme.spacing(1),
      marginTop: theme.spacing(0.5),
      [`& .${treeItemClasses.label}`]: {
        color: theme.palette.text.secondary,
      },
    })
  }));

  function CustomLabel({ className, secondaryLabel, customLabel, type, labelRef, pp, item, access }) {
    const dispatch = useDispatch();
    //стейты
    const [value, setValue] = useState(customLabel);
    //селекторы
    const checkedItems = useSelector((state) => state.technologies.checkedItems);
    const selectedId = useSelector((state) => state.technologies.selectedId);
    let customClassName;
    //
    if (!selectedId) { return; }
    if (selectedId.includes(pp) && type == 'technology') {
      customClassName = `${className} TechnologySelected`;
    } else if (selectedId.includes(pp) && type == 'operation') {
      customClassName = `${className} OperationSelected`;
    } else {
      customClassName = className;
    }
    //
    return (
      <>
        <div 
          className={customClassName}
          style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%'
          }} 
          ref={labelRef}
        >
          <Checkbox
            checked={checkedItems.includes(pp)}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setCheckedItems(pp));

              if (type == 'technology') {
                dispatch(setSelectedId([pp, item.children.length > 0 ? item.children[0].id : null]));
              } else if (type == 'operation') {
                dispatch(setSelectedId([item.parentId, pp ]));
              }
            }}
          />
          <div style={{ width: '800%', display: 'flex', flexDirection: 'column' }}>
            <Typography>
              {value}
            </Typography>                    
            {secondaryLabel && (
              <div>             
                <Typography
                  variant="caption" 
                  color="secondary" 
                >
                  {secondaryLabel}
                </Typography>
              </div>
            )}          
          </div>
          {<div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginLeft: 'auto' }}>       
            {type == 'technology' && access && (
              <TreeItem2IconContainer>
                <EditIcon sx={{ color: "#4CAF50" }} />
            </TreeItem2IconContainer>
            )}
          </div>}
        </div>
      </>
    );
  }
  
  const CustomTreeItem = React.forwardRef(function CustomTreeItem({ onClick, ...props }, ref) {
    const dispatch = useDispatch();
    const { publicAPI } = useTreeItem2Utils({
      itemId: props.itemId,
      children: props.children,
    });
    /*const {
      status: { focused , editable, editing }, 
    } = useTreeItem2(props);*/
    const item = publicAPI.getItem(props.itemId);

    //стейты
    const [isProcessing, setIsProcessing] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [expanded, setExpanded] = useState(false);

    //рефы
    const labelRef = useRef(null);

    //эффекты
    useEffect(() => {
      setExpanded(expandedItems.includes(props.itemId));
    }, [expandedItems, props.itemId]);

    const handleClick = (e) => {
      e.stopPropagation();
      if (item.type == "technology") {
        dispatch(setSelectedId([item.id, item.children.length > 0 ? item.children[0].id : null]));
        setCurrentTechnologyLabel(item.label);
      } else if (item.type == "operation") {
        dispatch(setSelectedId([item.parentId, item.id]));
      }  
    };

    //доступ к технологии
    let access = false;
    if (item?.type == 'technology' && (user?.role !== 'admin' && user?.role !== 'task_admin')) {
      access = item?.hasAccess;    
    }
    //
    return (
      <>
      <StyledTreeItem2
        {...props}
        slots={{
          label: CustomLabel
        }}
        slotProps={{
          label: { 
            secondaryLabel: item?.secondaryLabel || '',
            customLabel: item?.label || '',
            type: item?.type,
            labelRef: labelRef,
            pp: props.itemId,
            item: item,
            access: access,
          },
        }}
        id={`StyledTreeItem2-${props.itemId}`}
        expanded={expanded}
        ref={ref}
        data-component-type={item.type}
        data-disabled={disabledItems.includes(item.id) ? true : false}
        onClick={handleClick}        
      >
        { isProcessing && !dataLoaded ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'auto',
              marginTop: '0.5rem',
              marginBottom: '0.5rem'
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : (                
          props.children                             
        )}
      </StyledTreeItem2>
      </>
    );
  });

  //мемоизированная функция для slots.item (избегаем перерисовки)
  const renderCustomTreeItem = useCallback(
    (props) => {
      return (
        <CustomTreeItem
          {...props}
          key={props.itemId}
          ref={itemRef}
          onContextMenu={(event) => handleContextMenu(event, props.itemId)}
          /*onClick={() => console.log('itemclick')}*/
        />
      );
    },
    [itemRef]
  );  

  const handleItemExpansionToggle = useCallback((event, nodeId, expanded) => {
    setExpandedItems((prevExpanded) => {
      if (expanded) {
        return [...prevExpanded, nodeId];
      } else {
        return prevExpanded.filter((id) => id !== nodeId)
      }
    });
  }, [setExpandedItems]);

  //эффекты
  //анимация загрузки вкладки
  useEffect(() => {
    if (drawing) {
      setLoadingTimer(true);
      setTimeout(() => {
        setLoadingTimer(false);
      }, 500); 
    }
  }, [drawing]);

  useEffect(() => {
    //для expandedItems
    const allItemIds = items.map(item => item.id);
    setExpandedItems(allItemIds);
  }, [items]);

  //на данный момент считаем, что все технологии наши
  useEffect(() => {
    const allItemIds = items.map(item => item.id);
    setExpandedItems(allItemIds);
  }, [items]);

  useEffect(() => {
    if (!currentItems) { return; }
    try {
      setCurrentTechnology(currentItems[0]);
      setCurrentOperation(currentItems[1]);
    } catch (e) {
      console.error('Ошибка при получении данных из хранилища', e);
    }
  }, [currentItems]);

  useEffect(() => {
    if (currentTechnology && user) {
     if (user?.role === 'admin' || user?.role === 'task_admin') {
      dispatch(setAccess(true));
     } else if (user?.role === 'task_user' && currentTechnology?.hasAccess) {
      dispatch(setAccess(true));
     } else if (user?.role === 'read_only') {
      dispatch(setAccess(false));
     }
    }
    setCheckAccess(false);
  }, [currentTechnology, currentOperation, checkAccess]);

  useEffect(() => {
    if (items.length > 0 && !selectedId) {
      dispatch(setSelectedId([items[0].id, items[0].children.length > 0 ? items[0].children[0].id : null]));
    }
  }, [items, dispatch]);

  useEffect(() => {
    //следим за ошибками
    if (typeof error === 'object' && error !== null && error.hasOwnProperty('message')) {
      enqueueSnackbar(`Ошибка: ${error.message}`, { variant: 'error' });
      dispatch(clearError());
    }
  }, [error, enqueueSnackbar]);

  const handleSpeedDialActionClick = useCallback((action) => {
    setCheckAccess(true);
    /*if (user?.role === 'read_only') {
      //действие недоступно  
      setOpen(true);
      return;
    }*/
    //
    switch(action.name) {
      case 'delete':
        dispatch(deleteItems());
        enqueueSnackbar(`Технология удалена`, { variant: 'info' });
        break;

      case 'restore-all':
        dispatch(restoreItems());
        enqueueSnackbar(`Технология восстановлена`, { variant: 'info' });
        break;

      case 'add-technology':
        dispatch(addTechnology({ user: { UID: user?.UID }, drawing: { externalCode: drawing.externalcode } }));
        enqueueSnackbar(`Технология добавлена`, { variant: 'info' });        
        break;

      case 'add-operation':
        dispatch(addOperation(selectedId));
        enqueueSnackbar(`Операция добавлена`, { variant: 'info' });
        
        break;

      case 'copy':
        dispatch(copyItems({ user: user }));
        if (currentTechnologyLabel) {
          enqueueSnackbar(`Технология ${currentTechnologyLabel} скопирована`, { variant: 'info' });
        }      
        break;
    }
  }, [disabledItems, selectedId]);

  //контекстное меню
  const handleContextMenu = (event, nodeId) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedNode(nodeId);
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleContextMenuItemRestore = (node) => {
    //dispatch(restoreItems(nodes));
    dispatch(restoreItem(node));
    handleContextMenuClose();
  };

  const handleContextMenuItemDelete = (node) => {
    dispatch(deleteItem(node));
    handleContextMenuClose();
  };

  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };
  
  //вывод
  if (loadingTimer) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  const MemoizedRichTreeView = React.memo((props) => (
    <RichTreeView {...props} />
  ));
  //
  return (
    <>
    {console.log(currentTechnology)}
      {items.length > 0 ? (
        <>
          <MemoizedRichTreeView
            multiSelect
            apiRef={apiRef}
            slots={{ item: renderCustomTreeItem }}
            items={items}
            /*disabledItems={disabledItems}*/
            expandedItems={expandedItems}
            onItemExpansionToggle={handleItemExpansionToggle}
            isItemDisabled={(item) => disabledItems.includes(item.id)}
            disabledItemsFocusable={true}                        
            expansionTrigger='iconContainer'
          />                        
          <Stack direction="row" spacing={1} sx={{ padding: 2, paddingBottom: 1.8, display: 'flex', flexDirection: 'row', justifyContent: 'right', alignItems: 'center' }}>
            {drawing.externalcode && (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'left', width: '100%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', width: '100%' }}>
                    <SpeedDial
                      ariaLabel="SpeedDial basic example"
                      sx={{ height: 'auto', position: 'absolute', bottom: 15, right: 15, /*transform: 'scale(0.85)',*/ '& .MuiFab-primary': { width: 45, height: 45 } }}
                      icon={<SpeedDialIcon />}
                      hidden={items && items.length > 0 ? false : true}
                    >
                      {actions
                        .filter(action => action && action.icon && action.title)
                        .map((action) => 
                          <SpeedDialAction
                            key={action.name}
                            icon={action.icon}
                            tooltipTitle={action.title}
                            onClick={() => handleSpeedDialActionClick(action)}
                          />
                      )}
                    </SpeedDial>
                  </Box>
                </Box>
              </>
            )}
          </Stack>
          {/*<Menu
            open={contextMenu !== null}
            onClose={handleContextMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            <MenuItem onClick={() => handleContextMenuItemRestore(selectedNode)}>Отменить удаление</MenuItem>
            <MenuItem onClick={() => handleContextMenuItemDelete(selectedNode)}>Удалить</MenuItem>
          </Menu>*/}
        </>
        ) : (
        <>
          <Box
            sx={{ display: 'flex', flexDirection: 'row', gap: 2}}
          >
            <WarningIcon color='warning' />
            <Typography>Нет записей</Typography>
          </Box>
        </>
      )}

      {/* Сообщение при отсутствии прав на действие */}
      {<Dialog
        open={open}
        onClose={handleDialogClose}
      >        
        <DialogTitle>Нет доступа</DialogTitle>
        <DialogContent>
          <DialogContentText>{error}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>OK</Button>
        </DialogActions>
      </Dialog>}
    </>
  );
};

export default React.memo(TechnologiesTree);