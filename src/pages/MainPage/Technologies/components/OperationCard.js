import React, { useState, useEffect, useCallback } from 'react';
import { Accordion, Button, Grid, Grid2, TextField, Typography } from '@mui/material';
import { OperationsSearch } from './search/OperationsSearch';
import { JobsSearch } from './search/JobsSearch';
import { EquipmentSearch } from './search/EquipmentSearch';
import { MaterialsSearch } from './search/MaterialsSearch';
import { ComponentsSearch } from './search/ComponentsSearch';
import { ToolingSearch } from './search/ToolingSearch';
import { MeasuringToolsSearch } from './search/MeasuringToolsSearch';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import _ from 'lodash';

const OperationCard = React.memo(({content, onUpdate, autocompleteOptions, access}) => {
  //стейты
  const [localData, setLocalData] = useState({
      dbValues: { orderNumber: 1, },
      formValues: { 
        orderNumber: 0,
        operationCode: { code: '', name: '' }, 
        shopNumber: 0, /* '' */
        areaNumber: null, 
        document: null, 
        operationDescription: null,
        grade: 0, 
        workingConditions: 0, 
        numberOfWorkers: 0, 
        numberOfProcessedParts: 0, 
        laborEffort: 0.0, /* '' */ 
        jobCode: { code: '', name: '' }, 
        equipmentCode: { code: '', name: '' }, 
        toolingCode: [],
        materialCode: [],
        componentCode: [],
        measuringToolsCode: [],
      },
      formErrors: {}, 
      changedValues: {},
      expandedPanels: {
        parameters: false,
        equipment: false,
        components: true,
        materials: true,
        tooling: true,
        measuringTools: true
      },             
    });

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

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    //formValues
    setLocalData((prev) => {
      const prevValue = prev.dbValues[name];
      //проверяем изменения
      if (prevValue != value) {
        //есть изменения
        return {
          ...prev,
          formValues: {
            ...prev.formValues,
            [name]: value,
          },
          changedValues: {
            ...prev.changedValues,
            [name]: value,
          }
        };
      } else {
        //нет изменений
        return {
          ...prev,
          formValues: {
            ...prev.formValues,
            [name]: value,
          },
        };
      }      
    });

    //formErrors
    const errorMessage = numericFields.includes(name) && (value && !/^-?\d+([.,]\d+)?$/.test(value))
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
          },
          changedValues:
          {
            ...localData.changedValues,
            [name]: value
          }
        }
      );
    }
  }, [localData, setLocalData, numericFields, onUpdate]);

  const handleMaterialMassInputChange = useCallback((materialId) => (e) => {
    const { value } = e.target;
  
    // Проверка на числовые значения
    const numericRegex = /^-?\d+([.,]\d+)?$/;
    const isValid = !value || numericRegex.test(value);
    const errorMessage = !isValid ? 'Это поле должно содержать только цифры' : null;
  
    setLocalData(prev => {
      // Обновляем значения материалов
      const updatedMaterials = prev.formValues.materialCode.map(material => 
        material.cnt === materialId ? { ...material, mass: value } : material
      );
      
      // Создаем новый объект ошибок (НЕ МУТИРУЕМ существующий)
      const newMassErrors = { 
        ...prev.formErrors.materials?.masses 
      };
      
      // Устанавливаем ошибку для конкретного материала
      newMassErrors[materialId] = errorMessage;
      
      // Проверяем, есть ли вообще ошибки
      const hasMaterialErrors = Object.values(newMassErrors).some(error => error !== null);
      
      return {
        ...prev,
        formValues: {
          ...prev.formValues,
          materialCode: updatedMaterials
        },
        formErrors: {
          ...prev.formErrors,
          materials: hasMaterialErrors ? { masses: newMassErrors } : null,
          /*materialCode: hasMaterialErrors ? 'Заполните все обязательные поля материалов' : null*/
        },
        changedValues: {
          ...prev.changedValues,
          materialCode: updatedMaterials
        }
      };
    });
    
    // Передача данных родителю
    if (onUpdate) {
      const newMassErrors = { 
        ...localData.formErrors.materials?.masses 
      };
      newMassErrors[materialId] = errorMessage;
      
      onUpdate({
        ...localData,
        formValues: {
          ...localData.formValues,
          materialCode: localData.formValues.materialCode.map(material => 
            material.cnt === materialId ? { ...material, mass: value } : material
          )
        },
        formErrors: {
          ...localData.formErrors,
          materials: localData.formErrors.materials ? {
            masses: newMassErrors
          } : null
        },
        changedValues: {
          ...localData.changedValues,
          materialCode: localData.formValues.materialCode.map(material => 
            material.cnt === materialId ? { ...material, mass: value } : material
          )
        }
      });
    }
  }, [localData, setLocalData, onUpdate]);

  const handleComponentQuantityInputChange = useCallback((componentId) => (e) => {
    const { value } = e.target;
  
    // Проверка на числовые значения
    const numericRegex = /^[-]?\d+$/;
    const isValid = !value || numericRegex.test(value);
    const errorMessage = !isValid ? 'Это поле должно содержать только цифры' : null;
  
    setLocalData(prev => {
      // Обновляем значения
      const updatedComponents = prev.formValues.componentCode.map(component => 
        component.cnt === componentId ? { ...component, quantity: value } : component
      );
      
      // Создаем новый объект ошибок (НЕ МУТИРУЕМ существующий)
      const newQuantityErrors = { 
        ...prev.formErrors.components?.quantity
      };
      
      // Устанавливаем ошибку для конкретного комплектующего
      newQuantityErrors[componentId] = errorMessage;
      
      // Проверяем, есть ли вообще ошибки
      const hasComponentErrors = Object.values(newQuantityErrors).some(error => error !== null);
      
      return {
        ...prev,
        formValues: {
          ...prev.formValues,
          componentCode: updatedComponents
        },
        formErrors: {
          ...prev.formErrors,
          components: hasComponentErrors ? { quantity: newQuantityErrors } : null,
        },
        changedValues: {
          ...prev.changedValues,
          componentCode: updatedComponents
        }
      };
    });
    
    // Передача данных родителю
    if (onUpdate) {
      const newQuantityErrors = { 
        ...localData.formErrors.components?.quantity
      };
      newQuantityErrors[componentId] = errorMessage;
      
      onUpdate({
        ...localData,
        formValues: {
          ...localData.formValues,
          componentCode: localData.formValues.componentCode.map(component => 
            component.cnt === componentId ? { ...component, quantity: value } : component
          )
        },
        formErrors: {
          ...localData.formErrors,
          components: localData.formErrors.components ? {
            quantity: newQuantityErrors
          } : null
        },
        changedValues: {
          ...localData.changedValues,
          componentCode: localData.formValues.componentCode.map(component => 
            component.cnt === componentId ? { ...component, quantity: value } : component
          )
        }
      });
    }
  }, [localData, setLocalData, onUpdate]);

  const handleOptionSelect = useCallback((id, option) => {
    // Обновляем значение поля
    setLocalData((prev) => {
      const prevOption = prev.dbValues[id];
      //проверяем изменения
      if (!_.isEqual(prevOption, option) /*prevOption != option*/) {
        //есть изменения
        return {
          ...prev,
          formValues: {
            ...prev.formValues,
            [id]: option || null,
          },
          changedValues: {
            ...prev.changedValues,
            [id]: option || null,
          }
        };        
      } else {
        //нет изменений
        return {
          ...prev,
          formValues: {
            ...prev.formValues,
            [id]: option || null,
          },
          changedValues: {
            ...prev.changedValues,
            [id]: option || null,
          },
        };
      }
    });
  
    //убираем ошибку для этого поля
    setLocalData((prev) => ({
      ...prev,
      formErrors: {
        ...prev.formErrors,
        [id]: '',
      },
    }));
  
    //передаем изменения в родительский компонент
    if (onUpdate) {
      onUpdate(
        { 
          ...localData, 
          formValues: { ...localData.formValues, [id]: option || null }, 
          formErrors: { ...localData.formErrors, [id]: '' },
          changedValues: { ...localData.changedValues, [id]: option || null }, 
        }
      );
    }
  }, [localData, onUpdate]);

  const handleAccordionChange = useCallback(
    (panel) => (event, isExpanded) => {
      setLocalData((prev) => ({
        ...prev,
        expandedPanels: {
          ...prev.expandedPanels,
          [panel]: isExpanded
        },
      }));
      //
      onUpdate(
        { 
          ...localData, 
          expandedPanels: 
          { 
            ...localData.expandedPanels,
            [panel]: isExpanded 
          },
        }
      );
    },
    [localData, setLocalData]
  );

  useEffect(() => {
    if (content) {
      setLocalData(content);
    }    
  }, [content]);
  //
  return (
    <>
    {/*console.log(content)*/}
      {/* Параметры */}
      <Accordion defaultExpanded
        expanded={localData.expandedPanels['parameters'] || false}
        onChange={handleAccordionChange('parameters')} 
        elevation={2}
        sx={{ bgcolor: 'primary.secondary', color: 'primary.secondary', width: '100%', height: 'auto', overflow: 'hidden' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'black' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#eaeff1', color: 'black' }}
        >
          <Typography component="span">Параметры</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'hidden'/*, minHeight: '16.5rem', maxHeight: '35rem'*/ }}>
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
                        input: { readOnly: !access }
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
                    {<OperationsSearch props={{id: "operation-code-2", placeholder: "Код операции"}}
                      id="operationCode"
                      selectedValue={localData.formValues.operationCode}
                      options={autocompleteOptions.operations || null}
                      onChange={handleOptionSelect}
                      errorValue={localData.formErrors.operationCode}
                      access={access}
                    />}
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
                        input: { readOnly: !access }
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
                      slotProps={{
                        formHelperText: {
                          sx: { whiteSpace: 'nowrap' },
                        },
                        input: { readOnly: !access }
                      }}
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
                        input: { readOnly: !access }
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
                    {<JobsSearch props={{id: "job-code-2", placeholder: "Код профессии"}}
                      id="jobCode"
                      selectedValue={localData.formValues.jobCode}
                      options={autocompleteOptions.jobs || null}
                      onChange={handleOptionSelect} 
                      errorValue={localData.formErrors.jobCode}
                      access={access}
                    />}
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
                        input: { readOnly: !access }
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
                        input: { readOnly: !access }
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
                        input: { readOnly: !access }
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
                        input: { readOnly: !access }
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
                        input: { readOnly: !access }
                      }}
                    >
                    </TextField>                       
                  </Grid>
                </Grid>
              </Grid>
              {/* Восьмая строка */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4.8}>
                    <TextField                          
                      multiline
                      fullWidth
                      minRows={8}
                      maxRows={100}
                      name='operationDescription'
                      id="operation-description-12"
                      label="Описание операции"
                      size='small'
                      onChange={handleInputChange}
                      value={localData.formValues.operationDescription || ''}
                      slotProps={{
                        formHelperText: {
                          sx: { whiteSpace: 'nowrap' },
                        },
                        input: { readOnly: !access }
                      }}
                    />                  
                  </Grid>
                </Grid>
              </Grid>                                                
            </Grid>
          </form>              
        </AccordionDetails>
      </Accordion>        
      
      {/* Оборудование */}
      <Accordion defaultExpanded 
        expanded={localData.expandedPanels['equipment'] || false} 
        onChange={handleAccordionChange('equipment')} 
        elevation={2} 
        sx={{ bgcolor: 'primary.secondary', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'black' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#eaeff1', color: 'black' }}
        >
          <Typography component="span">Оборудование</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto'}}>
          <form>      
            <Grid container spacing={2} columns={{xs:5}}>
            {/* Первая строка */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4.8}>
                    {/*<EquipmentSearch props={{id: "equipment-2", placeholder: "Оборудование"}}
                      id="equipment"
                      selectedValue={localData.formValues.equipmentCode}
                      options={autocompleteOptions.equipment || null}
                      onChange={handleOptionSelect}
                      errorValue={localData.formErrors.equipmentCode}
                    />*/}
                  </Grid>                  
                </Grid>
              </Grid>
            </Grid>                
          </form>              
        </AccordionDetails>
      </Accordion>

      {/* Оснастка */}
      <Accordion defaultExpanded 
        expanded={localData.expandedPanels['tooling'] || false} 
        onChange={handleAccordionChange('tooling')} 
        elevation={2} 
        sx={{ bgcolor: 'primary.secondary', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'black' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#eaeff1', color: 'black' }}
        >
          <Typography component="span">Оснастка</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto'}}>
        <Grid container spacing={2} rowSpacing={4} columns={{xs:5}}>
            {/* Первая строка */}
            <Grid item xs={5}>
              <Grid container spacing={2}>
                <Grid item xs={4.8}>
                  <ToolingSearch props={{id: "tooling-code-2", placeholder: "Код оснастки"}}
                    id="toolingCode"
                    onOptionSelect={handleOptionSelect} 
                    selectedValue={localData.formValues.toolingCode}
                    options={autocompleteOptions.tooling || null}
                    onChange={handleOptionSelect}
                    /*errorValue={localData.formErrors.materials}*/
                    access={access}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Вторая строка */}
            <Grid item xs={12} sx={{ '& > :not(:last-child)': { mb: 2 } }}>
              {localData.formValues.toolingCode?.map((item) => (
                <>
                  <Grid container spacing={2} key={`tooling-item-${item.cnt}`}>
                    {/* Первый столбец */}
                    <Grid item xs={2.4}>
                      <TextField
                        fullWidth
                        name='toolingCode'
                        id={`tooling-code-${item.cnt}`}
                        label="Код"
                        placeholder='Код'
                        variant="outlined"
                        sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                        size='small'
                        value={item.code}
                        slotProps={{
                          formHelperText: {
                            sx: { whiteSpace: 'nowrap' },
                          },
                          input: { readOnly: true }
                        }}
                      />                      
                    </Grid>

                    {/* Второй столбец */}
                    <Grid item xs={7.2}>
                      <TextField
                        fullWidth
                        name='toolingName'
                        id={`tooling-name-${item.cnt}`}
                        label="Наименование"
                        placeholder='Наименование'
                        variant="outlined"
                        sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                        size='small'
                        value={item.name}
                        slotProps={{
                          formHelperText: {
                            sx: { whiteSpace: 'nowrap' },
                          },
                          input: { readOnly: true }
                        }}
                      />
                    </Grid>
                  </Grid>
                </>                       
              ))}                                   
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Комплектующие */}
      <Accordion defaultExpanded 
        expanded={localData.expandedPanels['components'] || false} 
        onChange={handleAccordionChange('components')} 
        elevation={2} 
        sx={{ bgcolor: 'primary.secondary', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'black' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#eaeff1', color: 'black' }}
        >
          <Typography component="span">Комплектующие</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto'}}>
        <Grid container spacing={2} rowSpacing={4} columns={{xs:5}}>
            {/* Первая строка */}
            <Grid item xs={5}>
              <Grid container spacing={2}>
                <Grid item xs={4.8}>
                  <ComponentsSearch props={{id: "components-code-2", placeholder: "Код комплектующего"}}
                    id="componentCode" 
                    onOptionSelect={handleOptionSelect} 
                    selectedValue={localData.formValues.componentCode}
                    options={autocompleteOptions.components || null}
                    onChange={handleOptionSelect}
                    /*errorValue={localData.formErrors.materials}*/
                    access={access}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Вторая строка */}
            <Grid item xs={12} sx={{ '& > :not(:last-child)': { mb: 2 } }}>
              {localData.formValues.componentCode?.map((item) => (
                <>
                  <Grid container spacing={2} key={`component-item-${item.cnt}`}>
                    {/* Первый столбец */}
                    <Grid item xs={2.4}>
                      <TextField
                        fullWidth
                        name='componentCode'
                        id={`component-code-${item.cnt}`}
                        label="Код"
                        placeholder='Код'
                        variant="outlined"
                        sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                        size='small'
                        value={item.code}
                        slotProps={{
                          formHelperText: {
                            sx: { whiteSpace: 'nowrap' },
                          },
                          input: { readOnly: true }
                        }}
                      />                      
                    </Grid>

                    {/* Второй столбец */}
                    <Grid item xs={7.2}>
                      <TextField
                        fullWidth
                        name='componentName'
                        id={`component-name-${item.cnt}`}
                        label="Наименование"
                        placeholder='Наименование'
                        variant="outlined"
                        sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                        size='small'
                        value={item.name}
                        slotProps={{
                          formHelperText: {
                            sx: { whiteSpace: 'nowrap' },
                          },
                          input: { readOnly: true }
                        }}
                      />
                    </Grid>

                    {/* Третий столбец */}
                    <Grid item xs={2.4}>
                      <TextField
                        fullWidth
                        name={`componentQuantity_${item.cnt}`}
                        id={`component-quantity-${item.cnt}`}
                        label="Количество"
                        placeholder='Количество'
                        type="text"
                        size="small"
                        onChange={handleComponentQuantityInputChange(item.cnt)}
                        error={!!localData.formErrors?.components?.quantity?.[item.cnt]}
                        helperText={localData.formErrors?.components?.quantity?.[item.cnt] || ''}
                        value={item.quantity || ''}
                        slotProps={{
                          formHelperText: {
                            sx: { whiteSpace: 'nowrap' },
                          },
                          input: { readOnly: !access }
                        }}
                      >
                      </TextField>
                </Grid>
                  </Grid>
                </>                       
              ))}                                   
            </Grid>
          </Grid>             
        </AccordionDetails>
      </Accordion>

      {/* Материалы */}
      <Accordion defaultExpanded 
        expanded={localData.expandedPanels['materials'] || false} 
        onChange={handleAccordionChange('materials')} 
        elevation={2} 
        sx={{ bgcolor: 'primary.secondary', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'black' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#eaeff1', color: 'black' }}
        >
          <Typography component="span">Материалы</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto'}}>
          <Grid container spacing={2} rowSpacing={4} columns={{xs:5}}>
            {/* Первая строка */}
            <Grid item xs={5}>
              <Grid container spacing={2}>
                <Grid item xs={4.8}>
                  <MaterialsSearch props={{id: "materials-code-2", placeholder: "Код материала"}}
                    id="materialCode"
                    onOptionSelect={handleOptionSelect} 
                    selectedValue={localData.formValues.materialCode}
                    options={autocompleteOptions.materials || null}
                    onChange={handleOptionSelect}
                    /*errorValue={localData.formErrors.materials}*/
                    access={access}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Вторая строка */}
            <Grid item xs={12} sx={{ '& > :not(:last-child)': { mb: 2 } }}>
              {localData.formValues.materialCode?.map((item) => (
                <>
                  <Grid container spacing={2} key={`material-item-${item.cnt}`}>
                    {/* Первый столбец */}
                    <Grid item xs={2.4}>
                      <TextField
                        fullWidth
                        name='materialCode'
                        id={`material-code-${item.cnt}`}
                        label="Код"
                        placeholder='Код'
                        variant="outlined"
                        sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                        size='small'
                        value={item.code}
                        slotProps={{
                          formHelperText: {
                            sx: { whiteSpace: 'nowrap' },
                          },
                          input: { readOnly: true }
                        }}
                      />                      
                    </Grid>

                    {/* Второй столбец */}
                    <Grid item xs={7.2}>
                      <TextField
                        fullWidth
                        name='materialName'
                        id={`material-name-${item.cnt}`}
                        label="Наименование"
                        placeholder='Наименование'
                        variant="outlined"
                        sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                        size='small'
                        value={item.name}
                        slotProps={{
                          formHelperText: {
                            sx: { whiteSpace: 'nowrap' },
                          },
                          input: { readOnly: true }
                        }}
                      />
                    </Grid>

                    {/* Третий столбец */}
                    <Grid item xs={2.4}>
                      <TextField
                        fullWidth
                        name={`materialMass_${/*item.id ||*/ item.cnt}`}
                        id={`material-mass-${/*item.id ||*/ item.cnt}`}
                        label="Масса"
                        placeholder='Масса'
                        type="text"
                        size="small"
                        onChange={handleMaterialMassInputChange(/*item.id ||*/ item.cnt)}
                        error={!!localData.formErrors?.materials?.masses?.[/*item.id ||*/ item.cnt]}
                        helperText={localData.formErrors?.materials?.masses?.[/*item.id ||*/ item.cnt] || ''}
                        value={item.mass || ''}
                        slotProps={{
                          formHelperText: {
                            sx: { whiteSpace: 'nowrap' },
                          },
                          input: { readOnly: !access }
                        }}
                      >
                      </TextField>
                </Grid>
                  </Grid>
                </>                       
              ))}                                   
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>      

      {/* Измерительный инструмент */}
      <Accordion defaultExpanded 
        expanded={localData.expandedPanels['measuringTools'] || false} 
        onChange={handleAccordionChange('measuringTools')} 
        elevation={2} 
        sx={{ bgcolor: 'primary.secondary', color: 'black', width: '100%', height: 'auto', overflow: 'hidden' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'black' }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ backgroundColor: '#eaeff1', color: 'black' }}
        >
          <Typography component="span">Измерительный инструмент</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2, overflow: 'auto'}}>           
        <Grid container spacing={2} rowSpacing={4} columns={{xs:5}}>
            {/* Первая строка */}
            <Grid item xs={5}>
              <Grid container spacing={2}>
                <Grid item xs={4.8}>
                  <MeasuringToolsSearch props={{id: "measuring-tools-code-2", placeholder: "Код инструмента"}}
                    id="measuringToolsCode"
                    onOptionSelect={handleOptionSelect} 
                    selectedValue={localData.formValues.measuringToolsCode}
                    options={autocompleteOptions.measuringTools || null}
                    onChange={handleOptionSelect}
                    /*errorValue={localData.formErrors.materials}*/
                    access={access}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Вторая строка */}
            <Grid item xs={12} sx={{ '& > :not(:last-child)': { mb: 2 } }}>
              {localData.formValues.measuringToolsCode?.map((item) => (
                <>
                  <Grid container spacing={2} key={`measuring-tools-item-${item.cnt}`}>
                    {/* Первый столбец */}
                    <Grid item xs={2.4}>
                      <TextField
                        fullWidth
                        name='measuringToolsCode'
                        id={`measuring-tools-code-${item.cnt}`}
                        label="Код"
                        placeholder='Код'
                        variant="outlined"
                        sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                        size='small'
                        value={item.code}
                        slotProps={{
                          formHelperText: {
                            sx: { whiteSpace: 'nowrap' },
                          },
                          input: { readOnly: true }
                        }}
                      />                      
                    </Grid>

                    {/* Второй столбец */}
                    <Grid item xs={7.2}>
                      <TextField
                        fullWidth
                        name='measuringToolsName'
                        id={`measuring-tools-name-${item.cnt}`}
                        label="Наименование"
                        placeholder='Наименование'
                        variant="outlined"
                        sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                        size='small'
                        value={item.name}
                        slotProps={{
                          formHelperText: {
                            sx: { whiteSpace: 'nowrap' },
                          },
                          input: { readOnly: true }
                        }}
                      />
                    </Grid>                   
                  </Grid>
                </>                       
              ))}                                   
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
});

export {OperationCard};