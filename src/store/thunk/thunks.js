import {
    fetchDataGetRequest,
    fetchDataGetSuccess,
    fetchDataGetFailure,
  } from '../actions/getRequestActions';
/*import {
    fetchDataPostRequest,
    fetchDataPostSuccess,
    fetchDataPostFailure
} from '../actions/postRequestActions';*/

export const fetchDataGet = (params, url, key) => async (dispatch) => {
    dispatch(fetchDataGetRequest({ key }));
    try {
        const queryParams = new URLSearchParams(params).toString();
        const response = await fetch(`${url}?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',    
            }
        });//'https://localhost:7086/account/get-current-user'
        
        if (!response.ok) {
            const error = new Error('HTTP error');
            error.code = response.status;
            throw error;
        }
        //
        let data = await response.json();
        data = data.html;
        dispatch(fetchDataGetSuccess({ key, data }));
    } catch (error) {
        dispatch(fetchDataGetFailure({ key, error: error.code }));
    }
};