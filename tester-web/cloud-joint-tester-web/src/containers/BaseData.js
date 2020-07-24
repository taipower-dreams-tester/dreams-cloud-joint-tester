import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import axios from 'axios';
import service from "../configs/serviceConfig";

import loadImg from '../images/loading.gif';

const PlantNoInput = (props) => {
  const {
    isControl,
    handlePlantInputChange,
    valueArray,
    disabled,
  } = props;
  const controlTypeText = isControl ? 'control' : 'unControl';
  return (
    <div className="plantNoInputWrap">
      <input
        type="text"
        className="form-control num2"
        name={`${controlTypeText}PlantNum`}
        onChange={handlePlantInputChange}
        placeholder=""
        maxLength="2"
        value={valueArray[0]}
        disabled={disabled}
        data-index="0"
        data-control={controlTypeText}
      />
      <span>&nbsp;-&nbsp;</span>
      <input
        type="text"
        className="form-control num2"
        name={`${controlTypeText}PlantNum`}
        onChange={handlePlantInputChange}
        placeholder=""
        maxLength="2"
        value={valueArray[1]}
        disabled={disabled}
        data-index="1"
        data-control={controlTypeText}
      />
      <span>&nbsp;-&nbsp;</span>
      <input
        type="text"
        className="form-control num4"
        name={`${controlTypeText}PlantNum`}
        onChange={handlePlantInputChange}
        placeholder=""
        maxLength="4"
        value={valueArray[2]}
        disabled={disabled}
        data-index="2"
        data-control={controlTypeText}
      />
      <span>&nbsp;-&nbsp;</span>
      <input
        type="text"
        className="form-control num2"
        name={`${controlTypeText}PlantNum`}
        onChange={handlePlantInputChange}
        placeholder=""
        maxLength="2"
        value={valueArray[3]}
        disabled={disabled}
        data-index="3"
        data-control={controlTypeText}
      />
      <span>&nbsp;-&nbsp;</span>
      <input
        type="text"
        className="form-control num1"
        name={`${controlTypeText}PlantNum`}
        onChange={handlePlantInputChange}
        placeholder=""
        maxLength="1"
        value={valueArray[4]}
        disabled={disabled}
        data-index="4"
        data-control={controlTypeText}
      />
    </div>
  );
};

PlantNoInput.propTypes = {
  isControl: PropTypes.bool.isRequired,
  handlePlantInputChange: PropTypes.func.isRequired,
  valueArray: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
};

PlantNoInput.defaultProps = {
  disabled: false,
};

class BaseDataForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { siteToken: null };
  }

  componentDidMount(){
    this.getCustomToken();
  }

  getCustomToken = () => {
    axios.get(`${service.getCustomToken}`,{ params: {
      access_token: this.props.token,
      filter: {
        order: "created DESC",
    }}})
    .then((res) => {
      const siteToken = (res.data && res.data.length > 0) ? res.data[0].id : '';
      this.setState({ siteToken });
      this.props.handleInputChange({target: {name: 'siteToken', value: siteToken}});
    })
    .catch((err) => {})
  }

  render() {
    const {
      handleInputChange,
      handlePlantInputChange,
      ip, ipError,
      port, portError,
      controlPlantNumError,
      controlPlantName,
      controlPlantNameError,
      controlPlantNumArray,
      unControlPlantNumError,
      unControlPlantNumArray,
      unControlPlantNameError,
      unControlPlantName,
      infoText,
      handleStartTest,
      isSetBaseDataLoading,
      setBaseDataErrMsg,
    } = this.props;
    const { siteToken } = this.state;
    const startBtnDisabled = isSetBaseDataLoading ? { disabled: true } : {};
    return (
      <div>
        <form className="baseDataForm">
          <div className={classnames(
            'form-group',
            { error: ipError },
          )}
          >
            <span className="label">IP:</span>
            <input
              type="text"
              className="form-control"
              name="ip"
              onChange={handleInputChange}
              placeholder="e.g. 192.168.00.00"
              value={ip}
            />
            <div className="errorMsg">{ipError}</div>
          </div>
          <div className={classnames(
            'form-group',
            { error: portError },
          )}
          >
            <span className="label">PORT:</span>
            <input
              type="text"
              className="form-control"
              name="port"
              onChange={handleInputChange}
              placeholder="e.g. 80"
              value={port}
            />
            <div className="errorMsg">{portError}</div>
          </div>
          <div className={classnames(
            'form-group',
            { error: controlPlantNumError },
          )}
          >
            <span className="label">可控逆變器案場電號:</span>
            <PlantNoInput
              isControl
              handlePlantInputChange={handlePlantInputChange}
              valueArray={controlPlantNumArray}
              disabled
            />
            <div className="errorMsg">{controlPlantNumError}</div>
          </div>
          <div className={classnames(
            'form-group',
            'hide',
            { error: controlPlantNameError },
          )}
          >
            <span className="label">可控逆變器案場名稱:</span>
            <input
              type="text"
              className="form-control"
              name="controlPlantName"
              onChange={handleInputChange}
              placeholder=""
              data-id="1"
              value={controlPlantName}
              disabled
            />
            <div className="errorMsg">{controlPlantNameError}</div>
          </div>
          <div className={classnames(
            'form-group',
            { error: unControlPlantNumError },
          )}
          >
            <span className="label">不可控逆變器案場電號:</span>
            <PlantNoInput
              isControl={false}
              handlePlantInputChange={handlePlantInputChange}
              valueArray={unControlPlantNumArray}
            />
            <div className="errorMsg">{unControlPlantNumError}</div>
          </div>
          <div className={classnames(
            'form-group',
            'hide',
            { error: unControlPlantNameError },
          )}
          >
            <span className="label">不可控逆變器案場名稱:</span>
            <input
              type="text"
              className="form-control"
              name="unControlPlantName"
              onChange={handleInputChange}
              placeholder=""
              data-id="2"
              value={unControlPlantName}
            />
            <div className="errorMsg">{unControlPlantNameError}</div>
          </div>
          <div className="form-group">
            <span className="label">API Token: </span>
            <input
              type="text"
              className="form-control"
              name="siteToken"
              onChange={handleInputChange}
              placeholder=""
              value={siteToken || ''}
              disabled
            />
          </div>
          <div className={classnames(
            'infoText',
            { hide: !infoText },
          )}
          >
            {infoText}
          </div>
          <div className="actionRow">
            <div className="left">
              <div className={classnames(
                'loadingIco',
                { hide: !isSetBaseDataLoading },
              )}
              >
                <img src={loadImg} alt="" /><span>建立基本資料中...</span>
              </div>
              <div className={classnames(
                'setBaseDataErrMsg',
                { hide: !setBaseDataErrMsg || isSetBaseDataLoading },
              )}
              >
                {setBaseDataErrMsg}
              </div>
            </div>
            <button
              type="button"
              onClick={handleStartTest}
              className="btn btn-primary baseDataBtn"
              { ...startBtnDisabled }
            >
              開始測試
            </button>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = ({ testReducer }) => ({
  token: testReducer.token,
});

export default connect(
  mapStateToProps,
  null,
)(BaseDataForm);

BaseDataForm.propTypes = {
  handleInputChange: PropTypes.func.isRequired,
  handlePlantInputChange: PropTypes.func.isRequired,
  infoText: PropTypes.string.isRequired,
  handleStartTest: PropTypes.func.isRequired,
  controlPlantNumArray: PropTypes.array.isRequired,
  unControlPlantNumArray: PropTypes.array.isRequired,

  ip: PropTypes.string.isRequired,
  port: PropTypes.string.isRequired,
  controlPlantName: PropTypes.string.isRequired,
  unControlPlantName: PropTypes.string.isRequired,

  ipError: PropTypes.string.isRequired,
  portError: PropTypes.string.isRequired,
  controlPlantNumError: PropTypes.string.isRequired,
  controlPlantNameError: PropTypes.string.isRequired,
  unControlPlantNumError: PropTypes.string.isRequired,
  unControlPlantNameError: PropTypes.string.isRequired,

  isSetBaseDataLoading: PropTypes.bool.isRequired,
  setBaseDataErrMsg: PropTypes.string.isRequired,
};
