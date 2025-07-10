import { createSlice } from '@reduxjs/toolkit';
import { logout } from './logoutSlice';

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
  extraReducers: (builder) => {
    //logout
    builder.addCase(logout, (state) => {
      Object.keys(state).forEach(key => delete state[key]);
    });
  },
});

export const { setUnsavedChanges } = unsavedChangesSlice.actions;
export default unsavedChangesSlice.reducer;