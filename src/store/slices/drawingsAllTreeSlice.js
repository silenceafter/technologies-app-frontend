import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { method } from 'lodash';

const initialState = {
  items: [],
  loading: false,
  error: null,
  search: '',
};

export const fetchData = createAsyncThunk(
  'drawingsAllTree/fetchData',
  async ({ search }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost/Ivc/Ogt/ExecuteScripts/CreateDataTree.v0.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search }),
      });
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

const drawingsAllTreeSlice = createSlice({
  name: 'drawingsAllTree',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.items = [];
    },    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = action.payload.data.filter(newItem => 
          !state.items.some(existingItem => {
            return `${existingItem.id}-${existingItem.label}` === 
                `${newItem.id}-${newItem.label}`;
            })
        );
        //
        state.items = [...state.items, ...newItems];//добавляем только новые данные к существующему списку
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

//селекторы
export const selectSearch = (state) => state.drawingsAllTree.search;
export const { setSearch } = drawingsAllTreeSlice.actions;
export default drawingsAllTreeSlice.reducer;