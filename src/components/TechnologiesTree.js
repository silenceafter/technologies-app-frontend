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
import { fetchData, selectItems, setAdditionalItems, selectAdditionalItems, setClearAdditionalItems } from '../store/slices/technologiesSlice';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
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

//добавить кастомный класс и кастомное свойство элементу Box
const useStyles = makeStyles({
  technologyCustomClass: {
    'component-type': (props) => props.itemType
  }
});

export default function TechnologiesTree() {
  const MIN_LOADING_TIME = 500;

  //стейты
  const [loadedItems, setLoadedItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);
  const [disabledItems, setDisabledItems] = useState([]);
  const [download, setDownload] = useState(false);  
  const [technologyChip, setTechnologyChip] = useState(null);
    
  //селекторы
  const dispatch = useDispatch();
  const items = useSelector((state) => state.technologies.items);
  const loading = useSelector((state) => state.technologies.loading);
  const error = useSelector((state) => state.technologies.error);
  const drawingExternalCode = useSelector(selectDrawingExternalCode);//значение строки поиска (чертежей)
  const technologySelector = useSelector(selectTechnology);

  //refs
  const itemRef = useRef(null);
  const downloadRef = useRef(null);

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

  const StyledIconButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    padding: theme.spacing(1),
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      transform: 'scale(1.1)',
      transition: 'transform 0.3s ease-in-out, background-color 0.3s',
    },
  }));
  
  const StyledAddIcon = styled(AddIcon)(({ theme }) => ({
    fontSize: '0.65rem',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'rotate(45deg)',
    },
  }));
  
  function CustomLabel({ children, className, secondaryLabel, disabled }) {
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
        {
          disabled && (
            <TreeItem2IconContainer sx={{ marginLeft: '8px', color: 'grey' }}>
              <CancelOutlinedIcon color="action" fontSize="small" />
            </TreeItem2IconContainer>
          )
        }
      </div>
    );
  }
  
  const CustomTreeItem = React.forwardRef(function CustomTreeItem({ ...props }, ref) {
    const dispatch = useDispatch();
    const items = useSelector((state) => state.technologies.items);
    //
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

    //рефы
    const timerRef = useRef(null);

    //эффекты
    useEffect(() => {
      setExpanded(expandedItems.includes(props.itemId));
    }, [expandedItems, props.itemId]);

    useEffect(() => {
      setDisabled(disabledItems.includes(props.itemId));
    }, [disabledItems, props.itemId]);
    
    //expanded
    const handleRootClick = (e) => {
      //записать выбранную технологию
      dispatch(setTechnology({ name: item.label, code: item.secondaryLabel }));
      setExpanded((prev) => !prev);
      setDisabled((prev) => !prev);
      handleItemExpansionToggle(null, props.itemId, !expanded);
      /*handleItemDisabledToggle(null, props.itemId, item.type, item.children, !disabled);*/
    };
  
    const handleChildClick = (e) => {
      if (dataLoaded) return;
      e.stopPropagation();
      console.log('child-item');

      setDisabled((prev) => !prev);
      handleItemDisabledToggle(null, props.itemId, item.type, item.children, !disabled);
    };

    const handleAddIconClick = async (type) => {
      //добавить новую технологию
      console.log(type);
    };

    const classes = useStyles({ itemType: item.type});
    //дополнительный код
    const additionalItem = (
      <Box className={classes.technologyCustomClass} key={props.itemId} sx={{ display: 'flex', alignItems: 'center'}}>
          <span>{props.label}</span>
          {/* item.type == "add-technology" || item.type == "add-operation" ? (
            <IconButton onClick={() => handleAddIconClick(item.type)} sx={{ marginLeft: '8px' }}>
            </IconButton>
          ) : null*/
          }
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
            disabled: disabled,
          },
        }}
        id={`StyledTreeItem2-${props.itemId}`}
        onClick={item.type === 'technology' ? handleRootClick : handleChildClick}
        label={additionalItem}
        expanded={expanded}
        disabled={disabled}
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
    (props) => (
      <CustomTreeItem
        {...props}
        key={props.itemId}
        ref={itemRef}        
      />
    ),
    [itemRef]  
  );

  const handleItemExpansionToggle = (event, nodeId, expanded) => {
    setExpandedItems((prevExpanded) => {
      if (expanded) {
        return [...prevExpanded, nodeId];
      } else {
        return prevExpanded.filter((id) => id !== nodeId)
      }
    });
  };

  const handleItemDisabledToggle = (event, nodeId, type, children, disabled) => {
    /*if (type == 'technology') {
      //дочерние элементы
      for(let child of children) {
        setDisabledItems((prevDisabled) => {
          if (disabled) {
            return [...prevDisabled, child.id];
          } else {
            return prevDisabled.filter((id) => id !== child.id)
          }
        });
      }
    }*/

    //родительский элемент
    setDisabledItems((prevDisabled) => {
      if (disabled) {
        return [...prevDisabled, nodeId];
      } else {
        return prevDisabled.filter((id) => id !== nodeId)
      }
    });
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
  //
  return (
    <>
    {console.log(disabledItems)}
      <RichTreeView
        slots={{ item: renderCustomTreeItem }}          
        items={items}
        expandedItems={expandedItems}
        onItemExpansionToggle={handleItemExpansionToggle}
        disabledItems={disabledItems}
        isItemDisabled={(item) => disabledItems.includes(item.id)}
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
                    <Fab size='small' color="primary" aria-label="add">
                      <AddIcon />
                    </Fab>
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
    </>
  );
}