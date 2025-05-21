import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import { thunk } from 'redux-thunk'; // Middleware для асинхронных действий
//import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import operationsListReducer from './slices/lists/operationsListSlice';
import jobsListReducer from './slices/lists/jobsListSlice';
import measuringToolsListReducer from './slices/lists/measuringToolsListSlice';
import toolingListReducer from './slices/lists/toolingListSlice';
import componentsListReducer from './slices/lists/componentsListSlice';
import materialsListReducer from './slices/lists/materialsListSlice';
import productsListReducer from './slices/lists/productsListSlice';
import technologiesListReducer from './slices/lists/technologiesListSlice';
import equipmentListReducer from './slices/lists/equipmentListSlice';
import getRequestReducer from './reducers/getRequestReducer';
import headerReducer from './slices/headerSlice';
import drawingsReducer from './slices/drawingsSlice';
import usersReducer from './slices/usersSlice';
import technologiesReducer from './slices/technologiesSlice';
import operationsReducer from './slices/operationsSlice';
import unsavedChangesReducer from './slices/unsavedChangesSlice';
import technologiesPrefixReducer from './slices/technologiesPrefixSlice';
import notificationsReducer from './slices/notificationsSlice';
import dashboardReducer from './slices/dashboardSlice';
import { Dashboard } from '@mui/icons-material';

//корневой редьюсер
const rootReducer = combineReducers({  
  /*technologiesList: technologiesListReducer,*/
  operationsList: operationsListReducer,
  jobsList: jobsListReducer,
  measuringToolsList: measuringToolsListReducer,
  toolingList: toolingListReducer /* оснастка */,
  componentsList: componentsListReducer,
  materialsList: materialsListReducer,
  productsList: productsListReducer,
  equipmentList: equipmentListReducer,
  unsavedChanges: unsavedChangesReducer,
  getRequest: getRequestReducer,
  header: headerReducer,
  drawings: drawingsReducer,
  technologies: technologiesReducer,
  technologiesPrefix: technologiesPrefixReducer,
  operations: operationsReducer,
  users: usersReducer, /* храним обязательно */  
  notifications: notificationsReducer,
  dashboard: dashboardReducer,
});

//конфигурация persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['users']
  /*stateReconciler: autoMergeLevel2,*/
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

//хранилище redux
const store = configureStore({
  reducer: persistedReducer, /*rootReducer,*/
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck:false}).concat(thunk),
});

const persistor = persistStore(store);
export { store, persistor };