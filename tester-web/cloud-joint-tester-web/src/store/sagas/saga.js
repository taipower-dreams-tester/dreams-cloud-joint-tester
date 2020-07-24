import { all, call, put, takeEvery } from 'redux-saga/effects';
import axios from 'axios';
import baseUtils from '../../utils/base';
import service from '../../configs/serviceConfig';

import {
  SEND_BASE_DATA,
  DELETE_GATE_WAY,
} from '../actions/actionType';

import {
  readyForTest,
  toggleSetBaseDataLoading,
} from '../actions/testAction';

import { accessToken } from '../../configs/apiConfig';

// create gateway
function createGateway({ip: ipAddress, port, siteToken, accessToken: access_token}) {
  return axios.post(`${service.getGatewayId}`, {
    ipAddress,
    port,
    siteToken,
  }, { params: {
    access_token,
  } }).then((res) => {
    window.localStorage.setItem('GWid', res.data.id);
    return res;
  }).catch((err) => { console.log('send IP err: ', err); });
}
// create plant
function createPlant(data) {
  return axios.post(`${service.addPlant}`, {
    plantNo: data.plantNo,
    plantName: data.plantName,
    gatewayId: data.gatewayId,
    dnp3Address: data.dnp3Address,
  }, { params: {
    access_token: data.accessToken,
  } }).then((res) => res).catch((err) => { console.log('send plant Data err: ', err); });
}

// eslint-disable-next-line camelcase
function restartTester(access_token) {
  return axios.post(`${service.toggleDreamsOffline}`, {
    operation: 'restart',
  },
  { params: { access_token } });
}

function* sendBaseDataFn(action) {
  const {
    ip,
    port,
    controlPlantNum,
    controlPlantName,
    unControlPlantNum,
    uncontrolPlantName,
    siteToken,
  } = action.payload;
  const errMsgArray = [];

  let errMsg = '';

  yield put(toggleSetBaseDataLoading(true));

  const createGatewayRes = yield call(createGateway, { ip, port, siteToken, accessToken });
  const gatewayId = createGatewayRes ? createGatewayRes.data.id : null;

  if (!gatewayId) errMsgArray.push('無法寫入資訊');

  // control plant
  const sendControlPlantRes = yield call(createPlant, {
    gatewayId,
    plantNo: controlPlantNum,
    plantName: controlPlantName,
    accessToken,
    dnp3Address: 4,
  });

  // uncontro plant
  const sendUnControlPlantRes = yield call(createPlant, {
    gatewayId,
    plantNo: unControlPlantNum,
    plantName: uncontrolPlantName,
    accessToken,
    dnp3Address: 5,
  });

  if (!sendUnControlPlantRes || !sendControlPlantRes) {
    errMsgArray.push('案場電號已經存在，請關閉其他測試程式網頁後重試');
    if (gatewayId) {
      yield axios.delete(`${service.deleteGatewayId}/${gatewayId}?access_token=${accessToken}`)
      .catch((err) => { console.log(err); });
    }
  }

  const sendRestartMaster = yield call(restartTester, accessToken);

  if (!sendRestartMaster) errMsgArray.push('無法啟動測試程式');

  errMsg = errMsgArray.join(' / ');

  const timestemp = baseUtils.setTimestemp();
  // update store
  if (sendControlPlantRes
      && sendUnControlPlantRes
      && sendControlPlantRes.data.id
      && sendUnControlPlantRes.data.id
      && sendRestartMaster) {
    yield put(readyForTest({
      isShowBaseDataForm: false,
      setBaseDataTimeStemp: timestemp.sec,
      token: accessToken,
      gatewayId,
      setBaseDataErrMsg: errMsg,
    }));
  } else {
    yield put(readyForTest({
      isShowBaseDataForm: true,
      setBaseDataTimeStemp: timestemp.sec,
      token: accessToken,
      gatewayId,
      setBaseDataErrMsg: errMsg,
    }));
  }
}

function* doDeleteGateway(action) {
  const { gatewayId, accessToken } = action.payload;

  yield axios.delete(`${service.deleteGatewayId}/${gatewayId}?access_token=${accessToken}`)
    .catch((err) => { console.log(err); });
}

export default function* rootSaga() {
  yield all([
    takeEvery(SEND_BASE_DATA, sendBaseDataFn),
    takeEvery(DELETE_GATE_WAY, doDeleteGateway),
  ]);
}
