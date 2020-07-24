/* eslint-disable import/no-named-as-default */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-named-as-default-member
import OfflineTest from './testComponents/OfflineTest';

const testId = '6-1';

class TestSixOne extends PureComponent {
  render() {
    const {
      controlPlantNum,
    } = this.props;
    return (
      <OfflineTest
        testId={testId}
        plants={[controlPlantNum]}
      />
    );
  }
}

TestSixOne.propTypes = {
  controlPlantNum: PropTypes.string.isRequired,
};

export default TestSixOne;