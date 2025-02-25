import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectDrawingExternalCode, setTechnology } from './drawingsSlice';
import { act } from 'react';

const LOADING_DEFAULT = false;
const initialState = {
  items: [], /* основные элементы дерева */
  selectedItems: [], /* выделенные элементы */
  disabledItems: [], /* помеченные на удаление */
  loading: LOADING_DEFAULT,
  error: null,
  newItemCnt: 1,
  developer: 'Пинаев Александр Алексеевич', /* null */
  //
  searchedItems: [],
  searchedLoading: false,
  searchedError: null,
  searchedHasMore: true,
  search: '',
  limit: 100,
  page: 1,
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
        label: item.label || 'Unnamed Item',
        secondaryLabel: item.secondaryLabel || null,
        children: item.children.map(processItem) || [],
        type: item.type,
      });
      return data.map(processItem);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//удалить технологии и/или операции
export const deleteSavedData = createAsyncThunk(
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
);

//поиск технологии
export const fetchData = createAsyncThunk(
  'technologiesTree/fetchData',
  async ({ search, limit, page }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost/ivc/ogt/executescripts/gettechnologies.v2.php?search=${search}&&limit=${limit}&page=${page}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const technologiesSlice = createSlice({
  name: 'technologies',
  initialState,
  reducers: {
    clearItems: (state) => {
      return {
        ...state,
        items: [],
        loading: LOADING_DEFAULT
      }
    },
    setItems: (state, action) => {
      switch(action.payload.type) {
        case 'delete':
          return {
            ...state,
            items: state.items
              .filter(item => !action.payload.selectedItems.includes(item.id))
              .map(item => ({
                ...item,
                children: item.children
                  ? item.children.filter(child => !action.payload.selectedItems.includes(child.id))
                  : item.children
              }))
          };

        default:
          return state;
      }        
    },
    setSelectedItems: (state, action) => {
      return {
        ...state,
        selectedItems: action.payload
      };
    },
    addItems: (state) => {
      return {
        ...state,
        newItemCnt: state.newItemCnt + 1,
        items: [...state.items, { id: generateUUID(), label: `Новая технология ${state.newItemCnt}`, secondaryLabel: 'Описание', children: [], parentId: null, type: 'technology' }]
      };
    },
    addSelectedItems: (state, action) => {
      return {
        ...state,
        selectedItems: state.selectedItems.includes(action.payload)
          ? state.selectedItems
          : [...state.selectedItems, action.payload]
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
    setDisabledItems: (state, action) => {
      return {
        ...state,
        disabledItems: action.payload
      };
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
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1;
      state.searchedItems = [];
      state.searchedHasMore = true;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;      
    },
    setPage: (state, action) => {
       state.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSavedData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSavedData.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = action.payload.filter(newItem => 
          !state.items.some(existingItem => existingItem.id === newItem.id)
        );
        state.items = [...state.items, ...newItems];
      })
      .addCase(getSavedData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchData.pending, (state) => {
        state.searchedLoading = true;
        state.searchedError = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.searchedLoading = false;
        const newItems = action.payload.data.filter(newItem => 
          !state.searchedItems.some(existingItem => {
            return `${existingItem.code}-${existingItem.name}` === 
                `${newItem.code}-${newItem.name}`;
            })
        );
        //
        state.searchedItems = [...state.searchedItems, ...newItems];//добавляем только новые данные к существующему списку
        if (newItems.length < state.limit) {
          state.searchedHasMore = false;//если меньше лимита, прекращаем подгрузку
        }
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.searchedLoading = false;
        state.searchedHasMore = false;
        state.searchedError = action.payload;
      });                    
  },
});

export const { 
  clearItems, setItems, addItems,
  setSelectedItems, addSelectedItems, deleteSelectedItems,
  setDisabledItems, restoreItems,
  setSearch, setLimit, setPage
} = technologiesSlice.actions;

//селекторы
export const selectItems = (state) => state.technologies.items || [];
export const selectSelectedItems = (state) => state.technologies.selectedItems || [];
export const selectSearchedItems = (state) => state.technologies.searchedItems || [];
export const selectLoading = (state) => state.technologies.loading;
export const selectError = (state) => state.header.error;

export default technologiesSlice.reducer;