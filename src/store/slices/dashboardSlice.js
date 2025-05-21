import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const LOADING_DEFAULT = false;
const initialState = {
  technologyCreatedByUserLoading: LOADING_DEFAULT,
  technologyCreatedByUserError: null,
  technologyCreatedByUserItems: null,
};

//загрузка данных для дашборда
export const getTechnologiesCreatedByUser = createAsyncThunk(
  'technologiesCreatedByUser',
  async ({ user }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const response = await fetch('http://localhost/Ivc/Ogt/ExecuteScripts/GetDashboardData.v0.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify(user),
          credentials: 'include'
        });
        //
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Network response was not ok');
        }
        return data;                
    } catch(error) {
      return rejectWithValue({ errorMessage: error.message });
    }        
  }
);

const dashboardSlice = createSlice({
  name: 'dashboardSlice',
  initialState,
  /*reducers: {
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
    },
    setCrud: (state, action) => {
      return {
        ...state,
        isCrud: action.payload,
      };
    },
  },*/
  extraReducers: (builder) => {
    //getTechnologiesCreatedByUser
    builder.addCase(getTechnologiesCreatedByUser.pending, (state) => {
      state.technologyCreatedByUserLoading = true;
      state.technologyCreatedByUserError = null;
    });
    builder.addCase(getTechnologiesCreatedByUser.fulfilled, (state, action) => {      
      state.technologyCreatedByUserItems = action.payload.TechnologiesCreatedByUser;
      state.technologyCreatedByUserError = null;
      state.technologyCreatedByUserLoading = false;
    });
    builder.addCase(getTechnologiesCreatedByUser.rejected, (state, action) => {
      state.technologyCreatedByUserLoading = false;
      state.technologyCreatedByUserError = action.payload.errorMessage;
    });
  },
});

//export const { setTokens, setCrud } = dashboardSlice.actions;
export default dashboardSlice.reducer;