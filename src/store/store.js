import { configureStore } from '@reduxjs/toolkit';

import getRequestReducer from './reducers/getRequestReducer';
import headerReducer from './slices/headerSlice';
import operationsReducer from './slices/operationsSlice';
import professionsReducer from './slices/professionsSlice';
import measuringToolsReducer from './slices/measuringToolsSlice';
import rigReducer from './slices/rigSlice';
import componentsReducer from './slices/componentsSlice';
import materialsReducer from './slices/materialsSlice';
/*import postRequestReducer from './reducers/postRequestReducer';
import routerReducer from './reducers/routerReducer';
import sidebarReducer from './slices/sidebarSlice';*/
import { combineReducers } from 'redux';
import { thunk } from 'redux-thunk'; // Middleware для асинхронных действий

//корневой редьюсер
const rootReducer = combineReducers({
  getRequest: getRequestReducer,
  header: headerReducer,
  operations: operationsReducer,
  professions: professionsReducer,
  measuringTools: measuringToolsReducer,
  rig: rigReducer /* оснастка */,
  components: componentsReducer,
  materials: materialsReducer,
  /*router: routerReducer,*/
});

//хранилище redux
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck:false}).concat(thunk),
});

export default store;