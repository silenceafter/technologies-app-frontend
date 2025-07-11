import { createSlice } from '@reduxjs/toolkit';
import { logout } from './logoutSlice';

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
    //logout
    builder.addCase(logout, (state) => {
      Object.keys(state).forEach(key => delete state[key]);
    });
  },
});

export const { setUnsavedChanges, resetUnsavedChanges } = unsavedChangesSlice.actions;
export default unsavedChangesSlice.reducer;