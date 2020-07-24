// import testListConfig from '../configs/testListConfig';

// const defaultPLantDataObject = {
//   plantNo: '',
// };
// Object.keys(testListConfig.testItems).forEach((item) => {
//   defaultPLantDataObject[item] = '';
// });

import testListConfig from '../configs/testListConfig';

const { testItems } = testListConfig;

const baseUtils = (() => (
  {
    setTimestemp: () => {
      const newTime = (new Date()).getTime();
      const newSecTime = parseInt((newTime / 1000), 10);
      return {
        sec: newSecTime,
        minSec: newTime,
      };
    },
    // sort control and uncontrol plant data
    sortPLant: (datas = [], controlPlnatNum = 'control', unControlPlantNum = 'uncontrol') => {
      // const defaultPLantDataObject = { ...defaultPLantDataObject };
      const newSortArray = [];
      [controlPlnatNum, unControlPlantNum].forEach((targetPlantNum, index) => {
        const targetPlantData = datas.find((plant) => plant.plantNo === targetPlantNum);
        if (targetPlantData) {
          newSortArray[index] = targetPlantData;
        } else {
          newSortArray[index] = {
            plantNo: targetPlantNum,
          };
        }
      });

      return newSortArray;
    },
    convertToBinary: (data) => (data.toString(2)),
    checkIsCompleteData: (data) => [].every.call(Object.keys(testItems), (key) => data[key] !== null),
  }
))();

export default baseUtils;
