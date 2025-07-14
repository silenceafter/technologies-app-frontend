import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hasUnsavedChanges: false,
};

const unsavedChangesSlice = createSlice({
  name: 'unsavedChanges',
  initialState,
  reducers: {
    setUnsavedChanges: (state, action) => {
      state.hasUnsavedChanges = action.payload;
    },
    resetUnsavedChanges: () => initialState,
  },
  extraReducers: (builder) => {
  },
});

export const { setUnsavedChanges, resetUnsavedChanges } = unsavedChangesSlice.actions;
export default unsavedChangesSlice.reducer;