/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-named-as-default-member */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  updateActiveTestTag,
} from '../store/actions/testAction';
import LeftMenu from './LeftMenu';
import TestOneOne from './testContents/TestOneOne';
import TestOneTwo from './testContents/TestOneTwo';
import TestTwoOne from './testContents/TestTwoOne';
import TestTwoTwo from './testContents/TestTwoTwo';
import TestTwoThree from './testContents/TestTwoThree';
import TestTwoFour from './testContents/TestTwoFour';
import TestThreeOne from './testContents/TestThreeOne';
import TestThreeTwo from './testContents/TestThreeTwo';
import TestThreeThree from './testContents/TestThreeThree';
import TestThreeFour from './testContents/TestThreeFour';
import TestThreeFive from './testContents/TestThreeFive';
import TestThreeSix from './testContents/TestThreeSix';
import TestThreeSeven from './testContents/TestThreeSeven';
import TestThreeEight from './testContents/TestThreeEight';
import TestFourOne from './testContents/TestFourOne';
import TestFiveOne from './testContents/TestFiveOne';
import TestFiveTwo from './testContents/TestFiveTwo';
import TestSixOne from './testContents/TestSixOne';
import TestSixTwo from './testContents/TestSixTwo';

class TestPage extends PureComponent {
  render() {
    const {
      controlPlantNum,
      unControlPlantNum,
    } = this.props;
    return (
      <div className="testPageWrap">
        <LeftMenu />
        <TestOneOne />
        <TestOneTwo />
        <TestTwoOne />
        <TestTwoTwo />
        <TestTwoThree />
        <TestTwoFour />
        <TestThreeOne />
        <TestThreeTwo />
        <TestThreeThree />
        <TestThreeFour />
        <TestThreeFive />
        <TestThreeSix />
        <TestThreeSeven />
        <TestThreeEight />
        <TestFourOne />
        <TestFiveOne
          controlPlantNum={controlPlantNum}
          unControlPlantNum={unControlPlantNum}
        />
        <TestFiveTwo
          controlPlantNum={controlPlantNum}
          unControlPlantNum={unControlPlantNum}
        />
        <TestSixOne
          controlPlantNum={controlPlantNum}
        />
        <TestSixTwo
          controlPlantNum={controlPlantNum}
        />
      </div>
    );
  }
}

TestPage.propTypes = {
  controlPlantNum: PropTypes.string.isRequired,
  unControlPlantNum: PropTypes.string.isRequired,
};

const mapStateToProps = ({ testReducer }) => ({
  activeTestTag: testReducer.activeTestTag,
  controlPlantNum: testReducer.controlPlantNum,
  unControlPlantNum: testReducer.unControlPlantNum,
});
const mapDispatchToProps = {
  updateActiveTestTag,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TestPage);
