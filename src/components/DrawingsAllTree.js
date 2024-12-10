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
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { styled, alpha } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData, setPage, setSearch, selectItems } from '../store/slices/drawingsAllTreeSlice';
import { selectSearch as selectSearchHeader } from '../store/slices/headerSlice';

const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
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
}));

let MUI_X_PRODUCTS = [
    {
      id: 'grid',
      label: 'Data Grid',
      children: [
        { id: 'grid-community', label: '@mui/x-data-grid', children: [ { id: 'id1', label: 'label-id1'} ] },
        { id: 'grid-pro', label: '@mui/x-data-grid-pro' },
        { id: 'grid-premium', label: '@mui/x-data-grid-premium' },
      ],
    },
    {
      id: 'pickers',
      label: 'Date and Time Pickers',
      children: [
        { id: 'pickers-community', label: '@mui/x-date-pickers' },
        { id: 'pickers-pro', label: '@mui/x-date-pickers-pro' },
      ],
    },
    {
      id: 'charts',
      label: 'Charts',
      children: [{ id: 'charts-community', label: '@mui/x-charts' }],
    },
    {
      id: 'tree-view',
      label: 'Tree View',
      children: [{ id: 'tree-view-community', label: '@mui/x-tree-view' }],
    },
  ];

export default function DrawingsAllTree() {
  const dispatch = useDispatch();
  let items = useSelector((state) => state.drawingsAllTree.items);
  if (typeof items == 'object') {
    
    MUI_X_PRODUCTS = items;
  }

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
            defaultExpandedItems={['grid']}
            slots={{ item: CustomTreeItem }}
            items={MUI_X_PRODUCTS}
          />
      </Box>       
    </>
  );
}