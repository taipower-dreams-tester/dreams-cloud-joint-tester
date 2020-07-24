/* eslint-disable import/no-named-as-default */
import React, { PureComponent } from 'react';
// eslint-disable-next-line import/no-named-as-default-member
import ControlTest from './testComponents/ControlTest';

const testId = '3-5';

class TestThreeFive extends PureComponent {
  render() {
    return (
      <ControlTest
        testId={testId}
        controlType="active_power"
        controlValue={100}
        controlField="P_setting"
        referenceField="P_SUM"
        isManualJudgment
      />
    );
  }
}

export default TestThreeFive;
