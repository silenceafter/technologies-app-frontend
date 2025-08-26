import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import { useTreeItem2Utils } from '@mui/x-tree-view/hooks';

import { styled, alpha } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData, fetchItemDetails, setPage, resetProducts } from '../../../../store/slices/productsSlice';
import CircularProgress from '@mui/material/CircularProgress';
import WarningIcon from '@mui/icons-material/Warning';

export default function ProductsTree() {
  const dispatch = useDispatch();

  //константы
  const MIN_LOADING_TIME = 500;

  //стейты
  const [loadedItems, setLoadedItems] = useState([]);
  const [download, setDownload] = useState(false);
  
  //селекторы
  const items = useSelector((state) => state.products.items);
  const limit = useSelector((state) => state.products.limit);
  const page = useSelector((state) => state.products.page);
  const hasMore = useSelector((state) => state.products.hasMore);
  const loading = useSelector((state) => state.products.loading);
  const error = useSelector((state) => state.products.error);
  const drawing = useSelector((state) => state.drawings.drawing);
  
  //рефы
  const itemRef = useRef(null);
  const downloadRef = useRef(null);
  
  //эффекты
  useEffect(() => {
    if (drawing) {
      dispatch(resetProducts());
      dispatch(fetchData({ drawing: drawing, limit: limit, page: page }));
    }    
  }, [drawing]);

  /*useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);//чистим обработчик при размонтировании
  }, [loading, hasMore]);*/
  
  //события
  const handleScroll = async (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && hasMore) { /* 50 */
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
    const { publicAPI } = useTreeItem2Utils({
      itemId: props.itemId,
      children: props.children,
    });
    const item = publicAPI.getItem(props.itemId);
    
    //стейты
    const [isProcessing, setIsProcessing] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    
    //селекторы
    const items = useSelector((state) => state.products.items);

    //рефы
    const timerRef = useRef(null);

    //события
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

  //вывод
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          py: 5, 
          position: 'absolute', 
          zIndex: '1000', 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)", 
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }
  //
  return (
    <>
      {items.length > 0 ? (
        <>   
          <RichTreeView
            slots={{item: renderCustomTreeItem}}          
            items={memoizedItems}            
          />
          {loading && (
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
              <CircularProgress size={50} />
            </Box>
          )}
        </>
      ) : (
        <Box
          sx={{ display: 'flex', flexDirection: 'row', gap: 2}}
        >
          <WarningIcon color='warning' />
          <Typography>Нет записей</Typography>
        </Box>
      )}
    </>
  );
}