import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
  search: '',
  limit: 100,
  max: 0,
};

export const fetchData = createAsyncThunk(
  'header/fetchData',
  async ({ search, limit, max }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost/ivc/ogt/executescripts/getdrawings.v0.php?search=${search}&&limit=${limit}&max=${max}`);
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

const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;      
    },
    setMax: (state, action) => {
       state.max = action.payload;
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
        state.items = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

//селекторы
export const selectSearch = (state) => state.header.search;
export const selectLimit = (state) => state.header.limit;
export const selectMax = (state) => state.header.max;

export const { setSearch, setLimit, setMax } = headerSlice.actions;
export default headerSlice.reducer;