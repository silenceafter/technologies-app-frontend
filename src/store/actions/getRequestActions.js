import { createAction } from '@reduxjs/toolkit';

export const FETCH_DATA_GET_REQUEST = 'FETCH_DATA_GET_REQUEST';
export const FETCH_DATA_GET_SUCCESS = 'FETCH_DATA_GET_SUCCESS';
export const FETCH_DATA_GET_FAILURE = 'FETCH_DATA_GET_FAILURE';

export const fetchDataGetRequest = createAction(FETCH_DATA_GET_REQUEST);
export const fetchDataGetSuccess = createAction(FETCH_DATA_GET_SUCCESS);
export const fetchDataGetFailure = createAction(FETCH_DATA_GET_FAILURE);