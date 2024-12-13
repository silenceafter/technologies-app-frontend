import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectSearch } from './headerSlice';
import { method } from 'lodash';

const initialState = {
  items: [],
  itemsDetails: [],
  loading: false,
  error: null,
  limit: 50,
  page: 1,
  hasMore: true,
};

//загрузка списка изделий (корневые элементы)
export const fetchData = createAsyncThunk(
  'drawingsAllTree/fetchData',
  async ({ limit, page }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      //const { limit, page } = state.drawingsAllTree;
      const search = selectSearch(state);
      //
      const response = await fetch(`http://localhost/Ivc/Ogt/ExecuteScripts/CreateDataTree.v0.php?search=${search}&&limit=${limit}&page=${page}`);
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

//загрузка элементов списка (вложенные элементы)
export const fetchDataDetails = createAsyncThunk(
  'drawingsAllTree/fetchDataDetails',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const search = selectSearch(state);
      //
      const response = await fetch(`http://localhost/Ivc/Ogt/ExecuteScripts/GetDataTreeItem.v0.php?search=${search}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }
    } catch(error) {

    }
  }
);


const drawingsAllTreeSlice = createSlice({
  name: 'drawingsAllTree',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
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
        state.items = [...state.items, ...newItems];//добавляем только новые данные к существующему списку        
        if (newItems.length < state.limit) {
          state.hasMore = false;//если меньше лимита, прекращаем подгрузку
        }
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hasMore = false;
      })
      .addCase(fetchDataDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDataDetails.fulfilled, (state, action) => {
        state.loading = false;
        const { itemId, details } = action.payload;
        state.DataDetails[itemId] = details;
      })
      .addCase(fetchDataDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setPage } = drawingsAllTreeSlice.actions;
export const selectItems = (state) => state.drawingsAllTreeSlice.items || [];
export const selectDataDetails = (state, itemId) => state.drawingsAllTree.DataDetails[itemId] || null;
export default drawingsAllTreeSlice.reducer;