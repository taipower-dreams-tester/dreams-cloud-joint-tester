import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import TestContentBase from '../TestContentBase';
import PLantData from '../PLantData';
import baseUtils from '../../utils/base';
import service from "../../configs/serviceConfig";

import testListConfigMap from '../../configs/testListConfigMap';
import { updateTestResult } from '../../store/actions/testAction';

const testId = '3-8';
const controlField = 'P_SUM_deadband';
const controlValue = 0.025;
const controlType = 'P_SUM';

class TestThreeEight extends PureComponent {

  constructor (props) {
    super(props);
    this.state = {
      otherInfo: null,
      isPass: null,
      isShowLoading: false,
      isShowOutcomeLoading: false,
    };

    this.showPlantTestItems = [
      // 'plantTypeId',
      'plantNo',
      controlField,
      'itemTimestamp'
    ];

    this.startTimeStemp = null;
    this.isGetWantedData = false;

    this.setGetDataTimeOut = null;
    this.getDataInterval = null;

    this.testItems = testListConfigMap[props.plantCategory].testItems;
    this.testContentSettings = testListConfigMap[props.plantCategory].testContentSettings;
    this.testSet = this.testContentSettings[testId];
  }

  componentWillUnmount () {
    this.clearSetGetDataTimeOut();
    this.clearGetDataInterval();
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
    let isPassObj = {
      isValueOk: false,
      isValueOkObj: {},
    };
    [].forEach.call(datas, (data) => {
      if (data.plantNo === this.props.controlPlantNum) {
        if(data[compareKey] === compareValue){
          isPassObj.isValueOk = true;
          isPassObj.isValueOkObj = data;
        }
        if (isPassObj.isValueOk) return isPassObj;
      }
    });
    return isPassObj;
  }

  // call second api
  getData = () => {
    axios.get(service.getPLantLogCurrents,{ params: {
      access_token: this.props.token,
      filter: {
          where: { plantNo: this.props.controlPlantNum }
      },
    }})
    .then((res) => {
      const isCheckPass = this.checkData(res.data, controlField, controlValue);
        if (isCheckPass.isValueOk) {
          // clear time set
          this.clearSetGetDataTimeOut();
          this.clearGetDataInterval();
          this.isGetWantedData = true;

          this.setState({
            otherInfo:
            <>
              {
                (isCheckPass.isValueOk) ? (<PLantData
                  data={[isCheckPass.isValueOkObj]}
                  testId={testId}
                  showPlantTestItems={this.showPlantTestItems}
                  controlPlantNum={this.props.controlPlantNum}
                  unControlPlantNum={this.props.unControlPlantNum}
                  config={this.testItems}
                />) : null
              }
            </>,
            isShowOutcomeLoading: false,
            isShowLoading: false,
            isPass: true
          });
          this.props.updateTestResult({ testId, result: true });
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
          otherInfo: <span className="dataWarn">timeOut, 超過 10 秒未拿到資料</span>,
          isShowOutcomeLoading: false,
          isShowLoading: false,
          isPass: false
        });
        this.props.updateTestResult({ testId, result: false });
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
      this.props.updateTestResult({ testId, result: null });

      // call first api
      axios.post(service.deadbandControl,{
          plantNo: this.props.controlPlantNum,
          field: controlType,
          value: controlValue,
          plantCategory: this.props.plantCategory
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
          isPass: false
        });
        this.props.updateTestResult({ testId, result: false });
      });
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
)(TestThreeEight);
