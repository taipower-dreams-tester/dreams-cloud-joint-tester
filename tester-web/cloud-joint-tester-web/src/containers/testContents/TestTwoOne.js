import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import TestContentBase from '../TestContentBase';
import PLantData from '../PLantData';
import baseUtils from '../../utils/base';
import service from "../../configs/serviceConfig";

import testListConfig from '../../configs/testListConfig';
import { updateTestResult } from '../../store/actions/testAction';

const { testContentSettings } = testListConfig;
const testId = '2-1';
const testSet = testContentSettings[testId];
const showPlantTestItems = [
  // 'plantTypeId',
  'plantNo',
  'currentPhaseA',
  'currentPhaseB',
  'currentPhaseC',
  'currentPhaseN',
  'voltagePhaseA',
  'voltagePhaseB',
  'voltagePhaseC',
  'P_SUM',
  'Q_SUM',
  'PF_AVG',
  'frequency',
  'total_kWh'
];

class TestTwoOne extends PureComponent {

  constructor (props) {
    super(props);
    this.state = {
      otherInfo: null,
      isPass: null,
      isShowManualJudgment: false,
      isShowLoading: false,
      isShowOutcomeLoading: false,
    };

    this.startTimeStemp = null;
    this.isGetCompleteData = false;

    this.setGetDataTimeOut = null;
    this.getDataInterval = null;
  }

  componentWillUnmount () {
    this.clearSetGetDataTimeOut();
    this.clearGetDataInterval();
  }

  handleManualPass = () => {
    this.setState({ isPass: true });
    this.props.updateTestResult({ testId, result: true });
  }

  handleManualFailure = () => {
    this.setState({ isPass: false });
    this.props.updateTestResult({ testId, result: false });
  }

  clearSetGetDataTimeOut = () => {
    if(this.setGetDataTimeOut) {
      clearTimeout(this.setGetDataTimeOut);
      this.setGetDataTimeOut = null;
    }
  }
  clearGetDataInterval = () => {
    if(this.getDataInterval) {
      clearInterval(this.getDataInterval);
      this.getDataInterval = null;
    }
  }

  checkHasCompleteData = (datas) => {
    const completeArray = [];
    [].forEach.call(datas, (data) => {
      if (data.plantNo === this.props.controlPlantNum) {
        let isPass = false;
        isPass = baseUtils.checkIsCompleteData(data);
        if (isPass) completeArray.push(data);
      }
    });
    return completeArray;
  }
  // call second api
  getData = () => {
    axios.get(`${service.getPLantLog}`,{ params: {
      access_token: this.props.token,
      filter: {
          order: "itemTimestamp DESC",
          where: {
            and: [
                { currentPhaseA: { neq: null } },
                { voltagePhaseA: { neq: null } },
                { atTimestamp: { gte: this.startTimeStemp - 5 } }, // 5 sec buffer for clock might not sync
                { itemTimestamp: { gte: (this.startTimeStemp - 900 - 5) } }, // the log should not earlier than 15 mins ago
            ]
          }
    }}})
    .then((res) => {
      const completeArray = this.checkHasCompleteData(res.data);
      if (completeArray.length > 0) {
        // clear time set
        this.clearSetGetDataTimeOut();
        this.clearGetDataInterval();
        this.isGetCompleteData = true;

        this.setState({
          otherInfo: <PLantData
            data={[completeArray.pop()]}
            testId={testId}
            showPlantTestItems={showPlantTestItems}
            controlPlantNum={this.props.controlPlantNum}
            unControlPlantNum={this.props.unControlPlantNum}
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
    const getDataTimeOutPeriod = 10 * 1000;
    const getDataPeriod = 3 * 1000;

    this.setGetDataTimeOut = setTimeout(() => {
      this.clearSetGetDataTimeOut();
      if (!this.isGetCompleteData) {
        this.clearGetDataInterval();
        this.setState({
          otherInfo: <span className="dataWarn">timeOut, 超過 10 秒未拿到資料</span>,
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
    if(!this.setGetDataTimeOut) {
      this.isGetCompleteData = false;
      this.setState({
        isShowOutcomeLoading: true,
        isShowLoading: true,
        isPass: null,
        otherInfo: null
      });
      this.props.updateTestResult({ testId, result: null });
  
      // call first api
      axios.post(`${service.sendPolling}`, null, { params: {
        plantNo: this.props.controlPlantNum,
        access_token: this.props.token,
      }})
      .then((res) => {
        const timestemp = baseUtils.setTimestemp();
        this.startTimeStemp = timestemp.sec;
        this.setGetDataTimeOutFn();
      })
      .catch((err) => {
        console.log('err: ', err);
        this.setState({
          isShowOutcomeLoading: false,
          isShowLoading: false
        });
      });
    }
  }

  render () {
    return (
      <TestContentBase
        testId={testId}
        isShow={this.props.activeTestTag === testId}
        title={testSet.title}
        description={testSet.description}
        otherInfo={this.state.otherInfo}
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
  activeTestTag: testReducer.activeTestTag,
  ip: testReducer.activeTestTag,
  controlPlantNum: testReducer.controlPlantNum,
  unControlPlantNum: testReducer.unControlPlantNum,
  token: testReducer.token,
});

const mapDispatchToProps = {
  updateTestResult,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TestTwoOne);