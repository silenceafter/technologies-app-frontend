import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { styled, alpha } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
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
import { fetchData, setItems, setSelectedItems, addSelectedItems, deleteSelectedItems, setDisabledItems, deleteDisabledItems, deleteSavedData} from '../store/slices/technologiesSlice';
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
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

//действия для SpeedDial
const actions = [
  { icon: <AddIcon />, name: 'add-technology', title: 'Добавить технологию' },
  { icon: <DeleteIcon />, name: 'delete', title: 'Удалить' },
  { icon: <RestoreFromTrashIcon />, name: 'restore', title: 'Отменить удаление всех элементов' }
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
  //const [disabledItems, setDisabledItems] = useState([]);
  //const [selectedItems, setSelectedItems] = useState([]);
  const [technologyChip, setTechnologyChip] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
    
  //селекторы
  const dispatch = useDispatch();
  const items = useSelector((state) => state.technologies.items);
  const loading = useSelector((state) => state.technologies.loading);
  const error = useSelector((state) => state.technologies.error);
  const drawingExternalCode = useSelector(selectDrawingExternalCode);//значение строки поиска (чертежей)
  const technologySelector = useSelector(selectTechnology);
  const selectedItems = useSelector((state) => state.technologies.selectedItems);
  const disabledItems = useSelector((state) => state.technologies.disabledItems);

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
  
  function CustomLabel({ children, className, secondaryLabel }) {    
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div>
          <Typography>{children}</Typography>
          {secondaryLabel && (
            <Typography variant="caption" color="secondary">
              {secondaryLabel}
            </Typography>
          )}
        </div>
      </div>
    );
  }
  
  const CustomTreeItem = React.forwardRef(function CustomTreeItem({ ...props }, ref) {
    const dispatch = useDispatch();
    const { publicAPI } = useTreeItem2Utils({
      itemId: props.itemId,
      children: props.children,
    });
    const item = publicAPI.getItem(props.itemId);

    //стейты
    const [isProcessing, setIsProcessing] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [selected, setSelected] = useState(false);

    //рефы
    const timerRef = useRef(null);

    //эффекты
    useEffect(() => {
      setExpanded(expandedItems.includes(props.itemId));
    }, [expandedItems, props.itemId]);

    useEffect(() => {
      setDisabled(disabledItems.includes(props.itemId));
    }, [disabledItems, props.itemId]);

    useEffect(() => {
      setSelected(selectedItems.includes(props.itemId));
    }, [selectedItems, props.itemId]);
    
    //expanded
    const handleRootClick = (e) => {
      //записать выбранную технологию
      dispatch(setTechnology({ name: item.label, code: item.secondaryLabel }));
      const isIconClick = e.target.closest(`.${treeItemClasses.iconContainer}`);//развернуть только при клике на иконку
      //
      if (isIconClick) {
        e.stopPropagation();
        setExpanded((prev) => !prev);
        handleItemExpansionToggle(null, props.itemId, !expanded);
        return; 
      }
    };
  
    const handleChildClick = (e) => {
      if (dataLoaded) return;
      e.stopPropagation();
    };

    const classes = useStyles({ itemType: item.type});
    //дополнительный код
    const additionalItem = (
      <Box className={classes.technologyCustomClass} key={props.itemId} sx={{ display: 'flex', alignItems: 'center'}}>
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
            secondaryLabel: item?.secondaryLabel || ''
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
          onContextMenu={(event) => handleContextMenu(event, props)}
        />
      );
    },
    [itemRef]  
  );
  /*const renderCustomTreeItem = useCallback(
    (props) => (
      <CustomTreeItem
        {...props}
        type={props.type}
        key={props.itemId}
        ref={itemRef}
        onContextMenu={(event) => handleContextMenu(event, props)}
      />
    ),
    [itemRef]  
  );*/
  

  const handleItemExpansionToggle = (event, nodeId, expanded) => {
    setExpandedItems((prevExpanded) => {
      if (expanded) {
        return [...prevExpanded, nodeId];
      } else {
        return prevExpanded.filter((id) => id !== nodeId)
      }
    });
  };

  const handleItemSelectionToggle = (event, itemId, isSelected) => {
    toggledItemRef.current[itemId] = isSelected;
  };

  const handleSelectedItemsChange = (event, newSelectedItems) => {
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
  };

  useEffect(() => {
    //для expandedItems
    const allItemIds = items.map(item => item.id);
    setExpandedItems(allItemIds);
  }, [items]);

  //chip для выбранной технологии
  const handleDelete = () => {
    setTechnologyChip(null);
  };

  useEffect(() => {
    setTechnologyChip(`${technologySelector.name}: ${technologySelector.code}`);
  }, [technologySelector]);

  const handleSpeedDialActionClick = (action) => {
    switch(action.name) {
      case 'delete':
        dispatch(deleteSelectedItems(selectedItems));
        break;
    }
  };

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
    dispatch(deleteDisabledItems(nodes));
    handleContextMenuClose();
  };
  //
  return (
    <>
    {console.log(items)}
      <RichTreeView
        checkboxSelection
        multiSelect
        slots={{ item: renderCustomTreeItem }}
        items={items}
        expandedItems={expandedItems}
        onItemExpansionToggle={handleItemExpansionToggle}
        disabledItems={disabledItems}
        isItemDisabled={(item) => disabledItems.includes(item.id)}
        expansionTrigger='iconContainer'                
        apiRef={apiRef}
        selectedItems={selectedItems}
        onSelectedItemsChange={handleSelectedItemsChange}
        onItemSelectionToggle={handleItemSelectionToggle}
        disabledItemsFocusable={true}        
      />                        
      <Stack direction="row" spacing={1} sx={{ padding: 2, paddingBottom: 1.5, display: 'flex', flexDirection: 'row', justifyContent: 'right', alignItems: 'center' }}>
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
      </Menu>
    </>
  );
}