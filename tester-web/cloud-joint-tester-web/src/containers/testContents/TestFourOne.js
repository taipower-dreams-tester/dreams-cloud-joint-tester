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
const testId = '4-1';
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
  'total_kWh',
];

class TestFourOne extends PureComponent {

  constructor (props) {
    super(props);
    this.state = {
      otherInfo: null,
      isPass: null,
      isShowLoading: false,
      isShowOutcomeLoading: false,
    };

    this.stopDreamsTimeStemp = null;
    this.startDreamsTimeStemp = null;
    this.isGetWantedData = false;

    this.setGetDataTimeOut = null;
    this.startDreamsTimeOut = null;
    this.getDataInterval = null;
    this.countDownInterval = null;
  }

  componentWillUnmount () {
    this.clearAllTimeSet();
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
    this.clearTimeSet('setGetDataTimeOut', 'timeout');
    this.clearTimeSet('startDreamsTimeOut', 'timeout');
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
                    <div className="otherTopInfoRow">成功離線，距離恢復連線尚餘：{minText} 分鐘 {secText} 秒</div>
                  </div>,
      });
      secs -= 1;
      if (secs < 0) this.clearTimeSet('countDownInterval', 'interval');
    }, 1000);
  }

  checkData = (logs) => {
    const controlLogs = [];
    const unontrolLogs = [];
    [].forEach.call(logs, (log) => {
      const isCompleteData = [].every.call(Object.values(log), value => value !== null);
      if(isCompleteData && log.plantNo === this.props.controlPlantNum){
        controlLogs.push(log);
      } else if (isCompleteData && log.plantNo === this.props.unControlPlantNum) {
        unontrolLogs.push(log);
      }
    });
    // check if have two control plant and two uncontrol plant complete data
    const isPass = (controlLogs.length >= 2 && unontrolLogs.length >= 2);
    return {
      isPass,
      recoverLogs: controlLogs.slice(0, 2).concat(unontrolLogs.slice(0, 2))
    };
  }
  
  // call get log api
  getData = () => {
    axios.get(`${service.getPLantLog}`,{ params: {
      access_token: this.props.token,
      filter: {
        order: "itemTimestamp DESC",
        where: {
          and: [
              { itemTimestamp: { gt: this.stopDreamsTimeStemp } }
          ],
          or: [
            { plantNo: this.props.controlPlantNum },
            { plantNo: this.props.unControlPlantNum },
          ]
        }
    }}})
    .then((res) => {
      const {isPass, recoverLogs} = this.checkData(res.data);
      const offlinePeriod = parseInt(((this.startDreamsTimeStemp - this.stopDreamsTimeStemp) / 60), 10);
      if (isPass) {
        // clear time set
        this.clearAllTimeSet();
        this.isGetWantedData = true;

        this.setState({
          otherInfo: 
            <>
              <div className="otherTopInfo">
                <div className="otherTopInfoRow">離線時間：{offlinePeriod} 分鐘</div>
                <div className="otherTopInfoRow">連線已恢復</div>
                <div className="otherTopInfoRow">以下應收到兩案場之回補資料: </div>
              </div>
              <PLantData
                data={recoverLogs}
                testId={testId}
                showPlantTestItems={showPlantTestItems}
                controlPlantNum={this.props.controlPlantNum}
                unControlPlantNum={this.props.unControlPlantNum}
              />
            </>,
          isShowOutcomeLoading: false,
          isShowLoading: false,
          isPass,
        });
      }
      this.props.updateTestResult({ testId, result: isPass });
    })
    .catch((err) => {
      console.log('err: ', err);
    });
  }

  setGetDataTimeOutFn = () => {
    const getDataTimeOutPeriod = 10 * 60 * 1000;
    const getDataPeriod = 30 * 1000;

    this.setGetDataTimeOut = setTimeout(() => {
      this.clearTimeSet('setGetDataTimeOut', 'timeout');
      if (!this.isGetWantedData) {
        this.clearTimeSet('getDataInterval', 'interval');
        this.setState({
          otherInfo: <span className="dataWarn">timeOut</span>,
          isShowOutcomeLoading: false,
          isShowLoading: false,
          isPass: false
        });
      }
    }, getDataTimeOutPeriod);

    if(!this.getDataInterval){
      // set get data interval
      this.getDataInterval = setInterval(() => {
        // call get log data api
        this.getData();
      }, getDataPeriod);
    }

  }

  setDreamsRestartTimeout = () => {
    if(!this.startDreamsTimeOut){
      const reConnectTime = 31;
      const restartDreamsApiTimeoutPeriod = reConnectTime * 60 * 1000;
      this.setCountDown(reConnectTime);
      setTimeout(() => {
        this.setState({
          otherInfo: <div className="otherTopInfo">
                      <div className="otherTopInfoRow">連線中...</div>
                    </div>,
        });
        this.clearTimeSet('countDownInterval', 'interval');
        // call start dreams server api
        axios.post(`${service.toggleDreamsOffline}`,{
            operation: 'start',
          },
          { params: {
            access_token: this.props.token,
          }}
        )
        .then((res) => {
          this.setState({
            otherInfo: <div className="otherTopInfo">
                        <div className="otherTopInfoRow">連線完成，取得資料中...</div>
                      </div>,
          });
          // set start dreams server time
          const timestemp = baseUtils.setTimestemp();
          this.startDreamsTimeStemp = timestemp.sec;
          this.setGetDataTimeOutFn();
        })
        .catch((err) => {
          console.log('err: ', err);
          this.setState({
            isShowOutcomeLoading: false,
            isShowLoading: false
          });
        });
      }, restartDreamsApiTimeoutPeriod);
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
  
      // call stop dreams server api
      axios.post(`${service.toggleDreamsOffline}`,{
          operation: 'stop',
        },
        { params: {
          access_token: this.props.token,
        }}
      )
      .then((res) => {
        // set stop dreams server time
        const timestemp = baseUtils.setTimestemp();
        this.stopDreamsTimeStemp = timestemp.sec;
        this.setDreamsRestartTimeout();
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
    const { otherInfo, isPass, isShowLoading, isShowOutcomeLoading } = this.state;
    return (
      <TestContentBase
        testId={testId}
        isShow={this.props.activeTestTag === testId}
        title={testSet.title}
        description={testSet.description}
        otherInfo={otherInfo}
        handleTestBegin={this.handleTestBegin}
        isPass={isPass}
        isShowLoading={isShowLoading}
        isShowOutcomeLoading={isShowOutcomeLoading}
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
)(TestFourOne);