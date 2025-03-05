import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectDrawingExternalCode, setTechnology } from './drawingsSlice';

const LOADING_DEFAULT = false;
const initialState = {
  loading: LOADING_DEFAULT,
  error: null,
  user: null,
};

//загрузка данных пользователя
export const getUserData = createAsyncThunk(
  'users/getUserData',
  async ({}, { getState }) => {

      const state = getState();
      const response = await fetch('http://localhost/Ivc/Ogt/ExecuteScripts/GetUserData.v0.php', {
        method: 'GET',
        /*headers: {
          'Content-Type': 'application/json',
        },*/
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }
      return data;
  
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setTokens: (state) => {
      const enterid = localStorage.getItem('enterid');
      const usrhash = localStorage.getItem('usrhash');
      //
      return {
        ...state,
        user: {
          ...state.user,
          enterid: enterid,
          usrhash: usrhash,
        },
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setTokens } = usersSlice.actions;
export default usersSlice.reducer;