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
import { useSelector, useDispatch } from 'react-redux';
import { fetchData, setSearch, selectSearch } from '../store/slices/drawingsAllTreeSlice';
import { selectSearch as selectSearchHeader } from '../store/slices/headerSlice';

const MUI_X_PRODUCTS = [
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

  //запросы
  const searchHeader = useSelector(selectSearchHeader);//значение строки поиска (чертежей)
  const search = useSelector(selectSearch);
  const { items, loading, error } = useSelector((state) => state.drawingsAllTree);

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
                    Все чертежи
                </Typography>
            </Toolbar>
        </AppBar>
        <Box>
            <RichTreeView items={MUI_X_PRODUCTS} />
        </Box>             
    </>
  );
}