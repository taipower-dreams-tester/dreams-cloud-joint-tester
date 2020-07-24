import {
  UPDATE_BASE_DATA,
  SEND_BASE_DATA,
  DELETE_GATE_WAY,
  UPDATE_PLANT_DATA,
  UPDATE_ACTIVE_TEST_TAG,
  TOGGLE_BASE_DATA_FORM,
  READY_FOR_TEST,
  TOGGLE_SET_BASE_DATA_LOADING,
  UPDATE_TEST_RESULT,
} from './actionType';

// ACTIONS
export const updateBaseData = (data) => ({
  type: UPDATE_BASE_DATA,
  payload: data,
});

export const deleteGateway = (data) => ({
  type: DELETE_GATE_WAY,
  payload: {
    gatewayId: data.gatewayId,
    accessToken: data.accessToken,
  },
});

export const sendBaseData = (data) => ({
  type: SEND_BASE_DATA,
  payload: data,
});

export const updatePlantData = (data) => ({
  type: UPDATE_PLANT_DATA,
  payload: data,
});

export const toggleBaseDataForm = (data) => ({
  type: TOGGLE_BASE_DATA_FORM,
  payload: { isShowBaseDataForm: data },
});

export const updateActiveTestTag = (data) => ({
  type: UPDATE_ACTIVE_TEST_TAG,
  payload: { activeTestTag: data },
});

export const readyForTest = (data) => ({
  type: READY_FOR_TEST,
  payload: {
    isShowBaseDataForm: data.isShowBaseDataForm,
    setBaseDataTimeStemp: data.setBaseDataTimeStemp,
    token: data.token,
    gatewayId: data.gatewayId,
    setBaseDataErrMsg: data.setBaseDataErrMsg,
  },
});

export const toggleSetBaseDataLoading = (data) => ({
  type: TOGGLE_SET_BASE_DATA_LOADING,
  payload: data,
});

export const updateTestResult = (payload) => ({
  type: UPDATE_TEST_RESULT,
  payload,
});
