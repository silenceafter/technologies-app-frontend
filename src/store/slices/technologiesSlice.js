import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectDrawingExternalCode } from './drawingsSlice';

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
  //
  tabs: [],
  tabValue: 0,
  tabCnt: 1,
  validateForm: false,
  loadingTabs: false,
  errorTabs: null,
  shouldReloadTabs: false,
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

//загрузка технологий и операций по коду ДСЕ
export const getSavedData = createAsyncThunk(
  'technologiesTree/getSavedData',
  async ({}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const externalCode = selectDrawingExternalCode(state);
      //
      const response = await fetch(`http://localhost/Ivc/Ogt/ExecuteScripts/GetSavedData.v2.php?code=${externalCode}`);
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
      console.log(data.map(processItem));
      return data.map(processItem);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//удалить технологии и/или операции
/*export const deleteSavedData = createAsyncThunk(
  'technologiesTree/deleteSavedData',
  async ({}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const externalCode = selectDrawingExternalCode(state);

      const selectedItemsData = state.items
        .filter(item => state.selectedItems.includes(item.id) || item.children?.some(child => state.selectedItems.includes(child.id)))
        .map(item => ({
          ...item,
          selected: state.selectedItems.includes(item.id), //отмечаем основной элемент
          children: item.children?.map(child => ({
            ...child,
            selected: state.selectedItems.includes(child.id) //отмечаем детей
          }))
      }));

      //
      const response = await fetch('http://localhost/Ivc/Ogt/ExecuteScripts/DeleteSavedData.v0.php', {
        method: 'POST',
        body: JSON.stringify({}),
      });
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
        label: item.label || 'Unnamed Item',
        secondaryLabel: item.secondaryLabel || null,
        children: item.children.map(processItem) || [],
      });
      return data.map(processItem);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);*/

const technologiesSlice = createSlice({
  name: 'technologies',
  initialState,
  reducers: {
    addItems: (state, action) => {
      return {
        ...state,
        newItemCnt: state.newItemCnt + 1,
        items: [...state.items, { id: generateUUID(), label: action.payload.code, secondaryLabel: action.payload.name, children: [], parentId: null, type: 'technology' }]
      };
    },
    clearItems: (state) => {
      return {
        ...state,
        items: [],
        loading: LOADING_DEFAULT
      }
    },
    restoreItems: (state, action) => {
      const targetItemIds = Array.isArray(action.payload) ? action.payload : [action.payload]; //если передан один itemId, преобразуем его в массив
      let parentId = null;
      let foundItem = null;

      //поиск элемента и его родителя
      const findItemAndParent = (items, parent = null) => {
        for (const item of items) {
          if (targetItemIds.includes(item.id)) {  //проверяем, что itemId есть в targetItemIds
            foundItem = item;
            parentId = parent ? parent.id : null;
            return;
          }
          if (item.children) {
            findItemAndParent(item.children, item);
          }
        }
      };

      //запускаем поиск по всей структуре items
      targetItemIds.forEach(itemId => {
        if (!foundItem) {
          findItemAndParent(state.items); //ищем каждый itemId из payload
        }
      });

      //если элемент не найден — ничего не делаем
      if (!foundItem) return state;

      //получаем id всех детей, если это родительский элемент
      const childrenIds = foundItem.children?.map(child => child.id) || [];

      //собираем все id, которые нужно восстановить (элемент + его дети + родитель, если есть)
      const itemsToRestore = [...targetItemIds, ...childrenIds];
      if (parentId) {
        itemsToRestore.push(parentId);
      }

      return {
        ...state,
        //убираем эти id из disabledItems
        disabledItems: state.disabledItems.filter(itemId => !itemsToRestore.includes(itemId)),
      };
    },
    setSelectedItems: (state, action) => {
      return {
        ...state,
        selectedItems: action.payload
      };
    },
    deleteSelectedItems: (state, action) => {
      const targetItemIds = Array.isArray(action.payload) ? action.payload : [action.payload];

      // Функция для поиска всех потомков для заданного itemId
      const findDescendants = (items, itemId, result = []) => {
        for (const item of items) {
          if (item.id === itemId) {
            result.push(item.id); // Добавляем текущий элемент
            if (item.children) {
              item.children.forEach(child => result.push(child.id)); // Добавляем всех детей
            }
          } else if (item.children) {
            // Рекурсивно ищем среди детей
            findDescendants(item.children, itemId, result);
          }
        }
        return result;
      };
    
      // Функция для проверки, остались ли дети у родительского элемента
      const hasRemainingChildren = (parentId, disabledItems) => {
        const parent = state.items.find(item => item.id === parentId);
        if (parent && parent.children) {
          // Проверяем, есть ли у родителя хотя бы один ребенок, который не в disabledItems
          return parent.children.some(child => !disabledItems.includes(child.id));
        }
        return false; // Если детей нет, или все они уже в disabledItems
      };
    
      // Находим все id, которые нужно исключить (потомки и их родитель)
      const itemsToDisable = targetItemIds.reduce((acc, itemId) => {
        const descendants = findDescendants(state.items, itemId); // Находим потомков
        return [...acc, ...descendants]; // Добавляем найденные id в аккумулятор
      }, []);
    
      // Также проверяем, все ли дети родителя удалены
      const parentsToDisable = targetItemIds.reduce((acc, itemId) => {
        const parentId = state.items.find(item => item.children?.some(child => child.id === itemId))?.id;
        if (parentId && !hasRemainingChildren(parentId, state.disabledItems)) {
          // Если у родителя нет других детей, добавляем его в список на удаление
          acc.push(parentId);
        }
        return acc;
      }, []);
    
      // Объединяем ids для удаления: дочерние элементы + родительские элементы, если все дети удалены
      const allItemsToDisable = [...itemsToDisable, ...parentsToDisable];
    
      // Важно: убираем их из selectedItems и добавляем в disabledItems
      return {
        ...state,
        // Добавляем все элементы и их потомков в disabledItems
        disabledItems: [...new Set([...state.disabledItems, ...allItemsToDisable])],
    
        // Очищаем selectedItems для указанных элементов и их потомков
        selectedItems: state.selectedItems.filter(id => !allItemsToDisable.includes(id)),
    
        // Обновляем состояние selected для элементов и их детей
        items: state.items.map(item => {
          const isDisabled = allItemsToDisable.includes(item.id);
          return {
            ...item,
            selected: isDisabled ? false : item.selected, // Снимаем selected
            children: item.children
              ? item.children.map(child => ({
                  ...child,
                  selected: isDisabled ? false : child.selected // Снимаем selected у детей
                }))
              : item.children
          };
        })
      };
    

      /*const selectedItemsData = state.items
        .filter(item => action.payload.includes(item.id) || item.children?.some(child => action.payload.includes(child.id)))
        .map(item => ({
          ...item,
          selected: action.payload.includes(item.id), //отмечаем основной элемент
          children: item.children?.map(child => ({
            ...child,
            selected: action.payload.includes(child.id) //отмечаем детей
          }))
      }));
      //
      return {
        ...state,
        disabledItems: state.disabledItems.concat(action.payload),
        selectedItems: state.selectedItems.filter(id => !action.payload.includes(id)),
        items: state.items.map(item => ({
          ...item,
          selected: action.payload.includes(item.id), // если item есть в списке, добавляем selected
          children: item.children
            ? item.children.map(child => ({
                ...child,
                selected: action.payload.includes(child.id) // то же самое для детей
              }))
            : item.children
        }))
      };*/
    },
    setSelectedId: (state, action) => {
      return {
        ...state,
        selectedId: action.payload,
      };
    },
    setTabs: (state, action) => {
      return {
        ...state,
        tabs: action.payload,
        tabCnt: action.payload.length + 1,
        activeTabId: action.payload.length > 0 ? action.payload[0].id : null
      };
    },
    resetTabs: (state) => {
      return {
        ...state,
        tabs: [],
        tabCnt: 1,
      };
    },
    addTab: (state, action) => {
      return {
        ...state,
        tabs: [...state.tabs, action.payload],
        tabCnt: state.tabCnt + 1,
      };
    },
    removeTab: (state, action) => {
      const updatedTabs = state.tabs.filter((tab) => tab.id !== action.payload);
      return {
        ...state,
        tabs: updatedTabs,
      };
    },
    updateTab: (state, action) => {
      //обновить вкладку
      const { id, newContent, newValidateForm } = action.payload;

      //поиск по дереву state.items
      const findNodeById = (items, targetId) => {
        for (let item of items) {
          if (item.id === targetId) {
            return item; //нашли элемент
          }
          
          //рекурсия для детей
          if (item.children && item.children.length > 0) {
            let foundInChildren = findNodeById(item.children, targetId);        
            if (foundInChildren !== undefined) {
              return foundInChildren; //вернули найденный элемент из потомков
            }
          }
        }
        return undefined; //ничего не нашли
      }
      
      //найти технологию и операцию в state.items
      const operation = findNodeById(state.items, id);
      const technology = findNodeById(state.items, operation.parentId);

      //orderNumber
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
      //
      return {
        ...state,
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
                          formValues: newContent.formValues,
                          formErrors: newContent.formErrors,
                          expandedPanels: newContent.expandedPanels,
                          changedValues: newContent.changedValues,
                          isDeleted: newContent.isDeleted,
                          validateForm: newValidateForm
                        }                        
                      }
                    : child                
                ),                
              }
            : item
        )
      };
    },
    setTabValue: (state, action) => {
      return {
        ...state,
        tabValue: action.payload,
      }
    },
    setShouldReloadTabs: (state, action) => {
      return {
        ...state,
        shouldReloadTabs: action.payload
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSavedData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSavedData.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getSavedData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });      
  },
});

export const { 
  clearItems, addItems,
  setSelectedItems, deleteSelectedItems,
  setSelectedId,
  restoreItems,
  setTabs, resetTabs, addTab, removeTab, updateTab, setTabValue, setShouldReloadTabs, setCheckedItems
} = technologiesSlice.actions;

//селекторы
export const selectItems = (state) => state.technologies.items || [];
export const selectSelectedItems = (state) => state.technologies.selectedItems || [];
export const selectLoading = (state) => state.technologies.loading;

export default technologiesSlice.reducer;