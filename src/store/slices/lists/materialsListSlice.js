import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logout } from '../logoutSlice';

const initialState = {
  items: [],
  loading: false,
  error: null,
  hasMore: true,
  search: '',
  limit: 100,
  page: 1,
};

export const fetchData = createAsyncThunk(
  'materialsList/fetchData',
  async ({ search, limit, page }, { rejectWithValue }) => {
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseUrl}/ivc/ogt/executescripts/getmaterials.v0.php?search=${search}&&limit=${limit}&page=${page}`); /* http://localhost/ivc/ogt/executescripts/getmaterials.v0.php?search=${search}&&limit=${limit}&page=${page} */
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

const materialsListSlice = createSlice({
  name: 'materialsList',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1;
      state.items = [];
      state.hasMore = true;
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
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = action.payload.data.filter(newItem => 
          !state.items.some(existingItem => {
            return `${existingItem.code}-${existingItem.name}` === 
                `${newItem.code}-${newItem.name}`;
            })
        );
        //
        state.items = [...state.items, ...newItems];//добавляем только новые данные к существующему списку
        if (newItems.length < state.limit) {
          state.hasMore = false;//если меньше лимита, прекращаем подгрузку
        }
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.hasMore = false;
        state.error = action.payload;
      });

    //logout
    /*builder.addCase(logout, (state) => {
      Object.keys(state).forEach(key => delete state[key]);
    });*/
  },
});

//селекторы
export const selectSearch = (state) => state.materialsList.search;
export const selectLimit = (state) => state.materialsList.limit;
export const selectPage = (state) => state.materialsList.page;

export const { setSearch, setLimit, setPage } = materialsListSlice.actions;
export default materialsListSlice.reducer;