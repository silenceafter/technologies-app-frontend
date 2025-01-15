import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  externalCode: '',
  internalCode: '',
  name: ''
};

const drawingsSlice = createSlice({
  name: 'drawings',
  initialState,
  reducers: {
    setDrawing: (state, action) => {
      state.externalCode = action.payload.externalCode;
      state.internalCode = action.payload.internalCode;
      state.name = action.payload.name;
    }
  },
});

export const selectDrawingExternalCode = (state) => state.drawings.externalCode;
export const { setDrawing } = drawingsSlice.actions;
export default drawingsSlice.reducer;