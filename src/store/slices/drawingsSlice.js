import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { act } from 'react';

//данные текущего сеанса (код, который выбран; технология, которая выбрана; операция, которая выбрана)
const initialState = {
  drawing: null,
  technology: null,
  operation: { name: '', code: '' },/*?*/
  loading: false,
  error: null,
};

//сохранить введенные данные
export const setData = createAsyncThunk(
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
);

const drawingsSlice = createSlice({
  name: 'drawings',
  initialState,
  reducers: {
    setDrawing: (state, action) => {
      /*state.drawing.externalCode = action.payload.externalCode;
      state.drawing.internalCode = action.payload.internalCode;
      state.drawing.name = action.payload.name;*/
      return {
        ...state,
        drawing: action.payload,
      };
    },
    clearDrawing: (state) => {
      /*state.drawing.externalCode = '';
      state.drawing.internalCode = '';
      state.drawing.name = '';*/
      return {
        ...state,
        drawing: null
      };
    },
    setTechnology: (state, action) => {
      /*state.technology.name = action.payload.name;
      state.technology.code = action.payload.code;*/
      return {
        ...state,
        technology: action.payload,
      };
    },
    clearTechnology: (state) => {
      /*state.technology.name = '';
      state.technology.code = '';*/
      return {
        ...state,
        technology: null,
      };
    },
    setOperation: (state, action) => {
      state.operation.name = action.payload.name;
      state.operation.code = action.payload.code;
    },
  },
  extraReducers: (builder) => {
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
    },
});

export const selectDrawingExternalCode = (state) => state?.drawings?.drawing?.externalcode || '';
export const selectTechnology = (state) => state?.drawings?.technology || {};
export const selectOperation = (state) => state?.drawings?.operation || {};

export const { setDrawing, clearDrawing, setTechnology, clearTechnology, setOperation } = drawingsSlice.actions;
export default drawingsSlice.reducer;