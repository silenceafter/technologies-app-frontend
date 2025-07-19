import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const LOADING_DEFAULT = false;
const initialState = {
  items: [], /* основные элементы дерева */
  selectedItems: [], /* выделенные элементы */
  checkedItems: [], /* чекбоксы */
  disabledItems: [], /* помеченные на удаление */
  editedItems: [], /* редактируемые элементы */
  selectedId: null,
  loading: LOADING_DEFAULT,
  error: null,
  newItemCnt: 1,
  hasUnsavedChanges: false,
  hasAccess: false,
  expandedPanelsDefault: { 
    parameters: true,
    equipment: false,
    components: false,
    materials: false,
    tooling: false,
    measuringTools: false
  },
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const findNodeById = (items, targetId) => {
  for (let item of items) {
    if (item.id === targetId) {
      return item; //нашли элемент
    }
    
    //рекурсия для детей
    if (item.children && item.children.length > 0) {
      let foundInChildren = findNodeById(item.children, targetId);        
      if (foundInChildren) { /* foundInChildren !== undefined && foundInChildren !== null */
        return foundInChildren; //вернули найденный элемент из потомков
      }
    }
  }
  return null; //ничего не нашли null
};

const markElementsAsDeleted = (items, idsToMarkAsDeleted) => {
  return items.map((item) => {
    // Должен ли текущий элемент быть помечен как удалённый?
    const shouldBeDeleted = idsToMarkAsDeleted.includes(item.id);

    // Обновляем объект с возможностью сохранения вложенных элементов
    const updatedItem = {
      ...item,
      content: {
        ...item.content,
        isDeleted: shouldBeDeleted ? true : item.content.isDeleted,
      },
    };

    // Проверяем наличие вложенных элементов и рекурсивно применяем логику
    if (updatedItem.children && Array.isArray(updatedItem.children)) {
      updatedItem.children = markElementsAsDeleted(updatedItem.children, idsToMarkAsDeleted);
    }
    return updatedItem;
  });
};

const restoreElements = (items, idsToMarkToRestore) => {
  return items.map((item) => {
    // Должен ли текущий элемент быть помечен как удалённый?
    const shouldBeRestore = idsToMarkToRestore.includes(item.id);

    // Обновляем объект с возможностью сохранения вложенных элементов
    const updatedItem = {
      ...item,
      content: {
        ...item.content,
        isDeleted: shouldBeRestore ? false : item.content.isDeleted,
      },
    };

    // Проверяем наличие вложенных элементов и рекурсивно применяем логику
    if (updatedItem.children && Array.isArray(updatedItem.children)) {
      updatedItem.children = restoreElements(updatedItem.children, idsToMarkToRestore);
    }
    return updatedItem;
  });
};

//загрузка технологий и операций по коду ДСЕ
export const getSavedData = createAsyncThunk(
  'technologiesTree/getSavedData',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const externalCode = payload.drawing.externalcode; //const externalCode = selectDrawingExternalCode(state);
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      //
      const response = await fetch(`${baseUrl}/Ivc/Ogt/ExecuteScripts/GetSavedData.v2.php`, {
        method: 'POST',
        body: JSON.stringify(payload),
        credentials: 'include'
      }); /* `${baseUrl}/Ivc/Ogt/ExecuteScripts/GetSavedData.v2.php?code=${externalCode}` */
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }

      //для пустого значения
      if (!externalCode.trim()) return rejectWithValue('Пустое значение поиска (реквизит drawing)');

      //приведем к нужному виду
      const processItem = (item) => ({
        ...item,
        id: item.id || item.ItemId,
        label: item.label || 'Unnamed Item', /* код операции */
        secondaryLabel: item.secondaryLabel || null, /* наименование операции */
        children: item.children.map(processItem) || [],
        type: item.type,
      });
      /*console.log(data.map(processItem));*/
      return data.map(processItem);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const technologiesSlice = createSlice({
  name: 'technologies',
  initialState,
  reducers: {
    setSelectedId: (state, action) => {
      const newSelectedId = action.payload;
      return {
        ...state,
        selectedId: newSelectedId,
      };
    },
    addTechnology: (state, action) => {
      const { user, drawing } = action.payload;
      const newTechnologyId = generateUUID();
      const newDate = new Date();
      return {
        ...state,
        selectedId: [ newTechnologyId, null ],
        hasUnsavedChanges: true,
        items: [
          ...state.items,
          {
            id: newTechnologyId,
            label: newTechnologyId.split('-')[0],
            secondaryLabel: `Новая технология ${state.items.length + 1}`,
            parentId: null,
            children: [],
            creationDate: newDate,
            lastModified: newDate,
            proxy: {},
            type: 'technology',
            content: {
              changedValues: {},
              dbValues: { technologyCode: null },
              formValues: { technologyCode: null, prefix: null },
              formErrors: {},
              expandedPanels: {},
              isDeleted: false,
              isNewRecord: true,
              isUpdated: false,
            },
            drawing: {
              externalCode: drawing.externalCode,
            },
            userId: null,
            groupId: null,
            UID: user.UID,
            GID: user.GID,
            hasAccess: true,
          },
        ],
      };
    },
    addOperation: (state, action) => {      
      const technology = findNodeById(state.items, action.payload[0]);
      const maxItem = technology.children.reduce(
        (maxItem, currentItem) => 
          currentItem.content.dbValues.orderNumber > maxItem.content.dbValues.orderNumber 
            ? currentItem 
            : maxItem,
        technology.children[0]
      );

      //id
      const newOperationId = generateUUID();
      //orderNumber
      let newOrderNumber = 1;
      if (maxItem) {
        newOrderNumber =  maxItem.content.dbValues.orderNumber + 1;
      }
      //
      return {
        ...state,
        selectedId: [ technology.id, newOperationId],
        hasUnsavedChanges: true,
        items: state.items.map((item) =>
          item.id === technology.id
            ? {
                ...item,
                content: {
                  ...item.content,
                  isUpdated: true, /* добавлена новая операция, технология изменена (технология точно существует) */
                },
                children: [
                  ...technology.children, 
                  {
                    id: newOperationId,
                    parentId: technology.id,
                    label: newOperationId.split('-')[0],
                    secondaryLabel: `Новая операция ${newOrderNumber}`,
                    proxy: {},
                    type: 'operation',
                    content: {
                      dbValues: { orderNumber: newOrderNumber },
                      formValues: { orderNumber: newOrderNumber },
                      formErrors: {},
                      expandedPanels: state.expandedPanelsDefault,
                      changedValues: {},
                      isDeleted: false,
                      isNewRecord: true,
                      isUpdated: false,
                    },
                  }
                ]                                                                                          
              }
            : item
        )
      };    
    },
    updateTechnology: (state, action) => {
      const { id, prefixValue } = action.payload;
      const technology = findNodeById(state.items, id);//найти технологию в state.items
      //
      return {
        ...state,
        hasUnsavedChanges: true,
        items: state.items.map((item) =>
          item.id === technology.id
            ? {
                ...item,
                content: {
                  ...item.content,                  
                  formValues: {
                    ...item.content.formValues,
                    prefix: prefixValue,
                  },
                  changedValues: {
                    ...item.content.changedValues,
                    prefix: prefixValue,
                  },
                  /*isUpdated: item.content.isNewRecord || item.content.isDeleted ? false : true,*/
                },                            
              }
            : item
        ),
      };      
    },
    updateOperation: (state, action) => {
      //обновить вкладку
      /* из OperationTabPanel/OperationCard */
      const { id, newContent/*, newValidateForm*/ } = action.payload;

      //найти технологию и операцию в state.items
      const operation = findNodeById(state.items, id);
      const technology = findNodeById(state.items, operation.parentId);

      //operationCode
      let operationCode = { code: id, name: 'Новая операция' };

      //если операция изменена
      if (newContent.changedValues.hasOwnProperty('operationCode')) {
        if (newContent.changedValues.operationCode) {
          operationCode.code = newContent.changedValues.operationCode.code;
          operationCode.name = newContent.changedValues.operationCode.name;
        }
      }

      //areaNumber
      let areaNumber = null;
      if (newContent.changedValues.hasOwnProperty('areaNumber')) {
        if (newContent.changedValues.areaNumber) {
          areaNumber = newContent.changedValues.areaNumber;
        }
      }

      //document
      let document = null;
      if (newContent.changedValues.hasOwnProperty('document')) {
        if (newContent.changedValues.document) {
          document = newContent.changedValues.document;
        }
      }

      //operationDescription
      let operationDescription = null;
      if (newContent.changedValues.hasOwnProperty('operationDescription')) {
        if (newContent.changedValues.operationDescription) {
          operationDescription = newContent.changedValues.operationDescription;
        }
      }

      //grade
      let grade = null;
      if (newContent.changedValues.hasOwnProperty('grade')) {
        if (newContent.changedValues.grade) {
          grade = newContent.changedValues.grade;
        }
      }

      //workingConditions
      let workingConditions = null;
      if (newContent.changedValues.hasOwnProperty('workingConditions')) {
        if (newContent.changedValues.workingConditions) {
          workingConditions = newContent.changedValues.workingConditions;
        }
      }

      //numberOfWorkers
      let numberOfWorkers = null;
      if (newContent.changedValues.hasOwnProperty('numberOfWorkers')) {
        if (newContent.changedValues.numberOfWorkers) {
          numberOfWorkers = newContent.changedValues.numberOfWorkers;
        }
      }

      //numberOfProcessedParts
      let numberOfProcessedParts = null;
      if (newContent.changedValues.hasOwnProperty('numberOfProcessedParts')) {
        if (newContent.changedValues.numberOfProcessedParts) {
          numberOfProcessedParts = newContent.changedValues.numberOfProcessedParts;
        }
      }

      //laborEffort
      let laborEffort = null;
      if (newContent.changedValues.hasOwnProperty('laborEffort')) {
        if (newContent.changedValues.laborEffort) {
          laborEffort = newContent.changedValues.laborEffort;
        }
      }

      //jobCode
      //jobName
      const isUpdatedOperation = newContent.isNewRecord || newContent.isDeleted ? false : true;
      //
      return {
        ...state,
        hasUnsavedChanges: true,
        items: state.items.map((item) =>
          item.id === technology.id
            ? {
                ...item,
                content: {
                  ...item.content,
                  isUpdated: newContent.isNewRecord || newContent.isDeleted || isUpdatedOperation ? true : false,
                },
                children: item.children.map((child) =>
                  child.id === operation.id
                    ? {
                        ...child,
                        content: {
                          ...child.content,
                          formValues: newContent.formValues,
                          formErrors: newContent.formErrors,
                          expandedPanels: newContent.expandedPanels,
                          changedValues: newContent.changedValues,
                          isDeleted: newContent.isDeleted,
                          isNewRecord: newContent.isNewRecord,
                          isUpdated: isUpdatedOperation, /* т.к. создание или удаление операции приоритетнее, чем изменение */
                          /*validateForm: newValidateForm*/
                        }                        
                      }
                    : child
                ),                
              }
            : item
        )
      };
    },
    updateTechnologyFormErrors: (state, action) => {
      const { id, formErrors } = action.payload;
      const technology = findNodeById(state.items, id);
      //
      return {
        ...state,
        hasUnsavedChanges: true,
        items: state.items.map((item) =>
          item.id === technology.id
            ? {
                ...item,
                content: {
                  ...item.content,
                  formErrors: formErrors,
                }                                
              }
            : item
        )
      };
    },
    updateOperationFormErrors: (state, action) => {
      const { id, formErrors } = action.payload;
      const operation = findNodeById(state.items, id);
      const technology = findNodeById(state.items, operation.parentId);
      //
      return {
        ...state,
        hasUnsavedChanges: true,
        items: state.items.map((item) =>
          item.id === technology.id
            ? {
                ...item,
                children: item.children.map((child) =>
                  child.id === operation.id
                    ? {
                        ...child,
                        content: {
                          ...child.content,
                          formErrors: formErrors,
                        }                        
                      }
                    : child
                ),                
              }
            : item
        )
      };
    },
    deleteItems: (state) => {
      let ids = [];
      //смотрим чекбоксы
      for(const checkedItem of state.checkedItems) {
        if (!state.disabledItems.includes(checkedItem)) {
          ids.push(checkedItem);
        }
      }
      const newItems = markElementsAsDeleted(state.items, ids);
      return {
        ...state,
        items: newItems,
        checkedItems: [],
        disabledItems: [
          ...state.disabledItems,
          ...ids,
        ],
        hasUnsavedChanges: true,
      };
    },
    restoreItems: (state) => {
      //уберем отмеченные элементы из disabledItems
      const checkedIds = [...new Set(state.checkedItems)];
      const filteredDisabledItems = state.disabledItems.filter(id => !checkedIds.includes(id));
      const newItems = restoreElements(state.items, checkedIds);
      //
      return {
        ...state,
        items: newItems,
        checkedItems: [],
        disabledItems: filteredDisabledItems,
      };
    },
    deleteItem: (state, action) => {
      //удаление одного элемента
      let ids = [];
      ids.push(action.payload);
      const newItems = markElementsAsDeleted(state.items, ids);
      //
      return {
        ...state,
        items: newItems,
        checkedItems: [],
        disabledItems: [
          ...state.disabledItems,
          ...ids,
        ],
      };
    },
    restoreItem: (state, action) => {
      //уберем отмеченные элементы из disabledItems
      const checkedIds = [action.payload];
      const filteredDisabledItems = state.disabledItems.filter(id => !checkedIds.includes(id));
      const newItems = restoreElements(state.items, checkedIds);
      //
      return {
        ...state,
        items: newItems,
        checkedItems: [],
        disabledItems: filteredDisabledItems,
      };
    },
    setCheckedItems: (state, action) => {
      const id = action.payload;
      const updatedCheckedItems = new Set(state.checkedItems);
      const item = state.items.find(el => el.id === id);
      const isParent = item?.children?.length > 0;
      //
      if (isParent) {
        const childrenIds = item.children.map(child => child.id);
        const allSelected = [id, ...childrenIds].every(childId => updatedCheckedItems.has(childId));
        //
        if (allSelected) {
          //если все выбраны — снимаем выбор у всех
          updatedCheckedItems.delete(id);
          childrenIds.forEach(childId => updatedCheckedItems.delete(childId));
        } else {
          //добавляем всех (родителя и детей)
          updatedCheckedItems.add(id);
          childrenIds.forEach(childId => updatedCheckedItems.add(childId));
        }
      } else {
        const isChecked = updatedCheckedItems.has(id);
        //
        if (isChecked) {
          updatedCheckedItems.delete(id);
        } else {
          updatedCheckedItems.add(id);
        }
    
        //проверяем, остались ли еще выбраны все дети — если да, включаем родителя, иначе — убираем
        state.items.forEach(parent => {
          if (parent.children?.some(child => child.id === id)) {
            const allChildrenSelected = parent.children.every(child => updatedCheckedItems.has(child.id));
            if (allChildrenSelected) {
              updatedCheckedItems.add(parent.id);
            } else {
              updatedCheckedItems.delete(parent.id);
            }
          }
        });
      }
      //
      return {
        ...state,
        checkedItems: Array.from(updatedCheckedItems),
      };
    },
    setAccess: (state, action) => {
      return {
        ...state,
        hasAccess: action.payload,
      };
    },
    copyItems: (state, action) => {
      //просмотр отмеченных элементов
      for(const checkedItem of state.checkedItems) {
        const technology = findNodeById(state.technologies.items, checkedItem);
        const operation = findNodeById(state.technologies.items, checkedItem);
      }
    },
    resetTechnologies: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSavedData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSavedData.fulfilled, (state, action) => {
        state.loading = false;
        //state.items = action.payload;
        state.items = action.payload.map(item => ({
          ...item,
          children: item.children.map(child => ({ ...child }))
        }));
        state.hasUnsavedChanges = false;

        //selectedId
        if (!state.selectedId) {
          state.selectedId = state.items.length > 0 
            ? [state.items[0].id, state.items[0].children.length > 0 ? state.items[0].children[0].id : null] 
            : [null, null];
        }        
      })
      .addCase(getSavedData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
    });
  },
});

export const {
  setSelectedId,
  restoreItems, restoreItem,
  deleteItems, deleteItem,
  addTechnology, addOperation, updateTechnology, updateOperation, updateTechnologyFormErrors, updateOperationFormErrors, setCheckedItems,
  setAccess,
  resetTechnologies
} = technologiesSlice.actions;

//селекторы
export const selectItems = (state) => state.technologies.items || [];
export const selectSelectedItems = (state) => state.technologies.selectedItems || [];
export const selectLoading = (state) => state.technologies.loading;
export const selectCurrentItems = (state) => {
  if (state.technologies.items && state.technologies.selectedId) {
    const technology = findNodeById(state.technologies.items, state.technologies.selectedId[0]);
    const operation = findNodeById(state.technologies.items, state.technologies.selectedId[1]);
    return [technology, operation];
  }
  return [null, null];
};

export default technologiesSlice.reducer;