import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import TestContentBase from '../TestContentBase';
import PLantData from '../PLantData';
import baseUtils from '../../utils/base';
import service from "../../configs/serviceConfig";
import testListConfigMap from '../../configs/testListConfigMap';
import { updateTestResult } from '../../store/actions/testAction';

const testId = '2-3';

class TestTwoThree extends PureComponent {

  constructor (props) {
    super(props);
    this.state = {
      otherInfo: null,
      isPass: null,
      isShowManualJudgment: false,
      isShowLoading: false,
      isShowOutcomeLoading: false,
    };

    this.startTimestamp = null;
    this.isGetWantedData = false;

    this.getDataInterval = null;
    this.getDataTimeout = null;
    moment.locale('zh-tw');

    this.testItems = testListConfigMap[props.plantCategory].testItems;
    this.testContentSettings = testListConfigMap[props.plantCategory].testContentSettings;
    this.testSet = this.testContentSettings[testId] || { title: '', description: '' };

    this.config = {
      startTime: { title: '測試時間' },
      currentPhaseA: { ...this.testItems.currentPhaseA },
      getDataTime: { title: '取得資料時間' },
    };

    this.showPlantTestItems = Object.keys(this.config);
  }

  componentWillUnmount () {
    this.clearGetDataInterval();
    this.clearGetDataTimeout();
  }

  handleManualPass = () => {
    this.setState({ isPass: true });
    this.props.updateTestResult({ testId, result: true });
  }

  handleManualFailure = () => {
    this.setState({ isPass: false });
    this.props.updateTestResult({ testId, result: false });
  }

  handleToggleLoading = (value) => {
    this.setState({ isShowLoading: value });
  }

  handleToggleOutcomeLoading = (value) => {
    this.setState({ isShowOutcomeLoading: value });
  }

  clearGetDataInterval = () => {
    if(this.getDataInterval) {
      clearInterval(this.getDataInterval);
      this.getDataInterval = null;
    }
  }

  clearGetDataTimeout = () => {
    if(this.getDataTimeout) {
      clearTimeout(this.getDataTimeout);
      this.getDataTimeout = null;
    }
  }

  getShownContentArray = (getDataTimeStemp, getDataCurrentPhaseA) => {
    const startTimeText = moment.unix(this.startTimestamp).format('LLL');
    const getDataTimeText = moment.unix(getDataTimeStemp).format('LLL');
    return [{
      startTime: startTimeText,
      currentPhaseA: getDataCurrentPhaseA,
      getDataTime: getDataTimeText,
    }];
  }

  getData = () => {
    axios.get(`${service.getPLantLog}`,{ params: {
      access_token: this.props.token,
      filter: {
          order: "itemTimestamp DESC",
          where: {
            and: [
                { currentPhaseA: { neq: null } },
                { voltagePhaseA: null },
                { itemTimestamp: { gt: this.startTimestamp } },
                { plantNo: this.props.controlPlantNum },
            ]
          }
    }}})
    .then(({data}) => {
      if (data.length > 0) {
        // clear time set
        this.clearGetDataTimeout();
        this.clearGetDataInterval();
        // deal with shown data
        this.isGetWantedData = true;
        const getDataTimeStemp = data[0].itemTimestamp;
        const renderDataArray = this.getShownContentArray(getDataTimeStemp, data[0].currentPhaseA);
        this.setState({
          otherInfo: <PLantData
            data={renderDataArray}
            testId={testId}
            showPlantTestItems={this.showPlantTestItems}
            controlPlantNum={this.props.controlPlantNum}
            unControlPlantNum={this.props.unControlPlantNum}
            config={this.config}
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
    const getDataPeriod = 1000;

    this.getDataTimeout = setTimeout(() => {
      this.clearGetDataTimeout();
      if (!this.isGetWantedData) {
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
      // set get data timeout
      this.getDataInterval = setInterval(() => {
        // call get data api
        this.getData();
      }, getDataPeriod);
    }
  }

  handleTestBegin = () => {
    if(!this.getDataTimeout){
      const timestemp = baseUtils.setTimestemp();
      this.startTimestamp = timestemp.sec;
      this.setState({
        isShowOutcomeLoading: true,
        isShowLoading: true,
        isPass: null,
        otherInfo: null,
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
});

const mapDispatchToProps = {
  updateTestResult,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TestTwoThree);
