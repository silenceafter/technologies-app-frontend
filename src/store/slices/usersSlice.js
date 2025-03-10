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
  async ({}, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const response = await fetch('http://localhost/Ivc/Ogt/index.php', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Network response was not ok');
        }
        return data;
    } catch(error) {
      return rejectWithValue(error.message);
    }        
  }
);

//авторизация
export const signIn = createAsyncThunk(
  'users/signIn',
  async ({ login, password }, { getState, rejectWithValue }) => {
    try {
        const state = getState();

        //параметры
        const formData = new URLSearchParams();
        formData.append('login', login);
        formData.append('password', password);

        //запрос
        const response = await fetch('http://localhost/Ivc/Ogt/index.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
          credentials: 'include'
        });
        const data = await response.text();
        if (!response.ok) {
          throw new Error(data.message || 'Network response was not ok');
        }

        //обработка html-ответа
        const errorMessages = ['Не верный логин или пароль', 'Пользователь не зарегистрирован'];
        for (const errorMessage of errorMessages) {
          if (data.includes(errorMessage)) {
            //пользователю не авторизован      
            return errorMessage;
          }
        }
        return '';
    } catch(error) {
      return rejectWithValue(error.message);
    }        
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
      })
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      ;
  },
});

export const { setTokens } = usersSlice.actions;
export default usersSlice.reducer;