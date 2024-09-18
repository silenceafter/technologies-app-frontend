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

const MUI_X_PRODUCTS = [];

export default function DrawingTree() {
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
                    Чертеж
                </Typography>
            </Toolbar>
        </AppBar>
        <Box>
          {MUI_X_PRODUCTS.length > 0 ? (
            <RichTreeView items={MUI_X_PRODUCTS} />
          ) : (
            <Typography sx={{ padding: 2 }}>
              Выберите чертеж из списка
            </Typography>
          )}
            
        </Box>             
    </>
  );
}