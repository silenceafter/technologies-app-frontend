import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectLoading as itemsLoading } from './technologiesSlice';

//данные текущего сеанса (код, который выбран; технология, которая выбрана; операция, которая выбрана)
const initialState = {
  tabs: [],
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
  },
  shouldReloadTabs: false,
  response: null, /* коды ответов от сервера (сохранения) */
};

//сохранить введенные данные
export const setData = createAsyncThunk(
  'technologiesTree/setData',
  async (payload, { rejectWithValue }) => {
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseUrl}/Ivc/Ogt/ExecuteScripts/UpdateOperation.v0.php`, {
        method: 'POST',
        body: JSON.stringify(payload),
        credentials: 'include'
      }); /* http://192.168.15.72/Ivc/Ogt/ExecuteScripts/UpdateOperation.v0.php */
      /*if (!response.ok) throw new Error('Ошибка запроса');
      return response.ok && response.status == '200' ? true : false;*/

      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.status}`);
      }
      //
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const operationsSlice = createSlice({
  name: 'operations',
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
        tabCnt: 1,
      };
    },
    addTab: (state, action) => {
      return {
        ...state,
        tabs: [...state.tabs, action.payload],
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
      //обновить вкладку
      const { id, newContent, newValidateForm } = action.payload;

      //orderNumber
      //operationCode
      let operationCode = { code: id, name: 'Новая операция' };

      //если операция изменена
      if (newContent.changedValues.hasOwnProperty('operationCode')) {
        if (newContent.changedValues.operationCode) {
          operationCode.code = newContent.changedValues.operationCode.code;
          operationCode.name = newContent.changedValues.operationCode.name;
        }
      } else {
        const tab = state.tabs.find(tab => tab.id === id);
        if (tab.content.formValues.hasOwnProperty('operationCode')) {
          operationCode = tab.content.formValues.operationCode;
        }
      }

      //areaNumber
      let areaNumber = null;
      if (newContent.changedValues.hasOwnProperty('areaNumber')) {
        if (newContent.changedValues.areaNumber) {
          areaNumber = newContent.changedValues.areaNumber;
        }
      }

      //document
      let document = null;
      if (newContent.changedValues.hasOwnProperty('document')) {
        if (newContent.changedValues.document) {
          document = newContent.changedValues.document;
        }
      }

      //operationDescription
      let operationDescription = null;
      if (newContent.changedValues.hasOwnProperty('operationDescription')) {
        if (newContent.changedValues.operationDescription) {
          operationDescription = newContent.changedValues.operationDescription;
        }
      }

      //grade
      let grade = null;
      if (newContent.changedValues.hasOwnProperty('grade')) {
        if (newContent.changedValues.grade) {
          grade = newContent.changedValues.grade;
        }
      }

      //workingConditions
      let workingConditions = null;
      if (newContent.changedValues.hasOwnProperty('workingConditions')) {
        if (newContent.changedValues.workingConditions) {
          workingConditions = newContent.changedValues.workingConditions;
        }
      }

      //numberOfWorkers
      let numberOfWorkers = null;
      if (newContent.changedValues.hasOwnProperty('numberOfWorkers')) {
        if (newContent.changedValues.numberOfWorkers) {
          numberOfWorkers = newContent.changedValues.numberOfWorkers;
        }
      }

      //numberOfProcessedParts
      let numberOfProcessedParts = null;
      if (newContent.changedValues.hasOwnProperty('numberOfProcessedParts')) {
        if (newContent.changedValues.numberOfProcessedParts) {
          numberOfProcessedParts = newContent.changedValues.numberOfProcessedParts;
        }
      }

      //laborEffort
      let laborEffort = null;
      if (newContent.changedValues.hasOwnProperty('laborEffort')) {
        if (newContent.changedValues.laborEffort) {
          laborEffort = newContent.changedValues.laborEffort;
        }
      }

      //jobCode
      //jobName
      //
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === id
            ? {
                ...tab,
                content: {
                  ...tab.content,
                  formValues: newContent.formValues,
                  formErrors: newContent.formErrors /*|| tab.content.formErrors*/,
                  expandedPanels: newContent.expandedPanels || tab.content.expandedPanels,
                  changedValues: newContent.changedValues,
                  isDeleted: newContent.isDeleted /*|| tab.content.isDeleted*/,
                },
                operation: {
                  ...tab.operation,
                  code: operationCode.code,
                  name: operationCode.name,
                },
                label: `${operationCode.name} (${operationCode.code})`,
                validateForm: newValidateForm || tab.validateForm,
              }
            : tab
        ),
      };
    },
    setTabValue: (state, action) => {
      return {
        ...state,
        tabValue: action.payload,
      }
    },
    setShouldReloadTabs: (state, action) => {
      return {
        ...state,
        shouldReloadTabs: action.payload
      };
    },
    resetOperations: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(setData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setData.fulfilled, (state, action) => {
        state.loading = false;
        state.tabs = [];
        state.response = action.payload;
      })
      .addCase(setData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    },
});

export const { setTabs, resetTabs, addTab, removeTab, updateTab, setTabValue, setShouldReloadTabs, resetOperations } = operationsSlice.actions;
export default operationsSlice.reducer;