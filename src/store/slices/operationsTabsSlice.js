import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectOperations } from './operationsSlice';

//данные текущего сеанса (код, который выбран; технология, которая выбрана; операция, которая выбрана)
const initialState = {
  tabs: [],
  tabValue: 0,
  validateForm: () => true,
  autocompleteOptions: {},
  loading: false,
  error: null,
};

//сохранить введенные данные
/*export const setData = createAsyncThunk(
  'technologiesTree/setData',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost/Ivc/Ogt/ExecuteScripts/SetData.v0.php', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ошибка запроса');
      return { payload };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);*/

const operationsTabsSlice = createSlice({
  name: 'operationsTabs',
  initialState,
  reducers: {
    /*setTabs: (state, action) => {

    },
    setTabValue: (state, action) => {
      
    },
    setValidateForm: (state, action) => {
      
    },*/
    setAutocompleteOptions: (state, action) => {
      const hh = selectOperations(state);
      console.log('jj');
    }
  },
  /*extraReducers: (builder) => {
    builder
      .addCase(setData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setData.fulfilled, (state, action) => {
        state.loading = false;        
      })
      .addCase(setData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    },*/
});

/*export const selectDrawingExternalCode = (state) => state?.drawings?.drawing?.externalCode || '';
export const selectTechnology = (state) => state?.drawings?.technology || {};
export const selectOperation = (state) => state?.drawings?.operation || {};

export const { setDrawing, clearDrawing, setTechnology, clearTechnology, setOperation } = drawingsSlice.actions;*/
export const { setAutocompleteOptions } = operationsTabsSlice.actions;
export default operationsTabsSlice.reducer;