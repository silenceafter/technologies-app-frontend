import { configureStore } from '@reduxjs/toolkit';

import getRequestReducer from './reducers/getRequestReducer';
import headerReducer from './slices/headerSlice';
/*import postRequestReducer from './reducers/postRequestReducer';
import routerReducer from './reducers/routerReducer';
import sidebarReducer from './slices/sidebarSlice';*/
import { combineReducers } from 'redux';
import { thunk } from 'redux-thunk'; // Middleware для асинхронных действий

//корневой редьюсер
const rootReducer = combineReducers({
  getRequest: getRequestReducer,
  header: headerReducer,
  /*postRequest: postRequestReducer,
  social: sidebarReducer,
  router: routerReducer,*/
});

//хранилище redux
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck:false}).concat(thunk),
});

export default store;