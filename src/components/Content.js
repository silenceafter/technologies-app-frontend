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
import { ToolingSearch } from './ToolingSearch';
import { ComponentsSearch } from './ComponentsSearch';
import { MaterialsSearch } from './MaterialsSearch';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { TabPanel } from './TabPanel';
import { useDispatch, useSelector } from 'react-redux';
import { setUnsavedChanges } from '../store/slices/unsavedChangesSlice';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Content() {
  const dispatch = useDispatch();
  const hasUnsavedChanges = useSelector((state) => state.unsavedChanges.hasUnsavedChanges);

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
    tooling14: '',
    components15: '',
    materials16: ''
  });

  //значения ошибок (валидация)
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
    tooling14: '',
    components15: '',
    materials16: ''
  });

  //вкладки
  const [tabsValue, setTabsValue] = useState(0);
  const handleTabsChange = (event, newValue) => {
    setTabsValue(newValue);
  };

  //проверка формы
  const validateForm = () => {
    const errors = {};
    const textFieldMessage = 'Поле обязательно для заполнения';
    const autocompleteTextFieldMessage = 'Выберите значение из списка';

    //operationNumber1
    if (!formValues.operationNumber1) {
      errors.operationNumber1 = textFieldMessage;
    }

    //operationCode2
    if (!formValues.operationCode2) {
      errors.operationCode2 = autocompleteTextFieldMessage;
    }
    
    //workshopNumber3
    if (!formValues.workshopNumber3) {
      errors.workshopNumber3 = textFieldMessage;
    }

    //documentName5
    if (!formValues.documentName5) {
      errors.documentName5 = textFieldMessage;
    }

    //professionCode6
    if (!formValues.professionCode6) {
      errors.professionCode6 = autocompleteTextFieldMessage;
    }

    //workerCategory7
    if (!formValues.workerCategory7) {
      errors.workerCategory7 = textFieldMessage;
    }

    //workerConditions8
    if (!formValues.workerConditions8) {
      errors.workerConditions8 = textFieldMessage;
    }

    //numberEmployees9
    if (!formValues.numberEmployees9) {
      errors.numberEmployees9 = textFieldMessage;
    }

    //numberProcessedParts10
    if (!formValues.numberProcessedParts10) {
      errors.numberProcessedParts10 = textFieldMessage;
    }

    //toilsomeness11
    if (!formValues.toilsomeness11) {
      errors.toilsomeness11 = textFieldMessage;
    }

    //measuringTools13
    if (formValues.measuringTools13.length == 0) {
      errors.measuringTools13 = autocompleteTextFieldMessage;
    }

    //tooling14
    if (formValues.tooling14.length == 0) {
      errors.tooling14 = autocompleteTextFieldMessage;
    }

    //components15
    if (formValues.components15.length == 0) {
      errors.components15 = autocompleteTextFieldMessage;
    }

    //materials16
    if (formValues.materials16.length == 0) {
      errors.materials16 = autocompleteTextFieldMessage;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  //отправка
  const handleSuccess = () => {
    setRequestStatus('success');
    setOpen(true);
  };

  // Функция, имитирующая ошибку отправки
  const handleError = () => {
    setRequestStatus('error');
    setOpen(true);
  };

  //alert
  const [open, setOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState(false);
  const handleClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  //autocomplete
  const handleOptionSelect = (id, option) => {
    //задать значение в formValues
    const value = option ? option : null;
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [id]: value,
    }));

    //убрать ошибку в formErrors    
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [id]: '',
    }));
  };

  //buttonGroup
  const [loading, setLoading] = useState({ save: false });
  const handleSave = async () => {
    setLoading((prev) => ({ ...prev, save: true }));  
    await new Promise((resolve) => setTimeout(() => {
      setOpen(true);
      validateForm();
      setLoading((prev) => ({ ...prev, save: false }));
      dispatch(setUnsavedChanges(false));
    }, 2000));
  }

  //textField
  const handleInputChange = (e) => {
    //значения формы
    const { name, value } = e.target;    
    const errorMessage = numericFields.includes(name) && (value && !/^\d*$/.test(value))
      ? 'Это поле должно содержать только цифры'
      : undefined;
    //
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    dispatch(setUnsavedChanges(true));
  };
  //
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
                  <Tab label="Измерительный инструмент" />
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
                              error={formErrors.operationNumber1}
                              helperText={formErrors.operationNumber1 ? formErrors.operationNumber1 : ''}
                              value={formValues.operationNumber1}
                              slotProps={{
                                formHelperText: {
                                  sx: { whiteSpace: 'nowrap' },
                                },
                              }}
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
                                placeholder: "Код операции"
                              }
                            }
                            id="operationCode2" onOptionSelect={handleOptionSelect}
                              selectedValue={ formValues['operationCode2'] ? formValues['operationCode2'] : null} errorValue={formErrors['operationCode2']} />
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
                              onChange={handleInputChange}
                              error={formErrors.workshopNumber3}
                              helperText={formErrors.workshopNumber3 ? formErrors.workshopNumber3 : ''}
                              value={formValues.workshopNumber3}
                              slotProps={{
                                formHelperText: {
                                  sx: { whiteSpace: 'nowrap' },
                                },
                              }}
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
                              onChange={handleInputChange}
                              value={formValues.workshopAreaNumber4}
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
                              onChange={handleInputChange}
                              error={formErrors.documentName5}
                              helperText={formErrors.documentName5 ? formErrors.documentName5 : ''}
                              value={formValues.documentName5}
                              slotProps={{
                                formHelperText: {
                                  sx: { whiteSpace: 'nowrap' },
                                },
                              }}
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
                              selectedValue={formValues['professionCode6'] ? formValues['professionCode6'] : null} errorValue={formErrors['professionCode6']} />
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
                              onChange={handleInputChange}
                              error={formErrors.workerCategory7}
                              helperText={formErrors.workerCategory7 ? formErrors.workerCategory7 : ''}
                              value={formValues.workerCategory7}
                              slotProps={{
                                formHelperText: {
                                  sx: { whiteSpace: 'nowrap' },
                                },
                              }}
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
                              onChange={handleInputChange}
                              error={formErrors.workerConditions8}
                              helperText={formErrors.workerConditions8 ? formErrors.workerConditions8 : ''}
                              value={formValues.workerConditions8}
                              slotProps={{
                                formHelperText: {
                                  sx: { whiteSpace: 'nowrap' },
                                },
                              }}
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
                              onChange={handleInputChange}
                              error={formErrors.numberEmployees9}
                              helperText={formErrors.numberEmployees9 ? formErrors.numberEmployees9 : ''}
                              value={formValues.numberEmployees9}
                              slotProps={{
                                formHelperText: {
                                  sx: { whiteSpace: 'nowrap' },
                                },
                              }}
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
                              onChange={handleInputChange}
                              error={formErrors.numberProcessedParts10}
                              helperText={formErrors.numberProcessedParts10 ? formErrors.numberProcessedParts10 : ''}
                              value={formValues.numberProcessedParts10}
                              slotProps={{
                                formHelperText: {
                                  sx: { whiteSpace: 'nowrap' },
                                },
                              }}
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
                              onChange={handleInputChange}
                              error={formErrors.toilsomeness11}
                              helperText={formErrors.toilsomeness11 ? formErrors.toilsomeness11 : ''}
                              value={formValues.toilsomeness11}
                              slotProps={{
                                formHelperText: {
                                  sx: { whiteSpace: 'nowrap' },
                                },
                              }}
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
                    <Grid container spacing={2} >
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
                  <Grid container spacing={2} sx={{ padding: '24px 24px'}}>
                  {/* Первая строка */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={4.8}>
                          <MeasuringToolsSearch id="measuringTools13" 
                            onOptionSelect={handleOptionSelect} selectedValue={formValues['measuringTools13'] ? formValues['measuringTools13'] : []}
                            errorValue={formErrors['measuringTools13']} />
                        </Grid>
                      </Grid>                    
                    </Grid>             
                  </Grid>
                }
                {tabsValue === 3 &&
                  <Grid container spacing={2} sx={{ padding: '24px 24px'}}>
                  {/* Первая строка */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={4.8}>
                          <ToolingSearch id="tooling14" onOptionSelect={handleOptionSelect}
                            selectedValue={formValues['tooling14'] ? formValues['tooling14'] : []} errorValue={formErrors['tooling14']} />
                        </Grid>
                      </Grid>                    
                    </Grid>             
                  </Grid>
                }
                {tabsValue === 4 &&
                  <Grid container spacing={2} sx={{ padding: '24px 24px'}}>
                  {/* Первая строка */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={4.8}>
                          <ComponentsSearch id="components15" onOptionSelect={handleOptionSelect}
                            selectedValue={formValues['components15'] ? formValues['components15'] : []} errorValue={formErrors['components15']} />
                        </Grid>
                      </Grid>
                    </Grid>                  
                  </Grid>
                }
                {tabsValue === 5 &&
                  <Grid container spacing={2} sx={{ padding: '24px 24px'}}>
                  {/* Первая строка */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={4.8}>
                          <MaterialsSearch id="materials16" onOptionSelect={handleOptionSelect}
                            selectedValue={formValues['materials16'] ? formValues['materials16'] : []} errorValue={formErrors['materials16']} />
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
                  severity={requestStatus === 'success' ? 'success' : 'error'}
                  variant="filled"
                  sx={{ width: '100%' }}
                >
                  {requestStatus === 'success' ? 'Успешно сохранено!' : 'Ошибка при отправке!'}
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