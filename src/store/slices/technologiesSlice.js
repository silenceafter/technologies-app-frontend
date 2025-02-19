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
      const targetItemId = action.payload.itemId; // Получаем id из action.payload
      const childrenItemIds = Array.isArray(action.payload.children)
        ? action.payload.children.map(child => child.itemId) 
        : []; // Проверяем, является ли children массивом и извлекаем id из каждого ребенка
    
      const itemsToRemove = [targetItemId, ...childrenItemIds]; // Собираем все id, которые нужно удалить
    
      return {
        ...state,
        disabledItems: state.disabledItems.filter(itemId => !itemsToRemove.includes(itemId)), // Убираем все найденные id
        items: state.items.map(item => {
          if (item.id === targetItemId) {
            // Если найден основной элемент, снимаем selected у него и у всех детей
            return {
              ...item,
              selected: false,
              children: item.children
                ? item.children.map(child => ({ ...child, selected: false })) // Снимаем selected у детей
                : item.children
            };
          }
    
          // Для всех других элементов проверяем детей
          return {
            ...item,
            children: item.children
              ? item.children.map(child =>
                  child.id === targetItemId
                    ? { ...child, selected: false } // Если это выбранный дочерний элемент, снимаем selected
                    : child
                )
              : item.children
          };
        })
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