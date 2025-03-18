import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectOperations } from './operationsSlice';

//данные текущего сеанса (код, который выбран; технология, которая выбрана; операция, которая выбрана)
const initialState = {
  tabs: [
    /*{ 
      id: "1", 
      title: "Вкладка 1", 
      content: { formValues: {}, formErrors: {}, expandedPanels: {} },
      validateForm: () => true,
    }*/
  ],
  tabValue: 0,
  tabCnt: 1,
  validateForm: false,
  loading: false,
  error: null,
  expandedPanelsDefault: { 
    parameters: true,
    equipment: true,
    components: true,
    materials: true,
    tooling: true,
    measuringTools: true
  }
};

//сохранить введенные данные
export const setData = createAsyncThunk(
  'technologiesTree/setData',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost/Ivc/Ogt/ExecuteScripts/SetData.v0.php', {
        method: 'POST',
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ошибка запроса');
      return { payload };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const operationsTabsSlice = createSlice({
  name: 'operationsTabs',
  initialState,
  reducers: {
    setTabs: (state, action) => {
      return {
        ...state,
        tabs: action.payload,
        tabCnt: action.payload.length + 1,
        activeTabId: action.payload.length > 0 ? action.payload[0].id : null
      };
    },
    resetTabs: (state) => {
      return {
        ...state,
        tabs: [],
      };
    },
    addTab: (state, action) => {
      return {
        ...state,
        tabs: [...state.tabs, action.payload],
        /*tabValue: action.payload.id,*/
        tabCnt: state.tabCnt + 1,
      };
    },
    removeTab: (state, action) => {
      const updatedTabs = state.tabs.filter((tab) => tab.id !== action.payload);
      return {
        ...state,
        tabs: updatedTabs,
        /*tabValue: state.tabValue != 0 ? state.tabValue - 1 : 0,*/
        /*tabValue: updatedTabs.length ? updatedTabs[0].id : null,*/
      };
    },
    updateTab: (state, action) => {
      const { id, newContent, newValidateForm } = action.payload;
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === id
            ? {
                ...tab,
                content: {
                  ...tab.content,
                  formValues: newContent.formValues,
                  formErrors: newContent.formErrors || tab.content.formErrors,
                  expandedPanels: newContent.expandedPanels || tab.content.expandedPanels,
                },
                validateForm: newValidateForm || tab.validateForm,
              }
            : tab
        ),
        /*validateForm: true,*/
      };
    },
    setTabValue: (state, action) => {
      return {
        ...state,
        tabValue: action.payload,
      }
    },
    toggleValidateFormInSlice: (state) => {
      state.validateForm = !state.validateForm;
    },
    incrementTabCnt: (state) => {
      return {
        ...state,
        tabCnt: state.tabCnt + 1,
      };
    },
    decrementTabCnt: (state) => {
      return {
        ...state,
        tabCnt: state.tabCnt - 1,
      }
    },
    incrementTabValue: (state) => {
      return {
        ...state,
        tabValue: state.tabValue + 1,
      };
    },
  },
  /*extraReducers: (builder) => {
    builder
      .addCase(setData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setData.fulfilled, (state, action) => {
        state.loading = false;        
      })
      .addCase(setData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    },*/
});

/*export const selectDrawingExternalCode = (state) => state?.drawings?.drawing?.externalCode || '';
export const selectTechnology = (state) => state?.drawings?.technology || {};
export const selectOperation = (state) => state?.drawings?.operation || {};

export const { setDrawing, clearDrawing, setTechnology, clearTechnology, setOperation } = drawingsSlice.actions;*/
export const { setTabs, resetTabs, addTab, removeTab, updateTab, setTabValue, toggleValidateFormInSlice, incrementTabCnt, decrementTabCnt, incrementTabValue } = operationsTabsSlice.actions;
export default operationsTabsSlice.reducer;