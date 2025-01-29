import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectDrawingExternalCode } from './drawingsSlice';

const LOADING_DEFAULT = false;
const initialState = {
  items: [], /* основные элементы дерева */
  additionalItems: [], /* элементы технологий и операций (не являются дочерними элементами дерева) */
  loading: LOADING_DEFAULT,
  error: null
};

//загрузка списка изделий (корневые элементы)
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
      state.items = [];
      state.loading = LOADING_DEFAULT;
    },
    setAdditionalItems: (state, action) => {
      const newItems = Array.isArray(action.payload) ? action.payload : [action.payload];
      return {
        ...state,
        additionalItems: [...state.additionalItems, ...newItems]
      };
      /*return {
        ...state,
        additionalItems: [...state.additionalItems, ...action.payload]
      };*/
    },
    setClearAdditionalItems: (state) => {
      state.additionalItems = [];
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
        //
        state.items = [...state.items, ...newItems];
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });                    
  },
});

export const { setItems, setAdditionalItems, setClearAdditionalItems } = technologiesSlice.actions;
export const selectItems = (state) => state.technologies.items || [];
export const selectAdditionalItems = (state) => state.technologies.additionalItems || [];
export default technologiesSlice.reducer;