/* eslint-disable import/named */
import { combineReducers } from 'redux';
import { reducer as testReducer } from './testReducer';

export default combineReducers({
  testReducer,
});
