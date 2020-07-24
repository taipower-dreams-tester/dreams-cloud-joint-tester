/* eslint-disable import/no-named-as-default */
import React, { PureComponent } from 'react';
// eslint-disable-next-line import/no-named-as-default-member
import ToggleAutoControl from './testComponents/ToggleAutoControl';

const testId = '3-1';

class TestThreeOne extends PureComponent {
  render() {
    return (
      <ToggleAutoControl
        testId={testId}
        autonomicControlValue={0}
      />
    );
  }
}

export default TestThreeOne;
