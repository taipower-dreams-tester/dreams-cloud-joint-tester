/* eslint-disable import/no-named-as-default */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-named-as-default-member
import ReOnLineTest from './testComponents/ReOnLineTest';

const testId = '5-2';

class TestFiveTwo extends PureComponent {
  render() {
    const {
      controlPlantNum,
      unControlPlantNum,
    } = this.props;
    return (
      <ReOnLineTest
        testId={testId}
        isManualJudgment
        plants={[controlPlantNum, unControlPlantNum]}
      />
    );
  }
}

TestFiveTwo.propTypes = {
  controlPlantNum: PropTypes.string.isRequired,
  unControlPlantNum: PropTypes.string.isRequired,
};

export default TestFiveTwo;
