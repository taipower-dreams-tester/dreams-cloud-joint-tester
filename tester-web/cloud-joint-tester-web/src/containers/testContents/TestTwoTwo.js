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
const testId = '2-2';
const testSet = testContentSettings[testId];
// plant item value shown on page
const showPlantTestItems = [
  // 'plantTypeId',
  'plantNo',
  'currentPhaseA_deadband',
  'currentPhaseB_deadband',
  'currentPhaseC_deadband',
  'currentPhaseN_deadband',
  'voltagePhaseA_deadband',
  'voltagePhaseB_deadband',
  'voltagePhaseC_deadband',
  'P_SUM_deadband',
  'Q_SUM_deadband',
  'PF_AVG_deadband',
  'frequency_deadband',
];

class TestTwoTwo extends PureComponent {

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

  checkIfIsDefaultValue = (data) => {
    let isPass = true;
    Object.keys(testItems).forEach((item) => {  
      if (testItems[item].isDeadband && data[item] !== testItems[item].defaultValue) {
        isPass = false;
      };
    });
    return isPass;
  }

  checkIsPass = (datas) => {
    
    let isPass = false,
      hasControllPLant = false,
      hasUnControllPlant = false,
      isControllPLantPass = false,
      isUnControllPLantPass = false;
    [].forEach.call(datas, (data) => {
      let checkOutcome = false;      
      checkOutcome = this.checkIfIsDefaultValue(data);
      if (data.plantNo === this.props.controlPlantNum) {
        hasControllPLant = true;
        isControllPLantPass = checkOutcome;
      }
      if (data.plantNo === this.props.unControlPlantNum) {
        hasUnControllPlant = true;
        isUnControllPLantPass = checkOutcome;
      }
    });
    // check if has control and uncontrol plant data
    if (hasControllPLant && hasUnControllPlant && isControllPLantPass && isUnControllPLantPass) {
      isPass = true;
    } else {
      isPass = false;
    }
    return isPass;
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
      // add default plant data
      let newData = baseUtils.sortPLant([...res.data], this.props.controlPlantNum, this.props.unControlPlantNum);
      
      [].unshift.call(newData, {
        plantTypeId: '預設值',
        plantNo: '- (預設值)',
        currentPhaseA_deadband: testItems.currentPhaseA_deadband.defaultValue,
        currentPhaseB_deadband: testItems.currentPhaseB_deadband.defaultValue,
        currentPhaseC_deadband: testItems.currentPhaseC_deadband.defaultValue,
        currentPhaseN_deadband: testItems.currentPhaseN_deadband.defaultValue,
        voltagePhaseA_deadband: testItems.voltagePhaseA_deadband.defaultValue,
        voltagePhaseB_deadband: testItems.voltagePhaseB_deadband.defaultValue,
        voltagePhaseC_deadband: testItems.voltagePhaseC_deadband.defaultValue,
        P_SUM_deadband: testItems.P_SUM_deadband.defaultValue,
        Q_SUM_deadband: testItems.Q_SUM_deadband.defaultValue,
        PF_AVG_deadband: testItems.PF_AVG_deadband.defaultValue,
        frequency_deadband: testItems.frequency_deadband.defaultValue,
      });

      // render preshow plant data
      this.setState({
        otherInfo: <PLantData
          data={newData}
          testId={testId}
          showPlantTestItems={showPlantTestItems}
          controlPlantNum={this.props.controlPlantNum}
          unControlPlantNum={this.props.unControlPlantNum}
        />,
        isShowLoading: false
      });

      const isPass = this.checkIsPass(res.data);
      this.props.updateTestResult({ testId, result: isPass });
      this.setState({
        isPass,
        isShowOutcomeLoading: false
      });
    })
    .catch((err) => {
      console.log('err: ', err);
      this.setState({
        isShowOutcomeLoading: false,
        isShowLoading: false,
        isPass: false,
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
)(TestTwoTwo);