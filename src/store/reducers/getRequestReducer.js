import { FETCH_DATA_GET_REQUEST, FETCH_DATA_GET_SUCCESS, FETCH_DATA_GET_FAILURE } from '../actions/getRequestActions';
import { createReducer } from '@reduxjs/toolkit';

const initialState = {};

const getRequestReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(FETCH_DATA_GET_REQUEST, (state, action) => {
            const { key } = action.payload;
            state[key] = {
              loading: true,
              data: null,
              error: null,
            };
        })
        .addCase(FETCH_DATA_GET_SUCCESS, (state, action) => {
            const { key, data } = action.payload;
            state[key] = {
              loading: false,
              data,
              error: null,
            };
        })
        .addCase(FETCH_DATA_GET_FAILURE, (state, action) => {
            const { key, error } = action.payload;
            state[key] = {
              loading: false,
              data: null,
              error,
            };
        });
});

export default getRequestReducer;