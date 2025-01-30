import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { styled, alpha } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import { useTreeItem2Utils } from '@mui/x-tree-view/hooks';
import { fetchData, selectItems, setAdditionalItems, selectAdditionalItems, setClearAdditionalItems } from '../store/slices/technologiesSlice';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import { selectDrawingExternalCode } from '../store/slices/drawingsSlice';
import { makeStyles } from '@mui/styles';

//добавить кастомный класс и кастомное свойство элементу Box
const useStyles = makeStyles({
  technologyCustomClass: {
    'component-type': (props) => props.itemType
  }
});

export default function TechnologiesTree() {
  const [loadedItems, setLoadedItems] = useState([]);
  const [download, setDownload] = useState(false);  
  const MIN_LOADING_TIME = 500;
  const itemRef = useRef(null);
  const downloadRef = useRef(null);  
  
  //селекторы
  const dispatch = useDispatch();
  const items = useSelector((state) => state.technologies.items);
  const loading = useSelector((state) => state.technologies.loading);
  const error = useSelector((state) => state.technologies.error);

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
    fontSize: '0.8rem',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'rotate(45deg)',
    },
  }));
  
  function CustomLabel({ children, className, secondaryLabel }) {
    return (
      <div className={className}>
        <Typography>{children}</Typography>
        {secondaryLabel && (
          <Typography variant="caption" color="secondary">
            {secondaryLabel}
          </Typography>
        )}
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
    const timerRef = useRef(null);

    //стейты
    const [isProcessing, setIsProcessing] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    //нажатие на элемент списка
    const handleRootClick = (e) => {
      e.stopPropagation();
    };
  
    const handleChildClick = async () => {
      if (dataLoaded) return;
    };

    const handleAddIconClick = async (type) => {
      //добавить новую технологию
      console.log(type);
    };
    const classes = useStyles({ itemType: item.type});
    
    //дополнительный код
    const additionalItem = (
      <Box className={classes.technologyCustomClass} key={props.itemId} sx={{ display: 'flex', alignItems: 'center' }}>
          <span>{props.label}</span>
          { item.type == "add-technology" || item.type == "add-operation" ? (
            <StyledIconButton onClick={() => handleAddIconClick(item.type)} sx={{ marginLeft: '8px' }}>
              <StyledAddIcon />
            </StyledIconButton>
          ) : null
          }
      </Box>);
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
          },
        }}
        id={`StyledTreeItem2-${props.itemId}`}
        onClick={item.type === 'root' ? handleRootClick : handleChildClick}
        label={additionalItem}
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

  //запросы
  const drawingExternalCode = useSelector(selectDrawingExternalCode);//значение строки поиска (чертежей)

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
  //
  return (
    <>    
      <AppBar
          position="static"
          color="primary"
          elevation={0}
          sx={{ borderBottom: '0px solid rgba(0, 0, 0, 0.12)' }}
      >
          <Toolbar>
              <Typography color="inherit">
                  Технологии и операции
              </Typography>
          </Toolbar>
      </AppBar>
      <Box
          sx={{
              height: 254,
              overflowY: 'auto',
              overflowX: 'auto',
              border: '0px solid rgba(0, 0, 0, 0.12)'
          }}
      >
        {drawingExternalCode ? (
          <RichTreeView
            slots={{ item: renderCustomTreeItem }}          
            items={items}            
          />
        ) : (<>
          {/*<Card>
            
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Lizard
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Lizards are a widespread group of squamate reptiles, with over 6,000
                  species, ranging across all continents except Antarctica
                </Typography>
              </CardContent>
            
          </Card>*/}
          <RichTreeView
            slots={{ item: renderCustomTreeItem }}
            items={items}
        /></>
        ) }
               
      </Box>
    </>
  );

  /*return (
    <>
        <AppBar
            position="static"
            color="primary"
            elevation={0}
            sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
        >
            <Toolbar>
                <Typography color="inherit">
                    Технологии
                </Typography>
            </Toolbar>
        </AppBar>
        <Box>
          {MUI_X_PRODUCTS.length > 0 ? (
            <RichTreeView items={MUI_X_PRODUCTS} />
          ) : (
            <Typography sx={{ padding: 2 }}>
              Список технологий и операций
            </Typography>
          )}
            
        </Box>             
    </>
  );*/
}