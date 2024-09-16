import React, { useState } from 'react';
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
import { ButtonGroup, Tabs, Tab } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DrawingTree from './DrawingTree';
import DrawingsAllTree from './DrawingsAllTree';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

export default function Content() {
  const [tabsValue, setTabsValue] = useState(0);
  const [bottomNavigationValue, setBottomNavigationValue] = useState(0);
  const handleTabsChange = (event, newValue) => {
    setTabsValue(newValue);
  };

  return (
    <>
    <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',     
        gap: 2,                   
        padding: 2,               
        backgroundColor: 'background.paper',
        borderRadius: 1,          
        boxShadow: 1,
        height: '100%'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',     
          gap: 2,                   
          padding: 0,
          paddingBottom: 2,               
          backgroundColor: 'background.paper',
          borderRadius: 1,          
          boxShadow: 0,
          width: '40%',
          height: '100%'
        }}>
          <Paper elevation={3} sx={{ width: '100%', height: 'auto', margin: '0', padding: '0', overflow: 'hidden', flexBasis: '40%', flexGrow: 0, flexShrink: 0 }}>
            <DrawingTree />
          </Paper>
          <Paper elevation={3} sx={{ width: '100%', height: 'auto', margin: '0', overflow: 'hidden', flexBasis: '60%', flexGrow: 0, flexShrink: 0 }}>
            <DrawingsAllTree />
          </Paper>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',     
          gap: 2,                   
          padding: 0,               
          backgroundColor: 'background.paper',
          borderRadius: 1,          
          boxShadow: 0,
          width: '100%',
          height: '100%'
        }}>
          <Paper elevation={3} sx={{ width: '100%', height: '100%', margin: 0, position: 'relative' }}>
          <Box sx={{
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              overflow: 'hidden',
    
            }}>
            <AppBar component="div" position="static" elevation={0} sx={{ zIndex: 0 }}>
              <Tabs value={tabsValue} onChange={handleTabsChange} textColor="inherit">
                <Tab label="Параметры" />
                <Tab label="Описание операции" />
                <Tab label="Мерительный инструмент" />
                <Tab label="Оснастка" />
                <Tab label="Материалы" />
              </Tabs>
            </AppBar>
          </Box>
            <Box sx={{           
              maxHeight: '350px',
              overflowY: 'auto',
              paddingTop: 2,
              paddingLeft: 2
            }}>
              {tabsValue === 0 && 
                <Grid container spacing={2}>
                  {/* Первая строка */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={2.4}>
                        <TextField
                          required
                          id="operation-number-1"
                          label="Номер операции"
                          type="number"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                    </Grid>                    
                  </Grid>
                  {/* Вторая строка */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={4.8}>                      
                        <TextField
                            required
                            fullWidth
                            id="operation-number-2"
                            label="Код операции"
                            type="search"    
                            size="small"                        
                          >
                          </TextField>   
                      </Grid>
                    </Grid>                  
                  </Grid>
                  {/* Третья строка */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={2.4}>
                        <TextField
                          required
                          id="operation-number-3"
                          label="Номер цеха"
                          type="number"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                      <Grid item xs={2.4}>
                        <TextField
                          id="operation-number-4"
                          label="Номер участка"
                          type="number"
                          size="small"
                        >
                        </TextField>
                      </Grid>                      
                    </Grid>                    
                  </Grid>
                  {/* Четвертая строка */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={4.8}>
                        <TextField
                          required
                          fullWidth
                          id="operation-number-5"
                          label="Обозначение документа"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* Пятая строка */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={4.8}>
                        <TextField
                          required
                          fullWidth
                          id="operation-number-6"
                          label="Код профессии"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* Шестая строка */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={2.4}>
                        <TextField
                          required
                          id="operation-number-7"
                          label="Разряд"
                          type="number"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                      <Grid item xs={2.4}>
                        <TextField
                          required
                          id="operation-number-8"
                          label="Условия труда"
                          type="number"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                      <Grid item xs={2.4}>
                        <TextField
                          required
                          id="operation-number-9"
                          label="Кол-во работающих"
                          type="number"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                      <Grid item xs={4.8}>
                        <TextField
                          required
                          fullWidth
                          id="operation-number-10"
                          label="Кол-во одновременно обрабатываемых деталей"
                          type="number"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* Седьмая строка */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={2.4}>
                        <TextField
                          required
                          id="operation-number-10"
                          label="Трудоемкость"
                          type="number"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                    </Grid>
                  </Grid>                  
                </Grid>        
              }
              {tabsValue === 1 && 
                <Grid container spacing={2}>
                {/* Первая строка */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={4.8}>
                        <TextField
                          multiline
                          fullWidth
                          rows={8}
                          id="operation-number-11"
                          label="Описание операции"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                    </Grid>                    
                  </Grid>             
                </Grid>  
              }
              {tabsValue === 2 && 
                <Grid container spacing={2}>
                {/* Первая строка */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={4.8}>
                        <TextField
                          required
                          fullWidth
                          id="operation-number-12"
                          label="Мерительный инструмент"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                    </Grid>                    
                  </Grid>             
                </Grid>
              }
              {tabsValue === 3 &&
                <Grid container spacing={2}>
                {/* Первая строка */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={4.8}>
                        <TextField
                          required
                          fullWidth
                          id="operation-number-13"
                          label="Оснастка"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                    </Grid>                    
                  </Grid>             
                </Grid>
              }
              {tabsValue === 4 &&
                <Grid container spacing={2}>
                {/* Первая строка */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={4.8}>
                        <TextField
                          required
                          fullWidth
                          id="operation-number-14"
                          label="Материалы"
                          size="small"
                        >
                        </TextField>
                      </Grid>
                    </Grid>                    
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={2.4}>
                        <Button variant='contained' color='primary' size='medium'>
                          Сохранить изменения
                        </Button>
                      </Grid>
                    </Grid>                    
                  </Grid>
                </Grid>
              }      
            </Box>        
          </Paper>                 
          <ButtonGroup variant="contained" aria-label="Loading button group">
            <LoadingButton>Сохранить</LoadingButton>
            <Button>Печать</Button>
            <LoadingButton>Экспорт в XLSX</LoadingButton>
          </ButtonGroup>                 
        </Box>
      </Box>
    </>
  );
}