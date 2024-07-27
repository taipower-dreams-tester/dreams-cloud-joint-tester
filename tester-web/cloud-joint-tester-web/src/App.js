import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  updateBaseData,
  sendBaseData,
  deleteGateway,
} from './store/actions/testAction';
import BaseData from './containers/BaseData';
import TestPage from './containers/TestPage';

import '../node_modules/bootstrap-scss/bootstrap.scss';
import './App.scss';

import baseDataConfig from './configs/baseDataConfig';
const fieldsCheckList = baseDataConfig.valueCheckList;

// the unit of all timestemp from Dreams Loopback API is second not minisecond.
class App extends Component {

  constructor (props) {
    super(props);
    this.state = {
      infoText: '',
    };
    this.gatewayId = this.props.gatewayId;
  }

  componentDidMount () {
    // deleete localstorage gatewayId
    const gatewayId = window.localStorage.getItem('GWid');
    if(gatewayId){
      this.props.deleteGateway({
        gatewayId,
        accessToken: this.props.token,
      });
      window.localStorage.removeItem('GWid');
    }
  }

  checkValidate = (name, value) => {
    const checkSet = fieldsCheckList[name],
      emptyErrorText = '此欄不能為空';
    let isValidate = true,
      errorText = null,
      getValue = value;

    const checkCB = () => {
      return { isValidate, errorText};
    }

    if (checkSet) {
      if (checkSet.required && getValue === '') {
        errorText = emptyErrorText;
        isValidate = false;
        return checkCB();
      }
      if (checkSet.otherTest && checkSet.otherTest.length > 0) {
        checkSet.otherTest.forEach(check => {
          const testRegExp = new RegExp(check.regExp, 'g');

          if (check.isNumber) getValue = +getValue;
          isValidate = testRegExp.test(getValue);
          if (!isValidate) {
            errorText = check.errorText;
            return checkCB();
          }
        });
      }
    }

    return checkCB();

  }

  checkAllValidate = (checkList) => {
    if (checkList) {
      const validateArray = [];

      Object.keys(checkList).forEach((item) => {
        const checkOutcome = this.checkValidate(item, this.props[item]);
        validateArray.push(checkOutcome.isValidate);
      });

      return validateArray;
    }
  }

  handleInputChange = (event) => {
    const { target } = event,
      name = target.name,
      value = target.value,
      checkValidateOutcome = this.checkValidate(target.name, target.value);

    if (checkValidateOutcome.isValidate) {
      this.props.updateBaseData({
        [name]: value,
        [`${name}Error`]: ''
      });
    } else {
      this.props.updateBaseData({
        [name]: value,
        [`${name}Error`]: checkValidateOutcome.errorText
      });
    }
  }

  handlePlantInputChange = (event) => {
    const { target } = event,
      name = target.name,
      value = target.value,
      index = target.dataset.index,
      controlType = target.dataset.control,
      newValueArray = [...this.props[`${controlType}PlantNumArray`]];
    let newValue = null,
      checkValidateOutcome = null;

    newValueArray[index] = value;
    newValue = newValueArray.join('-');
    checkValidateOutcome = this.checkValidate(target.name, newValue);

    if (checkValidateOutcome.isValidate) {
      this.props.updateBaseData({
        [`${controlType}PlantNumArray`]: newValueArray,
        [name]: newValue,
        [`${name}Error`]: ''
      });
    } else {
      this.props.updateBaseData({
        [`${controlType}PlantNumArray`]: newValueArray,
        [name]: newValue,
        [`${name}Error`]: checkValidateOutcome.errorText
      });
    }
  }

  handleStartTest = (e) => {
    e.preventDefault();

    const checkValues = this.checkAllValidate(fieldsCheckList);
    const isCheckValueValidate = [].every.call(checkValues, (value) => value );

    if (isCheckValueValidate) {
        this.setState({ infoText: '' });
        // 打 set 基本資料的 API
        this.props.sendBaseData({
          ip: this.props.ip,
          port: this.props.port,
          controlPlantNum: this.props.controlPlantNum,
          controlPlantName: this.props.controlPlantName,
          unControlPlantNum: this.props.unControlPlantNum,
          uncontrolPlantName: this.props.unControlPlantName,
          siteToken: this.props.siteToken,
          plantCategory: this.props.plantCategory,
        })
      } else {
        this.setState({ infoText: '請將上方資訊填寫完整' });
      }
  }

  render () {
    return (
      <div className="appWrap" >
        {
          this.props.isShowBaseDataForm ? (
            <BaseData
              handleInputChange={this.handleInputChange}
              handlePlantInputChange={this.handlePlantInputChange}
              handleStartTest={this.handleStartTest}
              infoText={this.state.infoText}
              plantCategory={this.props.plantCategory}

              ipError={this.props.ipError || ''}
              portError={this.props.portError || ''}
              controlPlantNumError={this.props.controlPlantNumError || ''}
              unControlPlantNumError={this.props.unControlPlantNumError || ''}
              controlPlantNameError={this.props.controlPlantNameError || ''}
              unControlPlantNameError={this.props.unControlPlantNameError || ''}
              ip={this.props.ip || ''}

              port={this.props.port || ''}
              controlPlantNum={this.props.controlPlantNum || ''}
              controlPlantNumArray={this.props.controlPlantNumArray}
              unControlPlantNum={this.props.unControlPlantNum || ''}
              unControlPlantNumArray={this.props.unControlPlantNumArray}
              controlPlantName={this.props.controlPlantName || ''}
              unControlPlantName={this.props.unControlPlantName || ''}

              isSetBaseDataLoading={this.props.isSetBaseDataLoading}
              setBaseDataErrMsg={this.props.setBaseDataErrMsg}
            />
          ) : (
            <TestPage/>
          )
        }
      </div>
    );
  }

}

const mapStateToProps = ({ testReducer  }) => ({
  plantCategory: testReducer.plantCategory,

  ip: testReducer.ip,
  ipError: testReducer.ipError,
  port: testReducer.port,
  portError: testReducer.portError,

  controlPlantNum: testReducer.controlPlantNum,
  controlPlantNumArray: testReducer.controlPlantNumArray,
  controlPlantNumError: testReducer.controlPlantNumError,
  unControlPlantNum: testReducer.unControlPlantNum,
  unControlPlantNumArray: testReducer.unControlPlantNumArray,
  unControlPlantNumError: testReducer.unControlPlantNumError,

  controlPlantName: testReducer.controlPlantName,
  controlPlantNameError: testReducer.controlPlantNameError,
  unControlPlantName: testReducer.unControlPlantName,
  unControlPlantNameError: testReducer.unControlPlantNameError,

  siteToken: testReducer.siteToken,

  isShowBaseDataForm: testReducer.isShowBaseDataForm,
  token: testReducer.token,
  gatewayId: testReducer.gatewayId,

  isSetBaseDataLoading: testReducer.isSetBaseDataLoading,
  setBaseDataErrMsg: testReducer.setBaseDataErrMsg,
});
const mapDispatchToProps = {
    updateBaseData,
    sendBaseData,
    deleteGateway,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

App.propTypes = {
  ip: PropTypes.string.isRequired,
  port: PropTypes.string.isRequired,
  controlPlantNum: PropTypes.string.isRequired,
  controlPlantName: PropTypes.string.isRequired,
  unControlPlantNum: PropTypes.string.isRequired,
  unControlPlantName: PropTypes.string.isRequired,
  isShowBaseDataForm: PropTypes.bool.isRequired,
  sendBaseData: PropTypes.func.isRequired,
}
