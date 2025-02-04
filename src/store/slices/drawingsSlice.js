import { createSlice } from '@reduxjs/toolkit';

//данные текущего сеанса (код, который выбран; технология, которая выбрана; операция, которая выбрана)
const initialState = {
  drawing: {
    externalCode: '',
    internalCode: '',
    name: '',
  },
  technology: { name: '', code: '' },
  operation: { name: '', code: '' }
};

const drawingsSlice = createSlice({
  name: 'drawings',
  initialState,
  reducers: {
    setDrawing: (state, action) => {
      state.drawing.externalCode = action.payload.externalCode;
      state.drawing.internalCode = action.payload.internalCode;
      state.drawing.name = action.payload.name;
    },
    clearDrawing: (state) => {
      state.drawing.externalCode = '';
      state.drawing.internalCode = '';
      state.drawing.name = '';
    },
    setTechnology: (state, action) => {
      state.technology.name = action.payload.name;
      state.technology.code = action.payload.code;
    },
    clearTechnology: (state) => {
      state.technology.name = '';
      state.technology.code = '';
    },
    setOperation: (state, action) => {
      state.operation.name = action.payload.name;
      state.operation.code = action.payload.code;
    },
  },
});

export const selectDrawingExternalCode = (state) => state?.drawings?.drawing?.externalCode || '';
export const selectTechnology = (state) => state?.drawings?.technology || {};
export const selectOperation = (state) => state?.drawings?.operation || {};

export const { setDrawing, clearDrawing, setTechnology, clearTechnology, setOperation } = drawingsSlice.actions;
export default drawingsSlice.reducer;