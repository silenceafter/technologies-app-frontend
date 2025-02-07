import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Divider, Typography } from '@mui/material';
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
import TechnologiesTree from './TechnologiesTree';
import ProductsTree from './ProductsTree';
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

import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

export function OperationCard({orderNumber, content, onUpdate}) {
  //стейты
  const [localData, setLocalData] = useState(content || { formValues: { orderNumber: 1 }, formErrors: {} });

  //список числовых полей (для последующей валидации вместо type="number")
  const numericFields = [
    'orderNumber', 
    'shopNumber', 
    'areaNumber',
    'grade',
    'workingConditions',
    'numberOfWorkers',
    'numberOfProcessedParts',
    'laborEffort'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    //formValues
    setLocalData((prev) => ({
      ...prev,
      formValues: {
        ...prev.formValues,
        [name]: value,
      },      
    }));

    //formErrors
    const errorMessage = numericFields.includes(name) && (value && !/^\d*$/.test(value))
      ? 'Это поле должно содержать только цифры'
      : undefined;

    //обновляем ошибки
    setLocalData((prev) => ({
      ...prev,
      formErrors: {
        ...prev.formErrors,
        [name]: errorMessage,
      },
    }));

    //передать изменения в родительский компонент
    if (onUpdate) {
      onUpdate(
        { 
          ...localData, 
          formValues: 
          { 
            ...localData.formValues, 
            [name]: value 
          }, 
          formErrors: 
          { 
            ...localData.formErrors, 
            [name]: errorMessage 
          } 
        }
      );
    }
  };

  const handleOptionSelect = (id, option) => {
    // Обновляем значение поля
    setLocalData((prev) => ({
      ...prev,
      formValues: {
        ...prev.formValues,
        [id]: option || null,
      },
    }));
  
    // Убираем ошибку для этого поля
    setLocalData((prev) => ({
      ...prev,
      formErrors: {
        ...prev.formErrors,
        [id]: '',
      },
    }));
  
    // Передаем изменения в родительский компонент
    if (onUpdate) {
      onUpdate({ ...localData, formValues: { ...localData.formValues, [id]: option || null }, formErrors: { ...localData.formErrors, [id]: '' } });
    }
  };

  //проверка формы
  const validateForm = () => {
    const errors = {};
    const textFieldMessage = 'Поле обязательно для заполнения';
    const autocompleteTextFieldMessage = 'Выберите значение из списка';

    //orderNumber
    if (!localData.formValues.orderNumber) {
      errors.orderNumber = textFieldMessage;
    }

    //operationCode
    if (!localData.formValues.operationCode) {
      errors.operationCode = autocompleteTextFieldMessage;
    }
    
    //shopNumber
    if (!localData.formValues.shopNumber) {
      errors.shopNumber = textFieldMessage;
    }

    //document
    if (!localData.formValues.document) {
      errors.document = textFieldMessage;
    }

    //jobCode
    if (!localData.formValues.jobCode) {
      errors.jobCode = autocompleteTextFieldMessage;
    }

    //grade
    if (!localData.formValues.grade) {
      errors.grade = textFieldMessage;
    }

    //workingConditions
    if (!localData.formValues.workingConditions) {
      errors.workingConditions = textFieldMessage;
    }

    //numberOfWorkers
    if (!localData.formValues.numberOfWorkers) {
      errors.numberOfWorkers = textFieldMessage;
    }

    //numberOfProcessedParts
    if (!localData.formValues.numberOfProcessedParts) {
      errors.numberOfProcessedParts = textFieldMessage;
    }

    //laborEffort
    if (!localData.formValues.laborEffort) {
      errors.laborEffort = textFieldMessage;
    }

    // Обновляем ошибки
    setLocalData((prev) => ({
      ...prev,
      formErrors: errors,
    }));
    return Object.keys(errors).length === 0;
  };

  //textField
  /* handleInputChange = (e) => {
    //dispatch(setUnsavedChanges(true));
  };*/
  return (
    <>
      {console.log(localData)}
      {/* Параметры */}
      <Accordion defaultExpanded elevation={3} sx={{ bgcolor: 'white', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#101F33', color: 'white' }}
        >
          <Typography component="span">Параметры</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto', minHeight: '16.5rem', maxHeight: '35rem'}}>           
          <form>
            <Grid container spacing={2} columns={{xs:5}}>
              {/* Первая строка */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={2.4}>
                    <TextField                          
                      fullWidth                          
                      name='orderNumber'
                      id="order-number-1"
                      label="Номер операции"
                      type="text"
                      size="small"
                      onChange={handleInputChange}
                      error={!!localData.formErrors.orderNumber}
                      helperText={localData.formErrors.orderNumber}
                      value={localData.formValues.orderNumber || ''}
                      slotProps={{
                        formHelperText: {
                          sx: { whiteSpace: 'nowrap' },
                        },
                        input: { readOnly: false }
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
                    {/*<OperationsSearch props={
                      {
                        id: "operation-code-2",
                        placeholder: "Код операции"
                      }
                    }
                    id="operationCode" onChange={(e) => handleOptionSelect('operationCode', e.target.value)}
                      selectedValue={ formValues['operationCode'] ? formValues['operationCode'] : null} errorValue={formErrors['operationCode']} />*/}
                  </Grid>
                </Grid>                  
              </Grid>
              {/* Третья строка */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={2.4}>
                    <TextField
                      required
                      fullWidth
                      name='shopNumber'
                      id="shop-number-3"
                      label="Номер цеха"
                      type="text"
                      size="small"
                      onChange={handleInputChange}
                      error={!!localData.formErrors.shopNumber}
                      helperText={localData.formErrors.shopNumber}
                      value={localData.formValues.shopNumber || ''}
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
                      fullWidth
                      name='areaNumber'
                      id="area-number-4"
                      label="Номер участка"
                      type="text"
                      size="small"
                      onChange={handleInputChange}
                      value={localData.formValues.areaNumber || ''}
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
                      name='document'
                      id="document-5"
                      label="Обозначение документа"
                      size="small"
                      onChange={handleInputChange}
                      error={!!localData.formErrors.document}
                      helperText={localData.formErrors.document}
                      value={localData.formValues.document || ''}
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
                    {/*<ProfessionsSearch id="job-code-6" onOptionSelect={handleSOptionSelect} 
                      selectedValue={formValues['jobCode'] ? formValues['jobCode'] : null} errorValue={formErrors['jobCode']} />*/}
                  </Grid>
                </Grid>
              </Grid>
              {/* Шестая строка */}
              <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={2.4}>
                        <TextField
                          required
                          fullWidth
                          name='grade'
                          id="grade-7"
                          label="Разряд"
                          type="text"
                          size="small"
                          onChange={handleInputChange}
                          error={!!localData.formErrors.grade}
                          helperText={localData.formErrors.grade}
                          value={localData.formValues.grade || ''}
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
                          fullWidth
                          name='workingConditions'
                          id="working-conditions-8"
                          label="Условия труда"
                          type="text"
                          size="small"
                          onChange={handleInputChange}
                          error={!!localData.formErrors.workingConditions}
                          helperText={localData.formErrors.workingConditions}
                          value={localData.formValues.workingConditions || ''}
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
                          fullWidth
                          name='numberOfWorkers'
                          id="number-of-workers-9"
                          label="Кол-во работающих"
                          type="text"
                          size="small"
                          onChange={handleInputChange}
                          error={!!localData.formErrors.numberOfWorkers}
                          helperText={localData.formErrors.numberOfWorkers}
                          value={localData.formValues.numberOfWorkers || ''}
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
                          name='numberOfProcessedParts'
                          id="number-of-processed-parts-10"
                          label="Кол-во одновременно обрабатываемых деталей"
                          type="text"
                          size="small"
                          onChange={handleInputChange}
                          error={!!localData.formErrors.numberOfProcessedParts}
                          helperText={localData.formErrors.numberOfProcessedParts}
                          value={localData.formValues.numberOfProcessedParts || ''}
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
                      fullWidth
                      name='laborEffort'
                      id="labor-effort-11"
                      label="Трудоемкость"
                      type="text"
                      size="small"
                      onChange={handleInputChange}
                      error={!!localData.formErrors.laborEffort}
                      helperText={localData.formErrors.laborEffort}
                      value={localData.formValues.laborEffort || ''}
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
          </form>              
        </AccordionDetails>
      </Accordion>        
      
      {/* Оборудование */}
      <Accordion defaultExpanded elevation={3} sx={{ bgcolor: 'white', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#101F33', color: 'white' }}
        >
          <Typography component="span">Оборудование</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto'}}>
          <form>                      
          </form>              
        </AccordionDetails>
      </Accordion>

      {/* Комплектующие */}
      <Accordion defaultExpanded elevation={3} sx={{ bgcolor: 'white', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#101F33', color: 'white' }}
        >
          <Typography component="span">Комплектующие</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto'}}>
          <form>                      
          </form>              
        </AccordionDetails>
      </Accordion>

      {/* Материалы */}
      <Accordion defaultExpanded elevation={3} sx={{ bgcolor: 'white', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#101F33', color: 'white' }}
        >
          <Typography component="span">Материалы</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto'}}>
          <form>                      
          </form>              
        </AccordionDetails>
      </Accordion>
      
      {/* Описание операции */}
      <Accordion defaultExpanded elevation={3} sx={{ bgcolor: 'white', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#101F33', color: 'white' }}
        >
          <Typography component="span">Описание операции</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto'}}>
          <form>
            <Grid container spacing={2} columns={{xs:5}} >
              {/* Первая строка */}
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={4.8}>
                      <TextField                          
                        multiline
                        fullWidth
                        minRows={8}
                        maxRows={16}
                        name='operationDescription'
                        id="operation-description-12"
                        label="Описание операции"
                        size="small"
                        sx={{ resize: 'both', overflow: 'auto' }}
                      >
                      </TextField>
                    </Grid>
                  </Grid>                    
                </Grid>             
            </Grid>
          </form>              
        </AccordionDetails>
      </Accordion>
      
      {/* Оснастка */}
      <Accordion defaultExpanded elevation={3} sx={{ bgcolor: 'white', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#101F33', color: 'white' }}
        >
          <Typography component="span">Оснастка</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto'}}>
          <form>                      
          </form>              
        </AccordionDetails>
      </Accordion>

      {/* Измерительный инструмент */}
      <Accordion defaultExpanded elevation={3} sx={{ bgcolor: 'white', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#101F33', color: 'white' }}
        >
          <Typography component="span">Измерительный инструмент</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto'}}>           
          <form>
            <Grid container spacing={2} sx={{ padding: '24px 24px'}}>
            {/* Первая строка */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4.8}>
                    {/*<MeasuringToolsSearch id="measuringTools13" 
                      onOptionSelect={handleOptionSelect} selectedValue={formValues['measuringTools13'] ? formValues['measuringTools13'] : []}
                      errorValue={formErrors['measuringTools13']} />*/}
                  </Grid>
                </Grid>                    
              </Grid>             
          </Grid>
          </form>              
        </AccordionDetails>
      </Accordion>                                                          
    </>
  );
}