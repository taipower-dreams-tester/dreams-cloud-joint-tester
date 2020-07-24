import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import TestContentBase from '../../TestContentBase';
import PLantData from '../../PLantData';
import baseUtils from '../../../utils/base';
import service from "../../../configs/serviceConfig";

import testListConfig from '../../../configs/testListConfig'; 
import { updateTestResult } from '../../../store/actions/testAction';

const { testContentSettings } = testListConfig;

const testItems = {
  plantNo: {
    title: 'plantNo',
    defaultValue: '-',
  },
  lastUpdate: {
    title: '上次更新時間',
    defaultValue: '-',
  },
};

class OfflineTest extends PureComponent {

  constructor (props) {
    super(props);
    this.state = {
      otherInfo: null,
      isPass: null,
      isShowLoading: false,
      isShowOutcomeLoading: false,
      isShowManualJudgment: false,
      data: [],
      newDataArrived: false,
      timeouted: false,
      startTimestamp: 0,
    };

    this.showPlantTestItems = props.showOtherInfoKeys || [
      'plantNo',
      'lastUpdate',
    ];

    this.getDataTimeout = null;
    this.getDataInterval = null;
  }

  componentWillUnmount () {
    this.clearAllTimeSet();
  }

  clearAllTimeSet = () => {
    this.clearGetDataTimeout();
    this.clearGetDataInterval();
  }

  showInfoEnd = (isPass) => {
    const { testId, updateTestResult } = this.props;
    this.setState((state) => {
      return {
        isPass,
        isShowOutcomeLoading: false,
        isShowLoading: false,
        otherInfo: <PLantData
          data={state.data}
          testId={testId}
          showPlantTestItems={this.showPlantTestItems}
          customConfig={testItems}
        />,
      };
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

  clearGetDataTimeout = () => {
    if(this.getDataTimeout) {
      clearTimeout(this.getDataTimeout);
      this.getDataTimeout = null;
    }
  }
  clearGetDataInterval = () => {
    if(this.getDataInterval) {
      clearInterval(this.getDataInterval);
      this.getDataInterval = null;
    }
  }

  processData = (logs) => {
    const { startTimestamp } = this.state;
    const now = baseUtils.setTimestemp().sec;
    const newDataArrived = _.some(logs, log => log.atTimestamp > startTimestamp);
    const timeouted = _.every(logs, log => log.atTimestamp < (now - 900));
    const data = _.map(this.props.plants, (plantNo) => {
      const current = _.find(logs, log => log.plantNo === plantNo);
      return { plantNo, lastUpdate: (current ? current.atTimestamp : startTimestamp) }
    });
    return { newDataArrived, timeouted, data };
  }
  
  // call second api
  getData = () => {
    let filter = _.merge(
      {
        where: {
          or: this.props.plants.map(plantNo => ({plantNo}))
        }
      }
    );
    axios.get(service.getPLantLogCurrents,{ params: {
      access_token: this.props.token,
      filter,
    }})
    .then((res) => {
      if(this.props.handleCheckDataSuccess && this.props.handleCheckDataSuccess instanceof Function) {
        this.props.handleCheckDataSuccess();
      } else {
        const { newDataArrived, timeouted, data } = this.processData(res.data);
        const { startTimestamp } = this.state;
        const { testId, updateTestResult } = this.props;
        const done = (newDataArrived || timeouted);
        let message = '';
        let isPass = null;
        if (timeouted) {
          isPass = true;
          message = '已斷線(超過15min沒有資料)';
        } else if (newDataArrived) {
          isPass = false;
          message = '收到新資料:';
        } else {
          message = `測試開始於: ${moment.unix(startTimestamp).format('LLL')} (${moment().from(moment.unix(startTimestamp))})，持續取得資料中...`;
        }
        this.setState({
          otherInfo: <>
            <div className="otherTopInfo">
              <div className="otherTopInfoRow">{message}</div>
            </div>
            { newDataArrived &&
              <PLantData
                data={data}
                testId={testId}
                showPlantTestItems={this.showPlantTestItems}
                customConfig={testItems}
              />
            }
          </>,
          isShowOutcomeLoading: !done,
          isShowLoading: !done,
          isShowManualJudgment: this.props.isManualJudgment ? true : false,
          isPass,
          data,
          newDataArrived,
          timeouted,
        });
        if (done) {
          updateTestResult({ testId, result: timeouted });
          this.clearGetDataTimeout();
          this.clearGetDataInterval();
        }
      }
    })
    .catch((err) => {
      console.log('err: ', err);
    });
  }

  initGetDataTimeout = () => {
    const timeout = 15 * 60 * 1000;
    const period = 5 * 1000;

    this.getDataTimeout = setTimeout(() => {
      this.clearGetDataTimeout();
      const { testId, updateTestResult } = this.props;
      const { newDataArrived, data } = this.state;
      if (!newDataArrived) {
        this.clearGetDataInterval();
        this.setState({
          otherInfo:
            <div className="otherTopInfo">
              <div className="otherTopInfoRow">已斷線(超過15min沒有資料)</div>
            </div>,
          timeouted: true,
          isPass: true,
          isShowOutcomeLoading: false,
          isShowLoading: false,
          isShowManualJudgment: this.props.isManualJudgment ? true : false
        });
        updateTestResult({ testId, result: true });
      }
    }, timeout);

    if(!this.getDataInterval){
      // set get data interval
      this.getDataInterval = setInterval(() => {
        // call get data api
        this.getData();
      }, period);
    }

  }

  handleTestBegin = () => {
    if(!this.getDataTimeout) {
      this.setState({
        isShowOutcomeLoading: true,
        isShowLoading: true,
        isPass: null,
        otherInfo: null,
        newDataArrived: false,
        timeouted: false,
        startTimestamp: baseUtils.setTimestemp().sec,
      });
      const { testId, updateTestResult } = this.props;
      updateTestResult({ testId, result: null });

      this.initGetDataTimeout();
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

OfflineTest.propTypes = {
  testId: PropTypes.string.isRequired,
  isManualJudgment: PropTypes.bool,
  showOtherInfoKeys: PropTypes.arrayOf(PropTypes.string),
  filter: PropTypes.any
};

OfflineTest.defaultProps = {
  showOtherInfoKeys: null,
  handleCheckDataSuccess: null,
  isManualJudgment: false,
  filter: {},
};

const mapStateToProps = ({ testReducer  }) => ({
  activeTestTag: testReducer.activeTestTag,
  ip: testReducer.activeTestTag,
  token: testReducer.token,
});

const mapDispatchToProps = {
  updateTestResult,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OfflineTest);