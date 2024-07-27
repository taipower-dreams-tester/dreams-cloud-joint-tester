import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import axios from 'axios';
import TestContentBase from '../../TestContentBase';
import PLantData from '../../PLantData';
import baseUtils from '../../../utils/base';
import service from "../../../configs/serviceConfig";
import { updateTestResult } from '../../../store/actions/testAction';

import testListConfigMap from '../../../configs/testListConfigMap';

class ControlTest extends PureComponent {

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

    let defaultInfoKeys = [
      'plantNo',
      props.controlField,
      'itemTimestamp'
    ];
    if (!_.isEmpty(props.referenceField)) {
      defaultInfoKeys = [
        'plantNo',
        props.controlField,
        props.referenceField,
        'itemTimestamp'
      ];
    }
    this.showPlantTestItems = props.showOtherInfoKeys || defaultInfoKeys;

    this.startTimeStemp = null;
    this.isGetWantedData = false;

    this.setGetDataTimeOut = null;
    this.getDataInterval = null;

    this.testItems = testListConfigMap[props.plantCategory].testItems;
    this.testContentSettings = testListConfigMap[props.plantCategory].testContentSettings;
    this.testSet = this.testContentSettings[props.testId] || { title: '', description: '' };
  }

  componentWillUnmount () {
    this.clearAllTimeSet();
  }

  clearAllTimeSet = () => {
    this.clearSetGetDataTimeOut();
    this.clearGetDataInterval();
  }

  showInfoEnd = (ifPass) => {
    this.setState((state) => {
      const newState = {
        isPass: ifPass,
        isShowOutcomeLoading: false,
        isShowLoading: false,
      };
      if(!this.isGetWantedData){
        newState.otherInfo = <PLantData
          data={state.getLogData}
          testId={this.props.testId}
          showPlantTestItems={this.showPlantTestItems}
          controlPlantNum={this.props.controlPlantNum}
          unControlPlantNum={this.props.unControlPlantNum}
          config={this.testItems}
        />;
      }
      return newState;
    });
  }

  handleManualPass = () => {
    const { testId, updateTestResult } = this.props;
    this.clearAllTimeSet();
    this.showInfoEnd(true);
    updateTestResult({ testId, result: true });
  }

  handleManualFailure = () => {
    const { testId, updateTestResult } = this.props;
    this.clearAllTimeSet();
    this.showInfoEnd(false);
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

  checkData = (datas, compareKey, compareValue) => {
    let result = {
      success: false,
      targetReached: false,
      data: {},
    };
    [].forEach.call(datas, (data) => {
      if (data.plantNo === this.props.controlPlantNum) {
        result.success = (baseUtils.convertToBinary(data.control_result_01_25).split('').pop() === '1');
        if(result.success) {
          result.data = data;
          result.targetReached = data[compareKey] < compareValue * 1.01 &&
                                 data[compareKey] > compareValue * 0.99;
        }
      }
    });
    return result;
  }

  // call second api
  getData = () => {
    const filter = {
      where: { plantNo: this.props.controlPlantNum }
    };
    axios.get(service.getPLantLogCurrents,{ params: {
      access_token: this.props.token,
      filter,
    }})
    .then((res) => {
      if(this.props.handleCheckDataSuccess && this.props.handleCheckDataSuccess instanceof Function) {
        this.props.handleCheckDataSuccess();
      } else {
        const {success, targetReached, data} = this.checkData(res.data, this.props.controlField, this.props.controlValue);
        if (success) {
          if (targetReached) {
            // clear time set
            this.clearSetGetDataTimeOut();
            this.clearGetDataInterval();
            this.isGetWantedData = true;
          }

          this.setState({
            otherInfo:
              <>
                {
                  <div className="isSetOk">收到變流器成功回報</div>
                }
                {
                  <PLantData
                    data={[data]}
                    testId={this.props.testId}
                    showPlantTestItems={this.showPlantTestItems}
                    controlPlantNum={this.props.controlPlantNum}
                    unControlPlantNum={this.props.unControlPlantNum}
                    config={this.testItems}
                  />
                }
              </>,
            getLogData: [data],
            isShowOutcomeLoading: !targetReached,
            isShowLoading: !targetReached,
            isShowManualJudgment: this.props.isManualJudgment ? true : false
          });
        } else {
          this.setState({
            otherInfo: (<>
              <div className="otherTopInfo">
                <div className="otherTopInfoRow">持續取得資料中...</div>
              </div>
              <PLantData
                data={res.data}
                testId={this.props.testId}
                showPlantTestItems={this.showPlantTestItems}
                controlPlantNum={this.props.controlPlantNum}
                unControlPlantNum={this.props.unControlPlantNum}
                config={this.testItems}
              />
            </>),
            isShowManualJudgment: this.props.isManualJudgment ? true : false,
            getLogData: res.data,
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
    const getDataPeriod = 3 * 1000;

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
      this.isGetWantedData = false;
      this.setState({
        isShowOutcomeLoading: true,
        isShowLoading: true,
        isPass: null,
        otherInfo: null
      });
      const { testId, updateTestResult } = this.props;
      updateTestResult({ testId, result: null });

      // call first api
      axios.post(service.powerControl,{
          plantNo: this.props.controlPlantNum,
          type: this.props.controlType,
          value: this.props.controlValue,
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
          isShowLoading: false
        });
      });
    }
  }

  render () {
    const {
      testId,
      isManualJudgment,
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

        isShowManualJudgment={isManualJudgment ? this.state.isShowManualJudgment : false}
        handleManualPass={isManualJudgment ? this.handleManualPass : null}
        handleManualFailure={isManualJudgment ? this.handleManualFailure : null}
      />
    );
  }
}

ControlTest.propTypes = {
  testId: PropTypes.string.isRequired,
  controlType: PropTypes.string.isRequired,
  controlField: PropTypes.string.isRequired,
  controlValue: PropTypes.any.isRequired,
  referenceField: PropTypes.string,
  isManualJudgment: PropTypes.bool.isRequired,
  showOtherInfoKeys: PropTypes.arrayOf(PropTypes.string),
};

ControlTest.defaultProps = {
  showOtherInfoKeys: null,
  handleCheckDataSuccess: null,
  referenceField: null,
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
)(ControlTest);
