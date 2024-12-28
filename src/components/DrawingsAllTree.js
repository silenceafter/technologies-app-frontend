import React, { useEffect, useState, useRef } from 'react';
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
import { fetchData, fetchItemDetails, setPage, setSearch, selectItems } from '../store/slices/drawingsAllTreeSlice';
import { selectSearch as selectSearchHeader } from '../store/slices/headerSlice';
import { split } from 'lodash';
import CircularProgress from '@mui/material/CircularProgress';
import ShowCircularProgress from './ShowCircularProgress';
import Skeleton from '@mui/material/Skeleton';

export default function DrawingsAllTree() {
  const timerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);
  const [loadedItems, setLoadedItems] = useState([]);
  const MIN_LOADING_TIME = 1000;
  const itemRef = useRef(null);

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
  
  const CustomTreeItem = React.forwardRef(function CustomTreeItem({ isLoading, ...props }, ref) {
    const dispatch = useDispatch();
    const items = useSelector((state) => state.drawingsAllTree.items);
    const { publicAPI } = useTreeItem2Utils({
      itemId: props.itemId,
      children: props.children,
    });
    const item = publicAPI.getItem(props.itemId);

    //стейты
    const [expanded, setExpanded] = useState(false);
    const [loaded, setLoaded] = useState(false);
    //
    useEffect(() => {
      //expanded
      expandedItems.includes(props.itemId) 
        ? setExpanded(true) 
        : setExpanded(false);
      
      //loaded
      loadedItems.includes(props.itemId)
        ? setLoaded(true) 
        : setLoaded(false);

      //выполнение таймера
      /*if (timerCompleted) {
        setIsLoading(false);
      }*/
    }, [expandedItems, loadedItems, props.itemId]);

    //нажатие на элемент списка
    const handleRootClick = (e) => {
      e.stopPropagation();
    };
  
    const handleChildClick = async (e) => {
      if (loaded) return;
      setIsLoading(true);  

      //найти родительский элемент в items
      const findParent = (items, parentId) => {
        return items.find((item) => item.id === parentId);
      };
      
      const parent = findParent(items, item.parentId);
      const product = parent.nizd;
      const modification = parent.mod;

      /*timerRef.current = setTimeout(() => {
        clearTimeout(timerRef.current);
        setTimerCompleted(true);
        setIsLoading(false);
      }, MIN_LOADING_TIME);*/

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
                type: 'product',            
              },
              uncovered: [false, false]
            }
          }))
          .then(() => {
            //добавить элемент списка как загруженный
            setLoadedItems((prevLoaded) => {
              if (!prevLoaded.includes(props.itemId)) {
                return [...prevLoaded, props.itemId];
              }
              return prevLoaded;
            });
            resolve();
            })
          .catch((error) => reject(error));
          }),
            
          //таймер
          new Promise((resolve) => {
            setTimerCompleted(false);
            timerRef.current = setTimeout(() => {
              clearTimeout(timerRef.current);
              setTimerCompleted(true);
              setIsLoading(false);
              resolve();
            }, MIN_LOADING_TIME);
          }),
        ]);
      } catch(error) {
        //уведомление об ошибке
        clearTimeout(timerRef.current);
        setTimerCompleted(true);
        setIsLoading(false);
      } finally {
        //clearTimeout(timerRef.current);  // Очищаем таймер
        //setIsLoading(false);
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
        id={`treeitem-${props.itemId}`}
        onClick={item.type === 'root' ? handleRootClick : handleChildClick}        
        expanded={expanded}
        loaded={loaded}
      >
        { isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'auto',
              marginTop: '0rem',
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
  const items = useSelector((state) => state.drawingsAllTree.items);
  const limit = useSelector((state) => state.drawingsAllTree.limit);
  const page = useSelector((state) => state.drawingsAllTree.page);
  const hasMore = useSelector((state) => state.drawingsAllTree.hasMore);
  const loading = useSelector((state) => state.drawingsAllTree.loading);
  const error = useSelector((state) => state.drawingsAllTree.error);
  
  useEffect(() => {
    dispatch(fetchData({ limit, page }));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);//чистим обработчик при размонтировании
  }, [loading, hasMore]);

  //прокрутка RichTreeView
  const handleScroll = (event) => {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && !hasMore) {
        dispatch(setPage(page + 1));
        dispatch(fetchData({ limit, page: page + 1 }));
      }
  };

  const handleItemExpansionToggle = (event, nodeId, expanded) => {
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
  };

  //запросы
  //const searchHeader = useSelector(selectSearchHeader);//значение строки поиска (чертежей)
  //const search = useSelector(selectSearch);
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
      <AppBar
          position="static"
          color="primary"
          elevation={0}
          sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
      >
          <Toolbar>
              <Typography color="inherit">
                  Изделия
              </Typography>
          </Toolbar>
      </AppBar>
      <Box
          sx={{
              height: 323,
              overflowY: 'auto',
              overflowX: 'auto',
              border: '1px solid rgba(0, 0, 0, 0.12)',
          }}
          onScroll={handleScroll}
      >
        <RichTreeView
          slots={{ 
            item: (props) => (
              <CustomTreeItem
                {...props}
                isLoading={isLoading}
                /*expanded={expanded.includes(props.itemId)}*/
                /*nodeId={props.itemId}*/
                ref={itemRef}
              />
            ),
          }}
          items={items}
          /*expanded={expanded}*/
          onItemExpansionToggle={handleItemExpansionToggle}
        />
      </Box>
    </>
  );
}