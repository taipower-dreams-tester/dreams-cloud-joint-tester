import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import TestContentBase from '../TestContentBase';
import service from '../../configs/serviceConfig';

import testListConfig from '../../configs/testListConfig'; 
import { updateTestResult } from '../../store/actions/testAction';

const testId = '1-1';
const testSet = testListConfig.testContentSettings[testId];

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

  handleTestBegin = () => {
    this.setState({ isShowOutcomeLoading: true, isPass: null });
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
      const isPass = res.data.length > 0;
      this.setState({
        isPass: isPass,
        isShowOutcomeLoading: false
      });
      this.props.updateTestResult({ testId, result: isPass });
    })
    .catch((err) => {
      console.log('err: ', err);
      this.setState({
        isPass: false,
        isShowOutcomeLoading: false
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
        description={testSet.description.replace('{ip}', this.props.ip)}
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
  ip: testReducer.ip,
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