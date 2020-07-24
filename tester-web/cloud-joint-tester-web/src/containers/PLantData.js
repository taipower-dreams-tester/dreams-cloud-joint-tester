/* eslint-disable no-nested-ternary */
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import testListConfig from '../configs/testListConfig';

const { testItems } = testListConfig;
const noDataKey = 'noData';

const renderPlantItem = (plant, showPlantTestItems, testId, config, controlPlantNum, unControlPlantNum) => (
  showPlantTestItems.map((item) => (
    <li key={`${testId}_${plant.id}_${item}`}>
      <span className="label">
        {
          (item === 'plantTypeId') ? 'ID:' : `${config[item].title}:`
        }
      </span>
      &nbsp;
      <span className="value">
        {
          (item === 'plantTypeId') ? (
            plant.plantNo === controlPlantNum ? 1 : ((plant.plantNo === unControlPlantNum) ? 2 : plant[item])
          ) : null
        }
        {
          (item === 'itemTimestamp' || item === 'atTimestamp') && moment.unix(plant[item]).format('LLL')
        }
        {
          (item === 'lastUpdate') && `${moment.unix(plant[item]).format('LLL')} (${moment().from(moment.unix(plant[item]))})`
        }
        {
          (item !== 'plantTypeId' && item !== 'itemTimestamp' && item !== 'atTimestamp' && item !== 'lastUpdate') && plant[item]
        }
      </span>
    </li>
  ))
);

// not get plant data
const renderNoPlantData = (plant, showPlantTestItems, testId, config) => (
  showPlantTestItems.map((item, index) => (
    <li key={`${testId}_${plant.plantNo || index}_${item}`}>
      {
        (item === 'noData') ? (
          <span className={noDataKey}>沒有資料</span>
        ) : (
          <>
            <span className="label">{ `${config[item].title}:` }</span>
            &nbsp;
            <span className="value">{ plant[item] }</span>
          </>
        )
      }
    </li>
  ))
);

const PLantData = (props) => {
  const { data, customConfig } = props;
  const config = customConfig || testItems;
  return (
    <div className="plantDataWrap">
      {
        data.map((plant) => (
          <ul key={`${props.testId}_${plant.plantNo}_${plant.itemTimestamp}`}>
            {
              (Object.keys(plant).length === 1 && Object.keys(plant)[0] === 'plantNo') ? (
                renderNoPlantData(
                  plant,
                  ['plantNo', noDataKey],
                  props.testId,
                  config,
                )
              ) : (
                renderPlantItem(
                  plant,
                  props.showPlantTestItems,
                  props.testId,
                  config,
                  props.controlPlantNum,
                  props.unControlPlantNum,
                )
              )
            }
          </ul>
        ))
      }
    </div>
  );
};

PLantData.propTypes = {
  data: PropTypes.array.isRequired,
  testId: PropTypes.string.isRequired,
  showPlantTestItems: PropTypes.array.isRequired,
  controlPlantNum: PropTypes.string.isRequired,
  unControlPlantNum: PropTypes.string.isRequired,
  customConfig: PropTypes.object,
};

PLantData.defaultProps = {
  customConfig: null,
};

export default PLantData;
