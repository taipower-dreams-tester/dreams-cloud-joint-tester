import React, { PureComponent } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import loadImg from '../images/loading.gif';

class TestContentBase extends PureComponent {
  render() {
    const {
      isShow,
      title,
      description,
      otherInfo,
      otherInfo2,
      isShowLoading,
      handleTestBegin,
      isShowOutcomeLoading,
      isPass,
      isShowManualJudgment,
      handleManualPass,
      handleManualFailure,
    } = this.props;
    const testBtnDisabled = isShowLoading ? { disabled: true } : {};
    return (
      <div className={classnames(
        'TestContentBaseWrap',
        { hide: !isShow },
      )}
      >
        <section className="testTopInfo">
          <div className="topInfo">
            <div className="baseTestInfo">
              <div className="title">
                {title}
              </div>
              <div className="description">{description}</div>
            </div>
            <div className="otherInfo">{otherInfo}</div>
            <div className="otherInfo2">{otherInfo2}</div>
            <div className={classnames(
              'loadingIco',
              { hide: !isShowLoading },
            )}
            >
              <img src={loadImg} alt="" />
            </div>
          </div>
          <div className="bottomBtnsWrap">
            <button
              type="button"
              onClick={handleTestBegin}
              className="btn btn-primary beginTestBtn"
              { ...testBtnDisabled }
            >
              測試
            </button>
          </div>
        </section>
        <section className="testBottomInfo">
          <div className="testOutcome">
            <div className="subTitle">測試結果：</div>
            <div className={classnames(
              'loadingIco',
              { hide: !isShowOutcomeLoading },
            )}
            >
              <img src={loadImg} alt="" />
            </div>
            {
              (isPass !== null && isPass) ? (
                <div className="outcome outcomePass">通過</div>
              ) : null
            }
            {
              (isPass !== null && !isPass) ? (
                <div className="outcome outcomeNotPass">不通過</div>
              ) : null
            }
          </div>
          {
            // manual check if pass buttons
            (isShowManualJudgment) && (
              <div className="manualCheck">
                <div className="subTitle">人工判斷是否通過，請點選以下：</div>
                <button
                  type="button"
                  onClick={handleManualPass}
                  className="btn btn-success manualPassTestBtn"
                >
                  通過
                </button>
                <button
                  type="button"
                  onClick={handleManualFailure}
                  className="btn btn-danger manualNotPassTestBtn"
                >
                  不通過
                </button>
              </div>
            )
          }
        </section>
      </div>
    );
  }
}

TestContentBase.propTypes = {
  isShow: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  otherInfo: PropTypes.any,
  otherInfo2: PropTypes.any,
  isShowLoading: PropTypes.bool.isRequired,
  isShowOutcomeLoading: PropTypes.bool.isRequired,
  handleTestBegin: PropTypes.func.isRequired,
  isPass: PropTypes.bool,
  isShowManualJudgment: PropTypes.bool,
  handleManualPass: PropTypes.func,
  handleManualFailure: PropTypes.func,
};

TestContentBase.defaultProps = {
  otherInfo: null,
  otherInfo2: null,
  isPass: null,
  isShowManualJudgment: false,
  handleManualPass: null,
  handleManualFailure: null,
};

export default TestContentBase;
