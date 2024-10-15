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
import { TabPanel } from './TabPanel';

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

  //список числовых полей (для последующей валидации вместо type="number")
  const numericFields = [
    'operationNumber1', 
    'workshopNumber3', 
    'workshopAreaNumber4',
    'workerCategory7',
    'workerConditions8',
    'numberEmployees9',
    'numberProcessedParts10',
    'toilsomeness11'
  ];

  //значения полей формы
  const [formValues, setFormValues] = useState({
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

  const handleInputChange = (e) => {
    //значения формы
    const { name, value } = e.target;    
    setFormValues((prevValues) => {
      if (numericFields.includes(name)) {
        if (value && !/^\d*$/.test(value)) {
          return prevValues;
        }
      }
      return { ...prevValues, [name]: value };
    });
  };

  const [loading, setLoading] = useState({ save: false });

  const handleTabsChange = (event, newValue) => {
    setTabsValue(newValue);
  };

  const handleSave = async () => {
    setLoading((prev) => ({ ...prev, save: true }));
    setOpen(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading((prev) => ({ ...prev, save: false }));
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    if (form.checkValidity() === false) {
      // Если форма невалидна, выведем сообщение
      alert('Некоторые обязательные поля не заполнены!');
    } else {
      // Форма валидна, выполняем дальнейшие действия
      alert('Все обязательные поля заполнены!');
    }
  };

  //alert
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

  //autocomplete
  const [selectedOptions, setSelectedOptions] = useState({});
  const handleOptionSelect = (id, option) => {
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [id]: option,
    }));
    console.log(selectedOptions);
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
              <form onSubmit={handleSubmit}>
                {tabsValue === 0 && 
                  <TabPanel value={tabsValue} index={0}>
                    <Grid container spacing={2}>
                      {/* Первая строка */}
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          <Grid item xs={2.4}>
                            <TextField
                              required
                              name='operationNumber1'
                              id="operation-number-1"
                              label="Номер операции"
                              type="text"
                              size="small"
                              onChange={handleInputChange}
                              value={formValues.operationNumber1}
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
                            }
                            id="operationCode2" onOptionSelect={handleOptionSelect}
                              selectedValue={selectedOptions['operationCode2']} />
                          </Grid>
                        </Grid>                  
                      </Grid>
                      {/* Третья строка */}
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          <Grid item xs={2.4}>
                            <TextField
                              required
                              name='workshopNumber3'
                              id="workshop-number-3"
                              label="Номер цеха"
                              type="text"
                              size="small"
                            >
                            </TextField>
                          </Grid>
                          <Grid item xs={2.4}>
                            <TextField
                              name='workshopAreaNumber4'
                              id="workshop-area-number-4"
                              label="Номер участка"
                              type="text"
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
                              name='documentName5'
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
                            <ProfessionsSearch id="professionCode6" onOptionSelect={handleOptionSelect} 
                              selectedValue={selectedOptions['professionCode6']} />
                          </Grid>
                        </Grid>
                      </Grid>
                      {/* Шестая строка */}
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          <Grid item xs={2.4}>
                            <TextField
                              required
                              name='workerCategory7'
                              id="worker-category-7"
                              label="Разряд"
                              type="text"
                              size="small"
                            >
                            </TextField>
                          </Grid>
                          <Grid item xs={2.4}>
                            <TextField
                              required
                              name='workerConditions8'
                              id="worker-conditions-8"
                              label="Условия труда"
                              type="text"
                              size="small"
                            >
                            </TextField>
                          </Grid>
                          <Grid item xs={2.4}>
                            <TextField
                              required
                              name='numberEmployees9'
                              id="number-employees-9"
                              label="Кол-во работающих"
                              type="text"
                              size="small"
                            >
                            </TextField>
                          </Grid>
                          <Grid item xs={4.8}>
                            <TextField
                              required
                              fullWidth
                              name='numberProcessedParts10'
                              id="number-processed-parts-10"
                              label="Кол-во одновременно обрабатываемых деталей"
                              type="text"
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
                              name='toilsomeness11'
                              id="toilsomeness-11"
                              label="Трудоемкость"
                              type="text"
                              size="small"
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                      </Grid>                  
                    </Grid>   
                  </TabPanel>     
                }
                {tabsValue === 1 && 
                  <TabPanel value={tabsValue} index={1}>
                    <Grid container spacing={2}>
                    {/* Первая строка */}
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          <Grid item xs={4.8}>
                            <TextField                          
                              multiline
                              fullWidth
                              rows={8}
                              name='operationDescription12'
                              id="operation-description-12"
                              label="Описание операции"
                              size="small"
                            >
                            </TextField>
                          </Grid>
                        </Grid>                    
                      </Grid>             
                    </Grid>
                  </TabPanel>
                }
                {tabsValue === 2 && 
                  <Grid container spacing={2}>
                  {/* Первая строка */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={4.8}>
                          <MeasuringToolsSearch id="measuringTools13" 
                            onOptionSelect={handleOptionSelect} selectedValue={selectedOptions['measuringTools13']} />
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
                          <RigSearch id="rig14" onOptionSelect={handleOptionSelect}
                            selectedValue={selectedOptions['rig14']} />
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
                          <ComponentsSearch id="components15" onOptionSelect={handleOptionSelect}
                            selectedValue={selectedOptions['components15']} />
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
                          <MaterialsSearch id="materials16" onOptionSelect={handleOptionSelect}
                            selectedValue={selectedOptions['materials16']} />
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