import { createSlice } from '@reduxjs/toolkit';

//данные текущего сеанса (код, который выбран; технология, которая выбрана; операция, которая выбрана)
const initialState = {
  drawing: null,
  technology: null,
  operation: null, /*?*/
  loading: false,
  error: null,
};

//сохранить введенные данные
const drawingsSlice = createSlice({
  name: 'drawings',
  initialState,
  reducers: {
    setDrawing: (state, action) => {
      return {
        ...state,
        drawing: action.payload,
      };
    },
    /*clearDrawing: (state) => {
      return {
        ...state,
        drawing: null
      };
    },*/
    setTechnology: (state, action) => {
      return {
        ...state,
        technology: action.payload,
      };
    },
    /*clearTechnology: (state) => {
      return {
        ...state,
        technology: null,
      };
    },*/
    setOperation: (state, action) => {
      state.operation.name = action.payload.name;
      state.operation.code = action.payload.code;
    },
    resetDrawings: () => initialState,
  },
  extraReducers: (builder) => {
  },
});

export const selectDrawingExternalCode = (state) => state?.drawings?.drawing?.externalcode || '';
export const selectTechnology = (state) => state?.drawings?.technology || {};
export const selectOperation = (state) => state?.drawings?.operation || {};

export const { setDrawing, /*clearDrawing,*/ setTechnology, /*clearTechnology,*/ setOperation, resetDrawings } = drawingsSlice.actions;
export default drawingsSlice.reducer;