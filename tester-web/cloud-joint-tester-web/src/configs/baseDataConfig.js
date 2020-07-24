export default {
  controlPlantData: {
    num: '99-99-9999-99-9',
    name: '工研院測試案場',
  },
  valueCheckList: {
    ip: {
      required: true,
      otherTest: [],
    },
    port: {
      required: true,
      otherTest: [],
    },
    controlPlantNum: {
      required: true,
      otherTest: [
        {
          regExp: '\\d{2}-{1}\\d{2}-{1}\\d{4}-{1}\\d{2}-{1}\\d{1}',
          errorText: '只接受數字，長度共11個字',
        },
      ],
    },
    controlPlantName: {
      required: true,
      otherTest: [],
    },
    unControlPlantNum: {
      required: true,
      otherTest: [
        {
          regExp: '\\d{2}-{1}\\d{2}-{1}\\d{4}-{1}\\d{2}-{1}\\d{1}',
          errorText: '只接受數字，長度共11個字',
        },
      ],
    },
    unControlPlantName: {
      required: true,
      otherTest: [],
    },
    siteToken: {
      required: false,
      otherTest: [],
    },
  },
};
