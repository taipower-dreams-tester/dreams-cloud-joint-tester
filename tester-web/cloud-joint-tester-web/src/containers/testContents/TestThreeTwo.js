/* eslint-disable import/no-named-as-default */
import React, { PureComponent } from 'react';
// eslint-disable-next-line import/no-named-as-default-member
import ControlTest from './testComponents/ControlTest';

const testId = '3-2';

class TestThreeTwo extends PureComponent {
  render() {
    return (
      <ControlTest
        testId={testId}
        controlType="power_factor"
        controlValue={90}
        controlField="PF_setting"
        referenceField="PF_AVG"
        isManualJudgment
      />
    );
  }
}

export default TestThreeTwo;
