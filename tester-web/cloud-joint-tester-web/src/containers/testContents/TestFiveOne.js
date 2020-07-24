/* eslint-disable import/no-named-as-default */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-named-as-default-member
import OfflineTest from './testComponents/OfflineTest';

const testId = '5-1';

class TestFiveOne extends PureComponent {
  render() {
    const {
      controlPlantNum,
      unControlPlantNum,
    } = this.props;
    return (
      <OfflineTest
        testId={testId}
        plants={[controlPlantNum, unControlPlantNum]}
      />
    );
  }
}

TestFiveOne.propTypes = {
  controlPlantNum: PropTypes.string.isRequired,
  unControlPlantNum: PropTypes.string.isRequired,
};

export default TestFiveOne;