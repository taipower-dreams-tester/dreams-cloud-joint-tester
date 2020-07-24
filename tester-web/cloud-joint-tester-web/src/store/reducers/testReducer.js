import baseReducer from './reducer.base';
import baseDataConfig from '../../configs/baseDataConfig';
import {
  UPDATE_BASE_DATA,
  UPDATE_PLANT_DATA,
  TOGGLE_BASE_DATA_FORM,
  UPDATE_ACTIVE_TEST_TAG,
  READY_FOR_TEST,
  TOGGLE_SET_BASE_DATA_LOADING,
  UPDATE_TEST_RESULT,
} from '../actions/actionType';
import { accessToken } from '../../configs/apiConfig';

const controlPlantNum = baseDataConfig.controlPlantData.num;
const unControlPlantNum = '88-88-8888-88-8';

const initState = {
  ip: '',
  ipError: '',
  port: '20000',
  portError: '',

  controlPlantNum,
  controlPlantNumArray: controlPlantNum.split('-'), 
  controlPlantNumError: '',
  controlPlantName: baseDataConfig.controlPlantData.name,
  controlPlantNameError: '',

  unControlPlantNum,
  unControlPlantNumArray: unControlPlantNum.split('-'), 
  unControlPlantNumError: '',
  unControlPlantName: 'test uncontrol plant',
  unControlPlantNameError: '',

  isShowBaseDataForm: true,
  activeTestTag: '1-1',
  setBaseDataTimeStemp: null,
  token: accessToken,
  gatewayId: null,

  isSetBaseDataLoading: false,
  setBaseDataErrMsg: '',
};

const reducers = {
  [UPDATE_BASE_DATA]: (state, action) => {
    let newState = { ...state };
    if(action.payload){
      newState = {
        ...state,
        ...action.payload
      };
    }
    return newState;
  },
  [UPDATE_PLANT_DATA]: (state, action) => {
    let newState = {...state};
    newState.updatePlantData = 'updatePlantData';
    return newState;
  },
  [TOGGLE_BASE_DATA_FORM]: (state, action) => {
    let newState = {...state};
    newState.isShowBaseDataForm = action.payload.isShowBaseDataForm;
    return newState;
  },
  [UPDATE_ACTIVE_TEST_TAG]: (state, action) => {
    let newState = { ...state };
    if (action.payload && action.payload.activeTestTag) {
      newState.activeTestTag = action.payload.activeTestTag;
    }
    return newState;
  },
  [READY_FOR_TEST]: (state, action) => {
    let newState = {...state};
    newState.setBaseDataTimeStemp = action.payload.setBaseDataTimeStemp;
    newState.isShowBaseDataForm = action.payload.isShowBaseDataForm;
    newState.token = action.payload.token;
    newState.gatewayId = action.payload.gatewayId;
    newState.setBaseDataErrMsg = action.payload.setBaseDataErrMsg;
    newState.isSetBaseDataLoading = false;
    return newState;
  },
  [TOGGLE_SET_BASE_DATA_LOADING]: (state, action) => {
    let newState = {...state};
    newState.isSetBaseDataLoading = action.payload;
    return newState;
  },
  [UPDATE_TEST_RESULT]: (state, action) => {
    const { testResults = {} } = state;
    let newState = {...state};
    newState.testResults = { ...testResults, [action.payload.testId]: action.payload.result };
    return newState;
  },
};

export const reducer = baseReducer(reducers)(initState);


