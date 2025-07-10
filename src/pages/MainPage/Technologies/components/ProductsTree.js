import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import { Tabs, Tab } from '@mui/material';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import { useTreeItem2Utils } from '@mui/x-tree-view/hooks';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';

import { styled, alpha } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData, fetchItemDetails, setItems, setPage, setSearch, selectItems } from '../../../../store/slices/lists/productsListSlice';
import { selectDrawingExternalCode } from '../../../../store/slices/drawingsSlice';
import { split } from 'lodash';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import { current } from '@reduxjs/toolkit';
import InfiniteLoader from 'react-window-infinite-loader';
import AddIcon from '@mui/icons-material/Add';

export default function ProductsTree() {
  //const [expandedItems, setExpandedItems] = useState([]);
  const [loadedItems, setLoadedItems] = useState([]);
  const [download, setDownload] = useState(false);
  const MIN_LOADING_TIME = 500;
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
    const items = useSelector((state) => state.products.items);
    const { publicAPI } = useTreeItem2Utils({
      itemId: props.itemId,
      children: props.children,
    });
    const item = publicAPI.getItem(props.itemId);
    const timerRef = useRef(null);

    //стейты
    //const [expanded, setExpanded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    //
    /*useEffect(() => {
      //expanded
      expandedItems.includes(props.itemId)
        ? setExpanded(true)
        : setExpanded(false);
    }, [expandedItems, props.itemId]);*/

    //нажатие на элемент списка
    const handleRootClick = (e) => {
      e.stopPropagation();
    };
  
    const handleChildClick = async () => {
      if (dataLoaded) return;
      //найти родительский элемент в items
      const findParent = (items, parentId) => {
        return items.find((item) => item.id === parentId);
      };
      
      const parent = findParent(items, item.parentId);
      const product = parent.nizd;
      const modification = parent.mod;
      setIsProcessing(true);
      //
      try {
        await Promise.allSettled([
          new Promise((resolve, reject) => {
          dispatch(fetchItemDetails({
            parent: { id: parent.id },
            child: { id: item.id },
            subChild: { id: item.children[0].id },
            data: {
              products_nodes: {
                nizd: product,
                mod: modification,
                chtr: item.label,
                naim: item.secondaryLabel,
                type: 'product'
              },
              products: {
                nizd: product,
                mod: modification,
                kudar: item.label,
                naim: item.secondaryLabel,
                dtv: ''
              },
              kod: item.label
            },
            options: {
              components: false,
              materials: false,
              product_info: {            
                type: item.type,
              },
              uncovered: [false, false]
            }
          }))
          .then(() => {
            //добавить элемент списка как загруженный
            setLoadedItems((prevLoadedItems) => {
              if (!prevLoadedItems.includes(props.itemId)) {
                return [...prevLoadedItems, props.itemId];
              }
              return prevLoadedItems;
            });
            resolve();
            })
          .catch((error) => reject(error));
          }),
            
          //таймер
          new Promise((resolve) => {
            timerRef.current = setTimeout(() => {
              setDataLoaded(true);
              resolve('timerComplete');              
            }, MIN_LOADING_TIME);
          }),
        ]);
      } catch(error) {
        //уведомление об ошибке
      } finally {
        clearTimeout(timerRef.current);        
        setIsProcessing(false);
      }
    };
    //
    return (
      <StyledTreeItem2
        {...props}
        ref={ref}
        slots={{
          label: CustomLabel,
        }}
        slotProps={{
          label: { 
            secondaryLabel: item?.secondaryLabel || '',
          },
        }}
        id={`StyledTreeItem2-${props.itemId}`}
        onClick={item.type === 'root' ? handleRootClick : handleChildClick}
        /*expanded={expanded}*/        
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
    );
  });

  const dispatch = useDispatch();
  const items = useSelector((state) => state.products.items);
  const limit = useSelector((state) => state.products.limit);
  const page = useSelector((state) => state.products.page);
  const hasMore = useSelector((state) => state.products.hasMore);
  const loading = useSelector((state) => state.products.loading);
  const error = useSelector((state) => state.products.error);

  const memoizedItems = useMemo(() => items, [items]);
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
  
  useEffect(() => {
    dispatch(fetchData({ limit, page }));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);//чистим обработчик при размонтировании
  }, [loading, hasMore]);

  //прокрутка RichTreeView
  const handleScroll = async (event) => {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && hasMore) {
        setDownload(true);
        try {
          await Promise.allSettled([
            new Promise((resolve, reject) => {
              dispatch(setPage(page + 1));
              resolve();
            }),
            new Promise((resolve) => {
              dispatch(fetchData({ limit: limit, page: page + 1 }));
              resolve();
            }),
              
            //таймер
            new Promise((resolve) => {
              downloadRef.current = setTimeout(() => {
                //setDownload(true);
                resolve('timerComplete');              
              }, 2000);
            }),
          ]);
        } catch(error) {
          //уведомление об ошибке
        } finally {
          clearTimeout(downloadRef.current);
          setDownload(false);
        }                

        /*const previousScrollHeight = scrollHeight;
        const newScrollHeight = event.target.scrollHeight;
        const delta = newScrollHeight - previousScrollHeight;

        // Корректируем позицию прокрутки
        event.target.scrollTop = scrollTop + delta;*/
      }
  };

  /*const handleItemExpansionToggle = (event, nodeId, expanded) => {
    if (expanded) {
      setExpandedItems((prevExpanded) => {
        if (!prevExpanded.includes(nodeId)) {
          return [...prevExpanded, nodeId];
        }
        return prevExpanded;
      });
    } else {      
      setExpandedItems((prevExpanded) => prevExpanded.filter((id) => id !== nodeId));
    }
  };*/

  //запросы
  const drawingExternalCode = useSelector(selectDrawingExternalCode);//значение строки поиска (чертежей)
  //const search = useSelector(drawing);
  //const { items, loading, error } = useSelector((state) => state.drawingsAllTree);

  /*useEffect(() => {
    //загрузка данных при пустом поисковом запросе
    if (!search) {
      dispatch(fetchData({ search: searchHeader}));
    }
  }, [dispatch, search]);

  useEffect(() => {
    //поиск при изменении значения в поле ввода
    if (searchHeader !== search) {
      dispatch(setSearch(searchHeader));
    }
  }, [searchHeader, search, dispatch]);*/

  return (
    <>      
      <RichTreeView
        slots={{item: renderCustomTreeItem}}          
        items={memoizedItems}            
      />
        {download && (<CircularProgress size={50} />)}
    </>
  );
}