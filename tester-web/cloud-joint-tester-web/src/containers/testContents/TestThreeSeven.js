/* eslint-disable import/no-named-as-default */
import React, { PureComponent } from 'react';
// eslint-disable-next-line import/no-named-as-default-member
import ControlTest from './testComponents/ControlTest';

const testId = '3-7';

class TestThreeSeven extends PureComponent {
  render() {
    return (
      <ControlTest
        testId={testId}
        controlType="vpset"
        controlValue={105}
        controlField="vpset_setting"
        isManualJudgment
      />
    );
  }
}

export default TestThreeSeven;
