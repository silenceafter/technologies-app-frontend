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

import { styled, alpha } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData, fetchItemDetails, setPage, setSearch, selectItems } from '../store/slices/drawingsAllTreeSlice';
import { selectSearch as selectSearchHeader } from '../store/slices/headerSlice';
import { split } from 'lodash';
import CircularProgress from '@mui/material/CircularProgress';
import ShowCircularProgress from './ShowCircularProgress';

export default function DrawingsAllTree() {
  const timerRef = useRef(null);
  const [expanded, setExpanded] = useState([]);

  const handleToggle = (nodeId) => {
    setExpanded((prevExpanded) =>
      prevExpanded.includes(nodeId)
        ? prevExpanded.filter((id) => id !== nodeId)
        : [...prevExpanded, nodeId]
    );
    /*if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setExpanded((prevExpanded) => {
      return prevExpanded.includes(nodeId)
        ? prevExpanded.filter((id) => id !== nodeId) // Если уже развернут — свернуть
        : [...prevExpanded, nodeId]; // Если свернут — развернуть
      }
    );
    }, 2000);*/ // Таймер на 2 секунды
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

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
    }),
    /*[`& .${treeItemClasses.disabled}`]: {
      opacity: 0.5,
      pointerEvents: `none`, 
      cursor: `not-allowed`,
      backgroundColor: `#f0f0f0`,
      color: `#a0a0a0`
    }*/
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
  
  const CustomTreeItem = React.forwardRef(function CustomTreeItem({ onToggle, isExpanded, ...props }, ref) {
    const dispatch = useDispatch();
    const items = useSelector((state) => state.drawingsAllTree.items);
    const { publicAPI } = useTreeItem2Utils({
      itemId: props.itemId,
      children: props.children,
    });
    const item = publicAPI.getItem(props.itemId);
    //[isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
      onToggle(props.itemId); // Вызываем toggle-функцию при клике
    };

    
  
    //нажатие на элемент списка
    const handleRootClick = (e) => {
      e.stopPropagation();
    };
  
    const handleChildClick = (e) => {
      e.preventDefault();
      //if (isLoading) return;
      //setIsLoading(true);
      //найти родительский элемент в items
      const findParent = (items, parentId) => {
        return items.find((item) => item.id === parentId);
      };
  
      try {
        const parent = findParent(items, item.parentId);
        //handleDelayedExpansion(parent.id);
        const product = parent.nizd;
        const modification = parent.mod;
        //
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
        })).finally(() => {
          /*setIsLoading(false);
          setIsExpanded(true);*/
        });
      } catch(error) {
        //уведомление об ошибке
        //setIsLoading(false);
      }
    };
    //
    console.log(`CustomTreeItem ${props.itemId} isExpanded:`, isExpanded);
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
          nodeId={props.itemId}
          onClick={/*item.type === 'root' ? handleRootClick : handleChildClick*/ handleClick}        
          expanded={isExpanded}
        >
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
  console.log("RichTreeView expanded:", expanded);
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
                onToggle={handleToggle}
                isExpanded={expanded.includes(props.itemId)}
              />
            ),
          }}
          items={items}
          /*onItemClick={handleItemClick}*/
          expanded={expanded}
        />
      </Box>       
    </>
  );
}