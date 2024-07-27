import React, { PureComponent } from 'react';
import PropTypes, { oneOf } from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import axios from 'axios';
import TestContentBase from '../../TestContentBase';
import baseUtils from '../../../utils/base';
import service from "../../../configs/serviceConfig";

import testListConfigMap from '../../../configs/testListConfigMap';
import { updateTestResult } from '../../../store/actions/testAction';

class ToggleAutoControl extends PureComponent {

  constructor (props) {
    super(props);
    this.state = {
      otherInfo: null,
      isPass: null,
      isShowLoading: false,
      isShowOutcomeLoading: false,
      isShowManualJudgment: false,
    };

    this.startTimeStemp = null;
    this.isGetWantedData = false;

    this.setGetDataTimeOut = null;
    this.getDataInterval = null;

    this.testItems = testListConfigMap[props.plantCategory].testItems;
    this.testContentSettings = testListConfigMap[props.plantCategory].testContentSettings;
    this.testSet = this.testContentSettings[props.testId] || { title: '', description: '' };
  }

  componentWillUnmount () {
    this.clearSetGetDataTimeOut();
    this.clearGetDataInterval();
  }

  handleManualPass = () => {
    const { testId, updateTestResult } = this.props;
    this.setState({ isPass: true });
    updateTestResult({ testId, result: true });
  }

  handleManualFailure = () => {
    const { testId, updateTestResult } = this.props;
    this.setState({ isPass: false });
    updateTestResult({ testId, result: false });
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

  checkData = (logs) => {
    const ctrlPlantLog = _.find(logs, log => log.plantNo === this.props.controlPlantNum);
    return (baseUtils.convertToBinary(ctrlPlantLog.control_result_01_25).split('').pop() === '1');
  }

  // call second api
  getData = () => {
    axios.get(`${service.getPLantLogCurrents}`,{ params: {
      access_token: this.props.token,
      filter: {
          where: { plantNo: this.props.controlPlantNum }
      },
    }})
    .then((res) => {
      const isPass = this.checkData(res.data);
      if (isPass) {
        // clear time set
        this.clearSetGetDataTimeOut();
        this.clearGetDataInterval();
        this.isGetWantedData = true;

        this.setState({
          otherInfo: <div className="isSetOk">收到變流器成功回報</div>,
          isShowOutcomeLoading: false,
          isShowLoading: false,
          isShowManualJudgment: true,
          isPass,
        });
        const { testId, updateTestResult } = this.props;
        updateTestResult({ testId, result: isPass });
      } else {
        this.setState({
          otherInfo: <div className="dataWarn">未收到變流器成功回報，持續取得資料中...</div>,
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
      if (!this.isGetWantedData) {
        this.clearGetDataInterval();
        this.setState({
          otherInfo: <span className="dataWarn">timeOut, 超過 10 秒未收到變流器成功回報</span>,
          isShowOutcomeLoading: false,
          isShowLoading: false,
          isShowManualJudgment: true,
          isPass: false,
        });
        const { testId, updateTestResult } = this.props;
        updateTestResult({ testId, result: false });
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
      this.isGetWantedData = false;
      this.setState({
        isShowOutcomeLoading: true,
        isShowLoading: true,
        isShowManualJudgment: false,
        isPass: null,
        otherInfo: null
      });
      const { testId, updateTestResult } = this.props;
      updateTestResult({ testId, result: null });

      // call first api
      axios.post(`${service.powerControl}`,{
          plantNo: this.props.controlPlantNum,
          type: 'autonomic_control',
          value: this.props.autonomicControlValue,
        },
        { params: {
          access_token: this.props.token,
        }}
      )
      .then((res) => {
        const timestemp = baseUtils.setTimestemp();
        this.startTimeStemp = timestemp.sec;
        this.setGetDataTimeOutFn();
      })
      .catch((err) => {
        console.log('err: ', err);
        this.setState({
          isShowOutcomeLoading: false,
          isShowLoading: false,
        });
      });
    }
  }

  render () {
    const {
      testId,
    } = this.props;
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

ToggleAutoControl.propTypes = {
  testId: PropTypes.string.isRequired,
  autonomicControlValue: oneOf([0, 1]).isRequired,
};

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
)(ToggleAutoControl);
