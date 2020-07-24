import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import axios from 'axios';
import TestContentBase from '../../TestContentBase';
import PLantData from '../../PLantData';
import baseUtils from '../../../utils/base';
import service from "../../../configs/serviceConfig";

import testListConfig from '../../../configs/testListConfig';
import { updateTestResult } from '../../../store/actions/testAction';

const { testItems, testContentSettings } = testListConfig;

class ReOnLineTest extends PureComponent {

  constructor (props) {
    super(props);
    this.state = {
      otherInfo: null,
      isPass: null,
      isShowLoading: false,
      isShowOutcomeLoading: false,
      isShowManualJudgment: false,
      getLogData: [],
    };

    this.showPlantTestItems = props.showOtherInfoKeys || [
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
      'total_kWh',
      'itemTimestamp',
      'atTimestamp',
    ];

    this.startTimeStemp = null;
    this.isGetWantedData = false;

    this.setGetDataTimeOut = null;
    this.getDataInterval = null;
  }

  componentWillUnmount () {
    this.clearAllTimeSet();
  }

  clearAllTimeSet = () => {
    this.clearSetGetDataTimeOut();
    this.clearGetDataInterval();
  }

  showInfoEnd = (isPass) => {
    const { testId, updateTestResult } = this.props;
    this.setState((state) => {
      const newState = {
        isPass,
        isShowOutcomeLoading: false,
        isShowLoading: false,
      };
      if(!this.isGetWantedData){
        newState.otherInfo = <PLantData
        data={state.getLogData}
        testId={testId}
        showPlantTestItems={this.showPlantTestItems}
        controlPlantNum={this.props.controlPlantNum}
        unControlPlantNum={this.props.unControlPlantNum}
      />;
      }
      return newState;
    });
    updateTestResult({ testId, result: isPass });
  }

  handleManualPass = () => {
    this.clearAllTimeSet();
    this.showInfoEnd(true);
  }

  handleManualFailure = () => {
    this.clearAllTimeSet();
    this.showInfoEnd(false);
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

  checkData = (datas) => {
    let returnArray = [];
    const controlPlantArray = [];
    const unControlPlantArray = [];
    [].forEach.call(datas, (data) => {
      let isDataComplete = false;
      isDataComplete = [].every.call(Object.keys(testItems), (item) => (data[item] !== null));
      if (isDataComplete && data.plantNo === this.props.controlPlantNum) controlPlantArray.push(data);
      if (isDataComplete && data.plantNo === this.props.unControlPlantNum) unControlPlantArray.push(data);
    });
    // prevent datas are too many, only tale last 5 data of control and uncontrol plant data.
    const lastControlPLantData = _.take(controlPlantArray, 1);
    const lastUnControlPLantData = _.take(unControlPlantArray, 1);

    returnArray = lastControlPLantData.concat(lastUnControlPLantData);
    return returnArray;
  }
  
  // call second api
  getData = () => {
    let filter = _.merge(
      {
        order: "itemTimestamp DESC",
        where: {
          and: [
              { currentPhaseA: { neq: null } },
              { voltagePhaseA: { neq: null } },
              { atTimestamp: { gte: (this.startTimeStemp - 5) } },
              { or: this.props.plants.map(plantNo => ({plantNo})) }
          ]
        }
      }
    );
    axios.get(service.getPLantLog,{ params: {
      access_token: this.props.token,
      filter,
    }})
    .then((res) => {
      if(this.props.handleCheckDataSuccess && this.props.handleCheckDataSuccess instanceof Function) {
        this.props.handleCheckDataSuccess();
      } else {
        const completeDataArray = this.checkData(res.data);
        if (completeDataArray.length > 0) {
          this.setState({
            otherInfo: <>
            <div className="otherTopInfo">
              <div className="otherTopInfoRow">持續取得資料中...</div>
            </div>
            <PLantData
              data={completeDataArray}
              testId={this.props.testId}
              showPlantTestItems={this.showPlantTestItems}
              controlPlantNum={this.props.controlPlantNum}
              unControlPlantNum={this.props.unControlPlantNum}
            /></>,
            isShowOutcomeLoading: false,
            isShowLoading: false,
            isShowManualJudgment: this.props.isManualJudgment ? true : false,
            getLogData: completeDataArray,
          });
        } else {
          this.setState({
            otherInfo: (<>
              <div className="otherTopInfo">
                <div className="otherTopInfoRow">持續取得資料中...</div>
              </div>
            </>),
            isShowManualJudgment: this.props.isManualJudgment ? true : false,
          });
        }
      }
    })
    .catch((err) => {
      console.log('err: ', err);
    });
  }

  setGetDataTimeOutFn = () => {
    const getDataTimeOutPeriod = 24 * 60 * 60 * 1000;
    const getDataPeriod = 30 * 1000;

    this.setGetDataTimeOut = setTimeout(() => {
      this.clearSetGetDataTimeOut();
      if (!this.isGetWantedData) {
        this.clearGetDataInterval();
        this.setState({
          otherInfo: <span className="dataWarn">timeOut</span>,
          isShowOutcomeLoading: false,
          isShowLoading: false,
          isShowManualJudgment: this.props.isManualJudgment ? true : false
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
      const { testId, updateTestResult } = this.props;
      this.isGetWantedData = false;
      this.setState({
        isShowOutcomeLoading: true,
        isShowLoading: true,
        isPass: null,
        otherInfo: null
      });
      updateTestResult({ testId, result: null });
  
      const timestemp = baseUtils.setTimestemp();
      this.startTimeStemp = timestemp.sec;
      this.setGetDataTimeOutFn();
    }
  }

  render () {
    const {
      testId,
      isManualJudgment,
    } = this.props;
    const testSet = testContentSettings[testId];
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

        isShowManualJudgment={isManualJudgment ? this.state.isShowManualJudgment : false}
        handleManualPass={isManualJudgment ? this.handleManualPass : null}
        handleManualFailure={isManualJudgment ? this.handleManualFailure : null}
      />
    );
  }
}

ReOnLineTest.propTypes = {
  testId: PropTypes.string.isRequired,
  isManualJudgment: PropTypes.bool.isRequired,
  showOtherInfoKeys: PropTypes.arrayOf(PropTypes.string),
  filter: PropTypes.any
};

ReOnLineTest.defaultProps = {
  showOtherInfoKeys: null,
  handleCheckDataSuccess: null,
  filter: {},
};

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
)(ReOnLineTest);