import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

const logoutSlice = createSlice({
  name: "logout",
  initialState: {},
  reducers: {
    logout(state) {}, // очистка будет произведена в каждом редьюсере
  },
});

export const { logout } = logoutSlice.actions;
export const purgeStore = () => (dispatch) => {
  dispatch({ type: PURGE });
};

export default logoutSlice.reducer;