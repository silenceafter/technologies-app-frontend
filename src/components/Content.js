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
import { OperationsSearch } from './OperationsSearch';
import { ProfessionsSearch } from './ProfessionsSearch';
import { MeasuringToolsSearch } from './MeasuringToolsSearch';
import { RigSearch } from './RigSearch';
import { ComponentsSearch } from './ComponentsSearch';
import { MaterialsSearch } from './MaterialsSearch';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Content() {
  const [tabsValue, setTabsValue] = useState(0);
  const [bottomNavigationValue, setBottomNavigationValue] = useState(0);
  const [formErrors, setFormErrors] = useState({
    operationNumber1: '',
    operationCode2: '',
    workshopNumber3: '',
    workshopAreaNumber4: '',
    documentName5: '',
    professionCode6: '',
    workerCategory7: '',
    workerConditions8: '',
    numberEmployees9: '',
    numberProcessedParts10: '',
    toilsomeness11: '',
    operationDescription12: '',
    measuringTools13: '',
    rig14: '',
    components15: '',
    materials16: ''
  });
  const [loading, setLoading] = useState({ save: false });

  const handleTabsChange = (event, newValue) => {
    setTabsValue(newValue);
  };

  const handleSave = async () => {
    setLoading((prev) => ({ ...prev, save: true }));
    setOpen(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    //setShowAlert(true);//включить уведомление    
    
    setLoading((prev) => ({ ...prev, save: false }));
    //handleAlertClose();
  }

  const handleSubmit = (event) => {
    event.preventDefault();

  };

  //alert
  const [showAlert, setShowAlert] = useState(false);
  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
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
        height: '70vh',
        overflow: 'hidden'
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
          <Paper elevation={3} sx={{ width: '100%', height: 'auto', margin: '0', padding: '0', overflow: 'hidden', flexBasis: '60%', flexGrow: 0, flexShrink: 0 }}>
            <DrawingsAllTree />
          </Paper>
        </Box>   
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',     
          gap: 2,                   
          padding: 0,
          paddingBottom: 0,
          paddingRight: 0,
          backgroundColor: 'background.paper',
          borderRadius: 1,          
          boxShadow: 0,
          width: '100%',
          height: '100%',
        }}>
          <Paper elevation={3} sx={{ width: '100%', margin: 0, flexGrow: 1, overflow: 'auto' }}>
            <Box sx={{ overflow: 'hidden' }}>
              <AppBar component="div" position="static" elevation={0} sx={{ zIndex: 0 }}>
                <Tabs value={tabsValue} onChange={handleTabsChange} textColor="inherit">
                  <Tab label="Параметры" />
                  <Tab label="Описание операции" />
                  <Tab label="Мерительный инструмент" />
                  <Tab label="Оснастка" />
                  <Tab label="Комплектующие" />
                  <Tab label="Материалы" />
                </Tabs>
              </AppBar>
            </Box>            
            <Box sx={{           
              height: '91%',
              overflowY: 'auto',
              padding: 2,          
            }}>
              <form>
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
                          <OperationsSearch props={
                            {
                              id: "operation-code-2",
                              error: !!formErrors.operationCode2,
                              helpText: formErrors.operationCode2,
                              placeholder: "Код операции"
                            }
                          } />
                        </Grid>
                      </Grid>                  
                    </Grid>
                    {/* Третья строка */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={2.4}>
                          <TextField
                            required
                            id="workshop-number-3"
                            label="Номер цеха"
                            type="number"
                            size="small"
                          >
                          </TextField>
                        </Grid>
                        <Grid item xs={2.4}>
                          <TextField
                            id="workshop-area-number-4"
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
                            id="document-name-5"
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
                          <ProfessionsSearch />
                        </Grid>
                      </Grid>
                    </Grid>
                    {/* Шестая строка */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={2.4}>
                          <TextField
                            required
                            id="worker-category-7"
                            label="Разряд"
                            type="number"
                            size="small"
                          >
                          </TextField>
                        </Grid>
                        <Grid item xs={2.4}>
                          <TextField
                            required
                            id="worker-conditions-8"
                            label="Условия труда"
                            type="number"
                            size="small"
                          >
                          </TextField>
                        </Grid>
                        <Grid item xs={2.4}>
                          <TextField
                            required
                            id="number-employees-9"
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
                            id="number-processed-parts-10"
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
                            id="toilsomeness-11"
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
                            id="operation-description-12"
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
                          <MeasuringToolsSearch />
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
                          <RigSearch />
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
                          <ComponentsSearch />
                        </Grid>
                      </Grid>
                    </Grid>                  
                  </Grid>
                }
                {tabsValue === 5 &&
                  <Grid container spacing={2}>
                  {/* Первая строка */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={4.8}>
                          <MaterialsSearch />
                        </Grid>
                      </Grid>
                    </Grid>                  
                  </Grid>
                }
              </form>
              
              {/* уведомления */}
              <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} //нижний правый угол
              >
                <Alert
                  onClose={handleClose}
                  severity="success"
                  variant="filled"
                  sx={{ width: '100%' }}
                >
                  Успешно сохранено!
                </Alert>
              </Snackbar>
            </Box>
          </Paper>    
          <Box>
            <ButtonGroup variant="contained" aria-label="Loading button group">
              <LoadingButton loading={loading.save} onClick={handleSave}>Сохранить</LoadingButton>
              <Button>Предварительный просмотр</Button>
              <Button>Печать</Button>
              <LoadingButton>Экспорт в CSV</LoadingButton>
              <LoadingButton>Экспорт в XLSX</LoadingButton>
            </ButtonGroup>
          </Box>             
        </Box>
      </Box>      
    </>
  );
}