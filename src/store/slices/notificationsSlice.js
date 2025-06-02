import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    message: '',
    status: false,
  },
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
  },
});

export const { setStatus } = notificationsSlice.actions;
export default notificationsSlice.reducer;