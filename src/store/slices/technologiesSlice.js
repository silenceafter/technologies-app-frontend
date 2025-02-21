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
};

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
      /*return {
        ...state,
        items: state.items.map(item => ({
          ...item,
          children: item.children
            ? item.children.filter(child => !action.payload.includes(child.id))
            : []
        }))
      };*/           
    },
    setSelectedItems: (state, action) => {
      return {
        ...state,
        selectedItems: action.payload
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
      const selectedItemsData = state.items
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
      };
    },
    setDisabledItems: (state, action) => {
      return {
        ...state,
        disabledItems: action.payload
      };
    },
    deleteDisabledItems: (state, action) => {
      const targetItemId = action.payload;
      let parentId = null;
      let foundItem = null;

      //поиск элемента и его родителя
      const findItemAndParent = (items, parent = null) => {
        for (const item of items) {
          if (item.id === targetItemId) {
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
      findItemAndParent(state.items);

      //если элемент не найден — ничего не делаем
      if (!foundItem) return state;

      //получаем id всех детей, если это родительский элемент
      const childrenIds = foundItem.children?.map(child => child.id) || [];

      //собираем все id, которые нужно восстановить (элемент + его дети + родитель, если есть)
      const itemsToRestore = [targetItemId, ...childrenIds];
      if (parentId) {
        itemsToRestore.push(parentId);
      }
      //
      return {
        ...state,
        //убираем эти id из disabledItems
        disabledItems: state.disabledItems.filter(itemId => !itemsToRestore.includes(itemId))
      };
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
      });                    
  },
});

export const { 
  clearItems, setItems, 
  setSelectedItems, addSelectedItems, deleteSelectedItems,
  setDisabledItems, deleteDisabledItems
} = technologiesSlice.actions;

//селекторы
export const selectItems = (state) => state.technologies.items || [];
export const selectSelectedItems = (state) => state.technologies.selectedItems || [];
export const selectLoading = (state) => state.technologies.loading;
export const selectError = (state) => state.header.error;

export default technologiesSlice.reducer;