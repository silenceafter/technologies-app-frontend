import { createSlice } from '@reduxjs/toolkit';
import { logout } from './logoutSlice';

const initialState = {
  message: '',
  status: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setStatus: (state, action) => {
      const { statusValue, responseValue } = action.payload;
      let messageValue;
      switch(statusValue) {
        case 'success':
          messageValue = 'Успешно сохранено!';
          break;
        case 'warning':
          messageValue = 'Неправильно заполнена форма';
          break;
        case 'error':
          /*for(const responseItem of responseValue) {
            if (responseItem == null || typeof responseItem == 'undefined') {
              continue;
            }
            try {
              if (responseItem.code != 200) {

              }
            } catch(error) {

            }
          }*/


          messageValue = 'Ошибка при отправке!';
          break;
        case 'info':
          messageValue = 'Сохранение не требуется';
          break;
        default:
          messageValue = '';
      }
      //
      return {
        ...state,
        status: statusValue,
        message: messageValue,
      };
    },
    resetNotifications: () => initialState,
  },
  extraReducers: (builder) => {
    //logout
    builder.addCase(logout, (state) => {
      Object.keys(state).forEach(key => delete state[key]);
    });
  },
});

export const { setStatus, resetNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;