import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectDrawingExternalCode, setTechnology } from './drawingsSlice';
import { act } from 'react';

const LOADING_DEFAULT = false;
const initialState = {
  items: [], /* основные элементы дерева */
  selectedItems: [],
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
      state.selectedItems = action.payload;
    },
    addSelectedItems: (state, action) => {
      if (!state.selectedItems.includes(action.payload)) {
        state.selectedItems.push(action.payload);
      }
    },
    removeSelectedItems: (state, action) => {
      state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
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
  setSelectedItems, addSelectedItems, removeSelectedItems
} = technologiesSlice.actions;

//селекторы
export const selectItems = (state) => state.technologies.items || [];
export const selectSelectedItems = (state) => state.technologies.selectedItems || [];
export const selectLoading = (state) => state.technologies.loading;
export const selectError = (state) => state.header.error;

export default technologiesSlice.reducer;