import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import TestContentBase from '../TestContentBase';
import baseUtils from '../../utils/base';
import PLantData from '../PLantData';
import service from "../../configs/serviceConfig";
import _ from 'lodash';

import testListConfigMap from '../../configs/testListConfigMap';
import { updateTestResult } from '../../store/actions/testAction';

const testId = '2-4';

const showPlantTestItemsMap = {
  grid: [
    // 'plantTypeId',
    "plantNo",
    "currentPhaseA",
    "currentPhaseB",
    "currentPhaseC",
    "currentPhaseN",
    "voltagePhaseA",
    "voltagePhaseB",
    "voltagePhaseC",
    "P_SUM",
    "Q_SUM",
    "PF_AVG",
    "frequency",
    "total_kWh",
    "itemTimestamp",
  ],
  energyStorage: [
    "plantNo",
    "currentPhaseA",
    "currentPhaseB",
    "currentPhaseC",
    "currentPhaseN",
    "voltagePhaseA",
    "voltagePhaseB",
    "voltagePhaseC",
    "P_SUM",
    "Q_SUM",
    "PF_AVG",
    "frequency",
    "total_kWh_discharging",
    "total_kWh_charging",
    "status",
    "SOC",
    "battery_cycle_count",
    "itemTimestamp",
  ],
};

const getDataTimeOutMin = 16;

class TestTwoFour extends PureComponent {

  constructor (props) {
    super(props);
    this.state = {
      otherInfo: null,
      otherInfo2: null,
      isPass: null,
      isShowManualJudgment: false,
      isShowLoading: false,
      isShowOutcomeLoading: false,
    };

    this.startTimeStemp = null;

    this.startTimeStempMinSec = null;
    this.isGetWantedData = false;

    this.getDataInterval = null;
    this.getDataTimeout = null;
    this.countDownInterval = null;

    this.testItems = testListConfigMap[props.plantCategory].testItems;
    this.testContentSettings = testListConfigMap[props.plantCategory].testContentSettings;
    this.testSet = this.testContentSettings[testId];

    this.showPlantTestItems = showPlantTestItemsMap[props.plantCategory];
  }

  componentWillUnmount () {
    this.clearAllTimeSet();
  }

  handleManualPass = () => {
    this.clearAllTimeSet();
    this.setState({ isPass: true });
    this.props.updateTestResult({ testId, result: true });
  }

  handleManualFailure = () => {
    this.clearAllTimeSet();
    this.setState({ isPass: false });
    this.props.updateTestResult({ testId, result: false });
  }

  handleToggleLoading = (value) => {
    this.setState({ isShowLoading: value });
  }

  handleToggleOutcomeLoading = (value) => {
    this.setState({ isShowOutcomeLoading: value });
  }

  clearTimeSet = (timeSetName, timeSetType) => {
    if(timeSetName && timeSetType){
      if(this[timeSetName] && timeSetType === 'timeout') {
        clearTimeout(this[timeSetName]);
      }
      if(this[timeSetName] && timeSetType === 'interval') {
        clearInterval(this[timeSetName]);
      }
      this[timeSetName] = null;
    }
  }

  clearAllTimeSet = () => {
    this.clearTimeSet('getDataTimeout', 'timeout');
    this.clearTimeSet('getDataInterval', 'interval');
    this.clearTimeSet('countDownInterval', 'interval');
  }

  setCountDown = (mins) => {
    let secs = mins * 60;
    this.countDownInterval = setInterval(() => {
      const minText = parseInt(secs / 60);
      const secText = secs % 60;
      this.setState({
        otherInfo: <div className="otherTopInfo">
                    <div className="otherTopInfoRow">距離取得資料 timeout 尚餘：{minText} 分鐘 {secText} 秒</div>
                  </div>,
      });
      secs -= 1;
      if (secs < 0) this.clearTimeSet('countDownInterval', 'interval');
    }, 1000);
  }

  checkHasWantedData = (datas) => {
    const wantedDataObj = {};
    const wantedControlDataArray = [];
    const wantedUnContrilDataArray = [];
    [].forEach.call(datas, (data) => {
      let isPass = true;
      // check every key's value is not null
      [].forEach.call(Object.keys(this.testItems), (key) => {
        if(data[key] === null) isPass = false;
      });

      if (isPass && (data.plantNo === this.props.controlPlantNum)) wantedControlDataArray.push(data);
      if (isPass && (data.plantNo === this.props.unControlPlantNum)) wantedUnContrilDataArray.push(data);
    });
    // get latest two complete controled plant data
    wantedDataObj.control = _.takeRight(wantedControlDataArray, 2);
    // get latest two complete uncontroled plant data
    wantedDataObj.unControl = _.takeRight(wantedUnContrilDataArray, 2);
    return wantedDataObj;
  }

  getData = () => {
    axios.get(`${service.getPLantLog}`,{ params: {
      access_token: this.props.token,
      filter: {
          order: "itemTimestamp DESC",
          where: {
            and: [
                { currentPhaseA: { neq: null } },
                { voltagePhaseA: { neq: null } },
                // use plant base data set timestemp
                { atTimestamp: { gte: this.startTimeStemp } },
                { or: [
                    { plantNo: this.props.controlPlantNum },
                    { plantNo: this.props.unControlPlantNum },
                  ]
                }
            ],
          }
    }}})
    .then((res) => {
      // check data
      const wantedDataObj = this.checkHasWantedData(res.data);
      // at least get once controled plant data and once uncontroled plant data
      if (wantedDataObj.control.length >= 1 && wantedDataObj.unControl.length >= 1) {
        // clear time set
        this.clearAllTimeSet();
        // deal with shown data
        this.isGetWantedData = true;
        this.setState({
          otherInfo2: <PLantData
            data={wantedDataObj.control.concat(wantedDataObj.unControl)}
            testId={testId}
            showPlantTestItems={this.showPlantTestItems}
            controlPlantNum={this.props.controlPlantNum}
            unControlPlantNum={this.props.unControlPlantNum}
            config={this.testItems}
          />,
          isShowOutcomeLoading: false,
          isShowLoading: false,
          isShowManualJudgment: true,
        });
      }
    })
    .catch((err) => {
      console.log('err: ', err);
    });
  }

  setGetDataTimeOutFn = () => {
    const getDataTimeOutPeriod = getDataTimeOutMin * 60 * 1000;
    const getDataPeriod = 10 * 1000;

    this.setCountDown(getDataTimeOutMin);

    this.getDataTimeout = setTimeout(() => {
      this.clearTimeSet('getDataTimeout', 'timeout');
      if (!this.isGetWantedData) {
        this.clearTimeSet('getDataInterval', 'interval');
        this.clearTimeSet('countDownInterval', 'interval');
        this.setState({
          otherInfo2: <span className="dataWarn">timeOut, 超過 {getDataTimeOutMin} 分鐘未拿到資料</span>,
          isShowOutcomeLoading: false,
          isShowLoading: false,
          isShowManualJudgment: true
        });
      }
    }, getDataTimeOutPeriod);

    if(!this.getDataInterval){
      // set get data interval
      this.getDataInterval = setInterval(() => {
        // call get data api
        this.getData();
      }, getDataPeriod);
    }
  }

  handleTestBegin = () => {
    if(!this.getDataTimeout){
      const timestemp = baseUtils.setTimestemp();
      this.startTimeStemp = timestemp.sec;
      this.startTimeStempMinSec = timestemp.minSec;
      this.setState({
        isShowOutcomeLoading: true,
        isShowLoading: true,
        isPass: null,
        otherInfo: null,
        otherInfo2: null,
        isShowManualJudgment: false
      });
      this.props.updateTestResult({ testId, result: null });
      this.setGetDataTimeOutFn();
    }
  }

  render () {
    return (
      <TestContentBase
        isShow={this.props.activeTestTag === testId}
        title={this.testSet.title}
        description={this.testSet.description}
        otherInfo={this.state.otherInfo}
        otherInfo2={this.state.otherInfo2}
        handleTestBegin={this.handleTestBegin}
        isPass={this.state.isPass}
        isShowLoading={this.state.isShowLoading}
        isShowOutcomeLoading={this.state.isShowOutcomeLoading}

        isShowManualJudgment={this.state.isShowManualJudgment}
        handleManualPass={this.handleManualPass}
        handleManualFailure={this.handleManualFailure}
      />
    );
  }
}

const mapStateToProps = ({ testReducer  }) => ({
  plantCategory: testReducer.plantCategory,
  activeTestTag: testReducer.activeTestTag,
  ip: testReducer.activeTestTag,
  controlPlantNum: testReducer.controlPlantNum,
  unControlPlantNum: testReducer.unControlPlantNum,
  token: testReducer.token,
  setBaseDataTimeStemp: testReducer.setBaseDataTimeStemp,
});

const mapDispatchToProps = {
  updateTestResult,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TestTwoFour);
