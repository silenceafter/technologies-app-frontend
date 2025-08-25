import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { property } from 'lodash';

const initialState = {
  addedUsersLoading: false,
  addedUsersError: null,
  addedUsersItems: [],
};

export const getAddedUsers = createAsyncThunk(
  'addedUsers',
  async (_, { rejectWithValue }) => {
    try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        const response = await fetch(`${baseUrl}/Ivc/Ogt/ExecuteScripts/GetAddedUsers.v0.php`, {
          method: 'GET',
          credentials: 'include'
        });
        //
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Network response was not ok');
        }
        return data;                
    } catch(error) {
      return rejectWithValue({ errorMessage: error.message });
    }        
  }
);

const adminSlice = createSlice({
  name: 'adminSlice',
  initialState,
  reducers: {
    resetAdmin: () => initialState,
  },
  extraReducers: (builder) => {
    //getAddedUsers
    builder.addCase(getAddedUsers.pending, (state) => {
      state.addedUsersLoading = true;
      state.addedUsersError = null;
    });
    builder.addCase(getAddedUsers.fulfilled, (state, action) => {      
      state.addedUsersItems = action.payload.data;
      state.addedUsersError = null;
      state.addedUsersLoading = false;
    });
    builder.addCase(getAddedUsers.rejected, (state, action) => {
      state.addedUsersLoading = false;
      state.addedUsersError = action.payload.message;
    });
  },
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;