/* eslint-disable import/no-named-as-default */
import React, { PureComponent } from 'react';
// eslint-disable-next-line import/no-named-as-default-member
import ToggleAutoControl from './testComponents/ToggleAutoControl';

const testId = '3-6';

class TestThreeSix extends PureComponent {
  render() {
    return (
      <ToggleAutoControl
        testId={testId}
        autonomicControlValue={1}
      />
    );
  }
}

export default TestThreeSix;
