import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectDrawingExternalCode, setTechnology } from './drawingsSlice';

const LOADING_DEFAULT = false;
const initialState = {
  items: [], /* основные элементы дерева */
  loading: LOADING_DEFAULT,
  error: null,
};

//загрузка технологий и операций по коду ДСЕ
export const fetchData = createAsyncThunk(
  'technologiesTree/fetchData',
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
        children: item.children.map(processItem) || []
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
    setItems: (state) => {
      return {
        ...state,
        items: [],
        loading: LOADING_DEFAULT
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = action.payload.filter(newItem => 
          !state.items.some(existingItem => existingItem.id === newItem.id)
        );
        state.items = [...state.items, ...newItems];
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });                    
  },
});

export const { setItems } = technologiesSlice.actions;

//селекторы
export const selectItems = (state) => state.technologies.items || [];
export const selectLoading = (state) => state.technologies.loading;
export const selectError = (state) => state.header.error;

export default technologiesSlice.reducer;