import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import TestContentBase from '../TestContentBase';
import PLantData from '../PLantData';
import service from '../../configs/serviceConfig';
import testListConfig from '../../configs/testListConfig';
import baseUtils from "../../utils/base";
import { updateTestResult } from '../../store/actions/testAction';

const { testItems, testContentSettings } = testListConfig;

const testId = '1-2';
const testSet = testContentSettings[testId];
// plant item value shown on page
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
  'PF_setting',
  'P_setting',
  'Q_setting',
  'vpset_setting',
];

class TestOneOne extends PureComponent {

  constructor (props) {
    super(props);
    this.state = {
      otherInfo: null,
      isPass: null,
      isShowManualJudgment: false,
      isShowLoading: false,
      isShowOutcomeLoading: false,
    };
  }

  handleToggleLoading = (value) => {
    this.setState({ isShowLoading: value });
  }

  handleToggleOutcomeLoading = (value) => {
    this.setState({ isShowOutcomeLoading: value });
  }

  checHasAllTestItemAndValue = (data) => {
    let isPass = false;
    Object.keys(testItems).forEach((item) => {
      if (!Object.prototype.hasOwnProperty.call(data, item)) return isPass;
      if (data[item] !== undefined && data[item] !== null) return isPass;
    });
    return isPass = true;
  }

  checkIsPass = (datas) => {
    let isPass = false,
      hasControllPLant = false,
      hasUnControllPlant = false;
    [].forEach.call(datas, (data) => {
      if (data.plantNo === this.props.controlPlantNum) hasControllPLant = true;
      if (data.plantNo === this.props.unControlPlantNum) hasUnControllPlant = true;
      const checkOutcome = this.checHasAllTestItemAndValue(data);
      if(!checkOutcome) return isPass;
    });
    // check if has control and uncontrol plant data
    if (hasControllPLant && hasUnControllPlant) {
      return isPass = true;
    } else {
      return isPass = false;
    }
  }

  handleTestBegin = () => {
    this.setState({
      isShowOutcomeLoading: true,
      isShowLoading: true,
      isPass: null,
      otherInfo: null
    });
    this.props.updateTestResult({ testId, result: null });

    axios.get(`${service.getPLantLogCurrents}`,{ params: {
      access_token: this.props.token,
      filter: {
        where: {
          or: [
              { plantNo: this.props.controlPlantNum },
              { plantNo: this.props.unControlPlantNum },
          ]
        }
      }}})
    .then((res) => {
      const sortPlantData = baseUtils.sortPLant([...res.data], this.props.controlPlantNum, this.props.unControlPlantNum);
      this.setState({
        otherInfo: <PLantData
          data={sortPlantData}
          testId={testId}
          showPlantTestItems={showPlantTestItems}
          controlPlantNum={this.props.controlPlantNum}
          unControlPlantNum={this.props.unControlPlantNum}
        />,
        isShowLoading: false,
      });

      const isPass = this.checkIsPass(res.data);
      this.setState({
        isPass,
        isShowOutcomeLoading: false
      });
      this.props.updateTestResult({ testId, result: isPass });
    })
    .catch((err) => {
      console.log('err: ', err);
      this.setState({
        isShowOutcomeLoading: false,
        isShowLoading: false
      });
      this.props.updateTestResult({ testId, result: false });
    });
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
)(TestOneOne);