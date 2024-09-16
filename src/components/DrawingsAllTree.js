import * as React from 'react';
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

const MUI_X_PRODUCTS = [
    {
      id: 'grid',
      label: 'Data Grid',
      children: [
        { id: 'grid-community', label: '@mui/x-data-grid' },
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
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',     
          gap: 2,                   
          padding: 0,               
          backgroundColor: 'background.paper',
          borderRadius: 1,          
          boxShadow: 0,
          
          overflow: 'hidden'
        }}>
            <RichTreeView items={MUI_X_PRODUCTS} />
        </Box>             
    </>
  );
}