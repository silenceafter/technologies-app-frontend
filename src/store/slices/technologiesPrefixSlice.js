import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

//поиск технологии
export const fetchData = createAsyncThunk(
  'technologiesTree/fetchData',
  async ({UID, ivHex, keyHex}, { rejectWithValue }) => {
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseUrl}/ivc/ogt/executescripts/gettechnologiesprefix.v0.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: JSON.stringify({ UID: UID, ivHex: ivHex, keyHex: keyHex }),
      }); /* http://192.168.15.72/ivc/ogt/executescripts/gettechnologiesprefix.v0.php */
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

const technologiesPrefixSlice = createSlice({
  name: 'technologiesPrefix',
  initialState,
  reducers: {
    resetTechnologiesPrefix: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = action.payload;
        state.items = newItems;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

//селекторы
export const selectItems = (state) => state.technologiesPrefix.items || [];
export const selectLoading = (state) => state.technologiesPrefix.loading;
export const selectError = (state) => state.technologiesPrefix.error;

export const { resetTechnologiesPrefix } = technologiesPrefixSlice.actions;
export default technologiesPrefixSlice.reducer;