import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { styled, alpha } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Popover from '@mui/material/Popover';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { 
  TreeItem2, 
  TreeItem2Content,
  TreeItem2Root,
  TreeItem2GroupTransition,
  TreeItem2IconContainer,
  TreeItem2Label 
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeItem2LabelInput } from '@mui/x-tree-view/TreeItem2LabelInput';
import { useTreeItem2Utils, useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import { fetchData, setItems, addItems, setSelectedItems, setSelectedItemId, addSelectedItems, deleteSelectedItems, setDisabledItems, restoreItems, deleteSavedData} from '../store/slices/technologiesSlice';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import { selectDrawingExternalCode, setTechnology, selectTechnology, selectOperation } from '../store/slices/drawingsSlice';
import { makeStyles } from '@mui/styles';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AdjustIcon from '@mui/icons-material/Adjust';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RestoreIcon from '@mui/icons-material/Restore';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import { TechnologySearch } from './TechnologySearch';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import CheckIcon from '@mui/icons-material/Check';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

//действия для SpeedDial
const actions = [
  { icon: <AddIcon />, name: 'add-technology', title: 'Добавить технологию' },
  { icon: <DeleteIcon />, name: 'delete', title: 'Удалить' },
  { icon: <RestoreIcon />, name: 'restoreAll', title: 'Отменить удаление всех элементов' }
];

//добавить кастомный класс и кастомное свойство элементу Box
const useStyles = makeStyles({
  technologyCustomClass: {
    'component-type': (props) => props.itemType
  }
});

function getItemDescendantsIds(item) {
  const ids = [];
  item.children?.forEach((child) => {
    ids.push(child.id);
    ids.push(...getItemDescendantsIds(child));
  });
  return ids;
}

export default function TechnologiesTree() {
  const MIN_LOADING_TIME = 500;

  //стейты
  const [loadedItems, setLoadedItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [developedTechnologies, setDevelopedTechnologies] = useState([]);
  const [anchorPopover, setAnchorPopover] = useState(null);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [focusedItem, setFocusedItem] = useState([]);

  //селекторы
  const dispatch = useDispatch();
  const items = useSelector((state) => state.technologies.items);
  const loading = useSelector((state) => state.technologies.loading);
  const error = useSelector((state) => state.technologies.error);
  const drawingExternalCode = useSelector(selectDrawingExternalCode);//значение строки поиска (чертежей)
  const technologySelector = useSelector(selectTechnology);
  const selectedItems = useSelector((state) => state.technologies.selectedItems);
  const disabledItems = useSelector((state) => state.technologies.disabledItems);
  const selectedItemId = useSelector((state) => state.technologies.selectedItemId);

  //refs
  const itemRef = useRef(null);
  const toggledItemRef = React.useRef({});
  const apiRef = useTreeViewApiRef();

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
  
  /*function CustomLabel({ children, className, secondaryLabel, edited, onLabelClick, onSecondaryLabelClick }) {    
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div>
          <Typography onClick={(e) => { e.stopPropagation(); onLabelClick?.(e); }}>{children}</Typography>
          {secondaryLabel && (
            <Typography variant="caption" color="secondary" onClick={(e) => { e.stopPropagation(); onSecondaryLabelClick?.(e); }}>
              {secondaryLabel}
            </Typography>
          )}
        </div>
      </div>
    );
  }*/

  function CustomLabel({ children, className, secondaryLabel, edited, onLabelClick, onSecondaryLabelClick, customLabel, type, labelRef, focused, pp }) {
    const [isEditing, setIsEditing] = useState(edited);
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState(customLabel);  
    //
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }} ref={labelRef}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          {isEditing ? (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                <TechnologySearch 
                  props={{id: "operation-code-2", placeholder: "Код операции"}}
                  id="operationCode">
                </TechnologySearch>
                <IconButton
                  color="success"
                  size="small"
                  /*onClick={(event) => {
                    handleSaveItemLabel(event, `${nameValue.firstName} ${nameValue.lastName}`);
                    save();
                  }}*/
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={(event) => {
                    setIsEditing(false);
                  }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          ) : (
            <Typography 
              onClick={(e) => { 
                /*e.stopPropagation();*/
                /*setIsEditing(true);*/
                onLabelClick?.(e);                
              }}
            >
              {value}
            </Typography>
          )}                    
          {secondaryLabel && (
            <div>
              {isEditing ? (
                <Typography />
              ) : (
                <Typography
                  variant="caption" 
                  color="secondary" 
                  onClick={(e) => { 
                  }}
                >
                  {secondaryLabel}
                </Typography>
              )}
            </div>
          )}          
        </div>
        {<div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginLeft: 'auto' }}>
          {type == 'technology' && (
            <TreeItem2IconContainer>
              <EditOutlinedIcon color="success" />
            </TreeItem2IconContainer>
          )}        
            {type == 'technology' && focused && (
              <TreeItem2IconContainer>
                <AdjustIcon color="primary" />
            </TreeItem2IconContainer>
            )}
        </div>}
      </div>
    );
  }
  
  const CustomTreeItem = React.forwardRef(function CustomTreeItem({ ...props }, ref) {
    const dispatch = useDispatch();
    const { publicAPI } = useTreeItem2Utils({
      itemId: props.itemId,
      children: props.children,
    });
    const {
      status: { focused /*, editable, editing*/ },
    } = useTreeItem2(props);
    const item = publicAPI.getItem(props.itemId);

    //стейты
    const [isProcessing, setIsProcessing] = useState(false);
    const [edited, setEdited] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [selected, setSelected] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [anchorPopover, setAnchorPopover] = useState(null);

    //рефы
    const timerRef = useRef(null);
    const labelRef = useRef(null);



    //эффекты
    useEffect(() => {
      setExpanded(expandedItems.includes(props.itemId));
      setDisabled(disabledItems.includes(props.itemId));
      setSelected(selectedItems.includes(props.itemId));
      setEdited(editedItems.includes(props.itemId));
      //setIsFocused(props.itemId == selectedItemId ? true : false);
    }, [expandedItems, disabledItems, selectedItems, editedItems, props.itemId]);

    //expanded
    const handleRootClick = (e) => {
      //записать выбранную технологию
      handleCustomTreeItemClick(e, props.itemId);//
      dispatch(setTechnology({ name: item.label, code: item.secondaryLabel }));
      const isIconClick = e.target.closest(`.${treeItemClasses.iconContainer}`);//развернуть только при клике на иконку
      //
      if (isIconClick) {
        e.stopPropagation();
        setExpanded((prev) => !prev);
        handleItemExpansionToggle(null, props.itemId, !expanded);
        return; 
      }

      //popover
      /*if (labelRef.current) {
        setAnchorPopover(labelRef.current);
      }*/
    };
  
    const handleChildClick = (e) => {
      if (dataLoaded) return;
      e.stopPropagation();
      
      handleCustomTreeItemClick(e, props.itemId);
      //фокус, глобальное состояние
      /*if (selected1) {
        setFocusedItem(props.itemId);
      }*/
      
      //popover
      /*if (labelRef.current) {
        setAnchorPopover(labelRef.current);
      }*/
    };

    const handlePopoverClose = () => {
      setAnchorPopover(null);
    };

    const classes = useStyles({ itemType: item.type});
    //дополнительный код
    const additionalItem = (
      <Box className={classes.technologyCustomClass} key={props.itemId} sx={{ display: 'flex', alignItems: 'center', width: '100%'}} /*onDoubleClick={handleDoubleClick}*/>
        <span>{props.label}</span>
      </Box>
    );    
    //
    return (
      <>
      <StyledTreeItem2
        {...props}
        ref={ref}
        slots={{
          label: CustomLabel
        }}
        slotProps={{
          label: { 
            secondaryLabel: item?.secondaryLabel || '',
            edited: edited,
            onLabelClick: (e) => <TextField>111</TextField>,
            onSecondaryLabelClick: (e) => console.log('onSecondaryLabelClick'),
            customLabel: item?.label || '',
            type: item?.type,
            labelRef: labelRef,
            focused: isFocused,
            pp: props.itemId,
          },
        }}
        id={`StyledTreeItem2-${props.itemId}`}
        onClick={item.type === 'technology' ? handleRootClick : handleChildClick}
        label={additionalItem}
        expanded={expanded}
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
      {/*<Popover
        open={Boolean(anchorPopover)}
        anchorEl={anchorPopover}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, width: 'auto' }}>
        <Typography gutterBottom variant="h6" component="div">{item?.type == 'technology' ? 'Технология' : 'Операция'}</Typography>
          <Typography gutterBottom variant="body1"><strong>Наименование:</strong> {item?.secondaryLabel || ''}</Typography>
          <Typography gutterBottom variant="body1"><strong>Код:</strong> {item?.label || ''}</Typography>
          <Typography gutterBottom variant="body1"><strong>Автор:</strong> ФИО</Typography>
          <Typography gutterBottom variant="body1"><strong>Дата создания:</strong> дд.мм.гггг чч:мм:сс</Typography>
          <Typography gutterBottom variant="body1"><strong>Последнее изменение:</strong> дд.мм.гггг чч:мм:сс</Typography>
        </Paper>
      </Popover>*/}
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
        />
      );
    },
    [itemRef, editedItems]
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

  const handleItemSelectionToggle = useCallback((event, itemId, isSelected) => {
    toggledItemRef.current[itemId] = isSelected;
  }, []);

  const handleSelectedItemsChange = useCallback((event, newSelectedItems) => {
    dispatch(setSelectedItems(newSelectedItems));//setSelectedItems(newSelectedItems);
    const itemsToSelect = [];
    const itemsToUnSelect = {};
    Object.entries(toggledItemRef.current).forEach(([itemId, isSelected]) => {
      const item = apiRef.current.getItem(itemId);
      if (isSelected) {
        itemsToSelect.push(...getItemDescendantsIds(item));
      } else {
        getItemDescendantsIds(item).forEach((descendantId) => {
          itemsToUnSelect[descendantId] = true;
        });
      }
    });
    //
    const newSelectedItemsWithChildren = Array.from(
      new Set(
        [...newSelectedItems, ...itemsToSelect].filter(
          (itemId) => !itemsToUnSelect[itemId],
        ),
      ),
    );
    dispatch(setSelectedItems(newSelectedItemsWithChildren));//setSelectedItems(newSelectedItemsWithChildren);
    toggledItemRef.current = {};
  }, [apiRef, dispatch, getItemDescendantsIds]);

  //selected, CustomTreeItem
  const handleCustomTreeItemClick = (event, itemId) => {
    /*apiRef.current.selectItem({
      event,
      itemId,
      keepExistingSelection: false,
      shouldBeSelected: true,       
    });*/
    dispatch(setSelectedItemId(itemId));//setSelectedItemId(itemId);
  };

  //эффекты
  //анимация загрузки вкладки
  useEffect(() => {
    if (drawingExternalCode != '') {
      setLoadingTimer(true);
      setTimeout(() => {
        setLoadingTimer(false);
      }, 500); 
    }
  }, [drawingExternalCode]);

  useEffect(() => {
    //для expandedItems
    const allItemIds = items.map(item => item.id);
    setExpandedItems(allItemIds);
  }, [items]);

  //на данный момент считаем, что все технологии наши
  useEffect(() => {
    const allItemIds = items.map(item => item.id);
    setDevelopedTechnologies(allItemIds);
  }, items);

  //chip для выбранной технологии
  const handleDelete = () => {
    //setTechnologyChip(null);
  };

  /*useEffect(() => {
    setTechnologyChip(`${technologySelector.name}: ${technologySelector.code}`);
  }, [technologySelector]);*/

  const technologyChip = useMemo(() => {
    return `${technologySelector.name}: ${technologySelector.code}`;
  }, [technologySelector]);

  const handleSpeedDialActionClick = useCallback((action) => {
    switch(action.name) {
      case 'delete':
        dispatch(deleteSelectedItems(selectedItems));
        break;

      case 'restoreAll':
        const parentItemIds = items
          .filter(item => item.children && item.children.length > 0)
          .map(item => item.id);
        handleContextMenuItemRestore(disabledItems);
        break;

      case 'add-technology':
        //handleClickOpen();
        dispatch(addItems());
        break;
    }
  }, [selectedItems, disabledItems]);

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

  const handleContextMenuItemRestore = (nodes) => {
    dispatch(restoreItems(nodes));
    handleContextMenuClose();
  };

  const handleContextMenuItemDelete = (node) => {
    dispatch(deleteSelectedItems(node));
    handleContextMenuClose();
  };

  const handleContextMenuItemRename = (node) => {
    if (!editedItems.includes(node)) {
      setEditedItems(prev => {
        if (!prev.includes(node)) {
          return [...prev, node];
        }
        return prev;
      });  
    }
    handleContextMenuClose();
  }

  //добавить технологию
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
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
    {console.log(items)}
      <MemoizedRichTreeView
        checkboxSelection
        multiSelect
        slots={{ item: renderCustomTreeItem }}
        items={items}
        expandedItems={expandedItems}
        onItemExpansionToggle={handleItemExpansionToggle}
        disabledItems={disabledItems}
        disabledItemsFocusable={true}        
        isItemDisabled={(item) => disabledItems.includes(item.id)}
        expansionTrigger='iconContainer'                
        apiRef={apiRef}
        selectedItems={selectedItems}
        onSelectedItemsChange={handleSelectedItemsChange}
        onItemSelectionToggle={handleItemSelectionToggle}
      />                        
      <Stack direction="row" spacing={1} sx={{ padding: 2, paddingBottom: 1.8, display: 'flex', flexDirection: 'row', justifyContent: 'right', alignItems: 'center' }}>
        {
          drawingExternalCode.trim() != ''
            ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'left', width: '100%' }}>
                {
                  technologySelector.code.trim() != ''
                    ? (                                            
                      technologyChip && <Chip label={technologyChip} variant="outlined" onDelete={handleDelete} />
                    )
                    : ('')
                }
                  <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'right', width: '100%' }}>
                    {/*<Fab size='small' color="primary" aria-label="add">
                      <AddIcon />
                    </Fab>*/}
                    <SpeedDial
                      ariaLabel="SpeedDial basic example"
                      sx={{ position: 'absolute', bottom: 16, right: 16, transform: 'scale(0.85)', '& .MuiFab-primary': { width: 45, height: 45 } }}
                      icon={<SpeedDialIcon />}
                    >
                      {actions.map((action) => (
                        <SpeedDialAction
                          key={action.name}
                          icon={action.icon}
                          tooltipTitle={action.title}
                          onClick={() => handleSpeedDialActionClick(action)}
                        />
                      ))}
                    </SpeedDial>
                  </Box>
                </Box>
              </>
            )
            : (
              <>
                {/*заглушка*/}
              </>
            )
        }
      </Stack>
      <Menu
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
        <MenuItem onClick={() => handleContextMenuItemRename(selectedNode)}>Переименовать</MenuItem>
      </Menu>
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              const email = formJson.email;
              console.log(email);
              handleClose();
            },
          },
        }}        
      >
        <DialogTitle>Новая технология</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Выберите технологию из списка
          </DialogContentText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2, width: '500px' }}>
            <TechnologySearch
              props={{id: "operation-code-2", placeholder: "Код операции"}}
              id="operationCode" /*onChange={(e) => handleOptionSelect('operationCode', e.target.value)}
              selectedValue={localData.formValues.operationCode} 
              errorValue={localData.formErrors.operationCode}*/
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button type="submit">Подтвердить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}