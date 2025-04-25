import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
  hasMore: true,
  search: '',
  limit: 100,
  page: 1,
};

//поиск технологии
export const fetchData = createAsyncThunk(
  'technologiesTree/fetchData',
  async ({ search, limit, page }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost/ivc/ogt/executescripts/gettechnologies.v2.php?search=&&limit=50&page=1');
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

const technologiesListSlice = createSlice({
  name: 'technologiesList',
  initialState,
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
  },
});

//селекторы
export const selectItems = (state) => state.technologiesList.items || [];
export const selectLoading = (state) => state.technologiesList.loading;
export const selectError = (state) => state.technologiesList.error;
export const selectTechnologies = (state) => state.technologiesList;

export default technologiesListSlice.reducer;