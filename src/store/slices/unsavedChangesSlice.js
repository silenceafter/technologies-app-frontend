import { createSlice } from '@reduxjs/toolkit';

const unsavedChangesSlice = createSlice({
  name: 'unsavedChanges',
  initialState: {
    hasUnsavedChanges: false,
  },
  reducers: {
    setUnsavedChanges: (state, action) => {
      state.hasUnsavedChanges = action.payload;
    },
  },
});

export const { setUnsavedChanges } = unsavedChangesSlice.actions;
export default unsavedChangesSlice.reducer;