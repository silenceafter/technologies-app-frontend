import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectDrawingExternalCode, setTechnology } from './drawingsSlice';

const LOADING_DEFAULT = false;
const initialState = {
  loading: LOADING_DEFAULT,
  error: null,
  user: null,
  isAuthenticated: false,
};

//загрузка данных пользователя
export const authenticate = createAsyncThunk(
  'users/authenticate',
  async ({}, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const response = await fetch('http://localhost/Ivc/Ogt/ExecuteScripts/GetUserData.v0.php', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          credentials: 'include'
        });
        //
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Network response was not ok');
        }
        return data;                
    } catch(error) {
      return rejectWithValue({ isAuthenticated: false, errorMessage: error.message, user: null });
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

//выйти из учетной записи
export const signOut = createAsyncThunk(
  'users/signOut',
  async (_, { rejectWithValue }) => {
    try {
      //запрос
      const response = await fetch('http://localhost/Ivc/Ogt/index.php?action=signout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include'
      });
      //
      const data = await response.text();
      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }
      return data;
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
    //authenticate
    builder.addCase(authenticate.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(authenticate.fulfilled, (state, action) => {      
      //обработка ответа
      const errorMessage = 'Данные авторизации повреждены. Авторизуйтесь повторно!(0)'; 
      const userMessage = action.payload.UserMessage; 
      let errorResponse = null;        
      if (userMessage != null) {
        //есть значение ошибки
        errorResponse = userMessage.trim().toLowerCase() == errorMessage.trim().toLowerCase() ? errorMessage : '';
      }
      
      //состояние
      const dataState = action.payload.DataState;
      if (dataState == 0) {
        state.isAuthenticated = false;
        state.user = null;
      } else if (dataState > 0) {
        state.isAuthenticated = true;
        state.user = action.payload.UserInfoArray;
      }
      //
      state.error = null;//errorResponse;
      state.loading = false;
    });
    builder.addCase(authenticate.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload.errorMessage;
      state.user = null;
    });

    //signIn
    builder.addCase(signIn.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    //signOut
    builder.addCase(signOut.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signOut.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.user = null;
    });
    builder.addCase(signOut.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { setTokens } = usersSlice.actions;
export default usersSlice.reducer;