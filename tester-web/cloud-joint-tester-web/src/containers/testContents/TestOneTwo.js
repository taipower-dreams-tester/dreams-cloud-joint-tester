import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import TestContentBase from '../TestContentBase';
import PLantData from '../PLantData';
import service from '../../configs/serviceConfig';
import testListConfigMap from '../../configs/testListConfigMap';
import baseUtils from "../../utils/base";
import { updateTestResult } from '../../store/actions/testAction';

const testId = '1-2';

// plant item value shown on page
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
    "PF_setting",
    "P_setting",
    "Q_setting",
    "vpset_setting",
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
  ],
};

class TestOneTwo extends PureComponent {

  constructor (props) {
    super(props);
    this.state = {
      otherInfo: null,
      isPass: null,
      isShowManualJudgment: false,
      isShowLoading: false,
      isShowOutcomeLoading: false,
    };

    this.testItems = testListConfigMap[props.plantCategory].testItems;
    this.testContentSettings = testListConfigMap[props.plantCategory].testContentSettings;
    this.testSet = this.testContentSettings[testId];
  }

  handleToggleLoading = (value) => {
    this.setState({ isShowLoading: value });
  }

  handleToggleOutcomeLoading = (value) => {
    this.setState({ isShowOutcomeLoading: value });
  }

  checkIsPass = (datas) => {
    let hasControllPLant = false,
      hasUnControllPlant = false;
    [].forEach.call(datas, (data) => {
      if (data.plantNo === this.props.controlPlantNum) hasControllPLant = true;
      if (data.plantNo === this.props.unControlPlantNum) hasUnControllPlant = true;
    });
    // check if has control and uncontrol plant data
    if (hasControllPLant && hasUnControllPlant) {
      return true;
    } else {
      return false;
    }
  }

  handleTestBegin = () => {
    const showPlantTestItems = showPlantTestItemsMap[this.props.plantCategory];

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
          config={this.testItems}
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
)(TestOneTwo);
