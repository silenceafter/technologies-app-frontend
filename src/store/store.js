import { configureStore } from '@reduxjs/toolkit';
/*import authReducer from './reducers/authReducer';
import getRequestReducer from './reducers/getRequestReducer';
import postRequestReducer from './reducers/postRequestReducer';
import routerReducer from './reducers/routerReducer';
import sidebarReducer from './slices/sidebarSlice';
import { combineReducers } from 'redux';*/
import { thunk } from 'redux-thunk'; // Middleware для асинхронных действий

//корневой редьюсер
/*const rootReducer = combineReducers({
  auth: authReducer,
  getRequest: getRequestReducer,
  postRequest: postRequestReducer,
  social: sidebarReducer,
  router: routerReducer,
});*/
const rootReducer = (state = {}, action) => {
    return state; // просто возвращает текущее состояние
    };

//хранилище redux
const store = configureStore({
  reducer: rootReducer
});

export default store;