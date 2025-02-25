import { configureStore } from '@reduxjs/toolkit';
import getRequestReducer from './reducers/getRequestReducer';
import headerReducer from './slices/headerSlice';
import operationsReducer from './slices/operationsSlice';
import jobsReducer from './slices/jobsSlice';
import measuringToolsReducer from './slices/measuringToolsSlice';
import toolingReducer from './slices/toolingSlice';
import componentsReducer from './slices/componentsSlice';
import materialsReducer from './slices/materialsSlice';
import unsavedChangesReducer from './slices/unsavedChangesSlice';
import productsReducer from './slices/productsSlice';
import drawingsReducer from './slices/drawingsSlice';
import technologiesReducer from './slices/technologiesSlice';
import equipmentReducer from './slices/equipmentSlice';
import usersReducer from './slices/usersSlice';
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
  jobs: jobsReducer,
  measuringTools: measuringToolsReducer,
  tooling: toolingReducer /* оснастка */,
  components: componentsReducer,
  materials: materialsReducer,
  unsavedChanges: unsavedChangesReducer,  
  drawings: drawingsReducer,
  technologies: technologiesReducer,
  products: productsReducer,
  equipment: equipmentReducer,
  users: usersReducer
  /*router: routerReducer,*/
});

//хранилище redux
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck:false}).concat(thunk),
});

export default store;