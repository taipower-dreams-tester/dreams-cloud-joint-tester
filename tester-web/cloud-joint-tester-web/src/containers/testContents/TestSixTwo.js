/* eslint-disable import/no-named-as-default */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-named-as-default-member
import ReOnLineTest from './testComponents/ReOnLineTest';

const testId = '6-2';

class TestSixTwo extends PureComponent {
  render() {
    const {
      controlPlantNum,
    } = this.props;
    return (
      <ReOnLineTest
        testId={testId}
        isManualJudgment
        plants={[controlPlantNum]}
      />
    );
  }
}

TestSixTwo.propTypes = {
  controlPlantNum: PropTypes.string.isRequired,
};

export default TestSixTwo;
