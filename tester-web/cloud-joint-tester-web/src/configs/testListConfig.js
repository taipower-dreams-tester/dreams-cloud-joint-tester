export default {
  leftMenu: [
    {
      groupId: '1',
      groupName: '',
      subItems: ['1-1', '1-2'],
    },
    {
      groupId: '2',
      groupName: '',
      subItems: ['2-1', '2-2', '2-3', '2-4'],
    },
    {
      groupId: '3',
      groupName: '',
      subItems: ['3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8'],
    },
    {
      groupId: '4',
      groupName: '',
      subItems: ['4-1'],
    },
    {
      groupId: '5',
      groupName: '',
      subItems: ['5-1', '5-2'],
    },
    {
      groupId: '6',
      groupName: '',
      subItems: ['6-1', '6-2'],
    },
  ],
  testContentSettings: {
    '1-1': {
      id: '1-1',
      title: 'DREAMS模擬伺服器可成功連線至受測雲端資料系統。',
      description: '點選以下按鈕，與 {ip} 建立連線。',
    },
    '1-2': {
      id: '1-2',
      title: '確認DREAMS模擬伺服器可顯示2個案場資料，分別為雲端資料系統業者提供，以及現場設備。',
      description: 'ID=1，為現場測試設備。ID=2，為自備真實案場。',
    },
    '2-1': {
      id: '2-1',
      title: 'DREAMS模擬伺服器會發出Polling要求，雲端資料系統應回傳對應資料。',
      description: '請確認DREAMS模擬伺服器之軟體上之三相電表各項數值，與現場電表一致。',
    },
    '2-2': {
      id: '2-2',
      title: '確認DREAMS模擬伺服器之Dead Band 閥值設定，為規範中的預設值。',
      description: '',
    },
    '2-3': {
      id: '2-3',
      title: '提升變流器輸出電流，確認DREAMS模擬器應在3秒內收到DUT發出的DNP3 Event massage with timestamp(Dead Band)。',
      description: '請點選以下按鈕並同時提升變流器輸出。（盡可能同時），若兩時間小於3秒，請點選通過。',
    },
    '2-4': {
      id: '2-4',
      title: '整點、15分等定時完整資料主動傳送',
      description: '開始測試後，本系統如有收到定時資料，會顯示於下方，如測試時間超過定時資料回傳時間，下方依然無數值，請判定不通過。',
    },
    '3-1': {
      id: '3-1',
      title: 'DREAMS模擬伺服器執行現場取消變流器自主調控。',
      description: '請確認現場變流器處在接受外部調控的狀態。並且以下應顯示收到變流器成功回報。',
    },
    '3-2': {
      id: '3-2',
      title: 'DREAMS模擬伺服器設定現場變流器PF值90。',
      description: '確認現場變流器PF值應逐漸變動接近90%。',
    },
    '3-3': {
      id: '3-3',
      title: 'DREAMS模擬伺服器設定現場變流器PF值100。',
      description: '確認現場變流器PF值應逐漸變動接近100%',
    },
    '3-4': {
      id: '3-4',
      title: 'DREAMS模擬伺服器設定現場變流器P值80。',
      description: '確認現場變流器P值應慢慢下降至低於額定功率的80%。',
    },
    '3-5': {
      id: '3-5',
      title: 'DREAMS模擬伺服器設定現場變流器P值100。',
      description: '確認現場變流器P值應可回復到最大輸出功率。',
    },
    '3-6': {
      id: '3-6',
      title: 'DREAMS模擬伺服器設定現場變流器恢復自主調控。',
      description: '確認現場變流器處在自主調控的狀態',
    },
    '3-7': {
      id: '3-7',
      title: 'DREAMS模擬伺服器設定設定現場變流器VPset值105。',
      description: '確認現場變流器VPset值應變更為105。',
    },
    '3-8': {
      id: '3-8',
      title: 'DREAMS模擬伺服器現場設定功率的Dead Band閥值為2.5%。',
      description: '',
    },
    '4-1': {
      id: '4-1',
      title: 'DREAMS模擬伺服器離線31分鐘後恢復連線，離線期間雲端資料系統應將定時資料暫存系統。恢復連線時DREAMS模擬伺服器將主動發起連線雲端資料系統。',
      description: '點選以下按鈕進行離線31分鐘。時間到後將自動恢復連線。',
    },
    '5-1': {
      id: '5-1',
      title: '請手動將受測之雲端資料系統關機或離線',
      description: '請手動將受測之雲端資料系統關機或離線後再按下測試按鈕，DREAMS模擬伺服器應可見所有案場離線。',
    },
    '5-2': {
      id: '5-2',
      title: '將受測之雲端資料系統重啟並連線',
      description: '請先按下測試按鈕再將受測之雲端資料系統重啟並連線，雲端資料系統應主動拋出所有案場最近一筆定時資料。',
    },
    '6-1': {
      id: '6-1',
      title: '手動將現場資料蒐集器斷電。',
      description: '手動將現場資料蒐集器斷電後再按下測試按鈕，DREAMS模擬伺服器應可見可控案場離線。',
    },
    '6-2': {
      id: '6-2',
      title: '將現場資料蒐集器復歸、上電',
      description: '請先按下測試按鈕再將現場資料蒐集器復歸、上電，DREAMS模擬伺服器應可收到可控案場最近一筆定時資料',
    },
  },
  testItems: {
    currentPhaseA: {
      title: 'Line Current PhaseA',
      defaultValue: 0.05,
    },
    currentPhaseB: {
      title: 'Line Current PhaseB',
      defaultValue: 0.05,
    },
    currentPhaseC: {
      title: 'Line Current PhaseC',
      defaultValue: 0.05,
    },
    currentPhaseN: {
      title: 'Line Current PhaseN',
      defaultValue: 0.05,
    },
    voltagePhaseA: {
      title: 'Line/Bus Voltage PhaseA',
      defaultValue: 0.01,
    },
    voltagePhaseB: {
      title: 'Line/Bus Voltage PhaseB',
      defaultValue: 0.01,
    },
    voltagePhaseC: {
      title: 'Line/Bus Voltage PhaseC',
      defaultValue: 0.01,
    },
    // 實功
    P_SUM: {
      title: 'kW',
      defaultValue: 0.02,
    },
    // 虛功
    Q_SUM: {
      title: 'kVar',
      defaultValue: 0.05,
    },
    // 功率因數
    PF_AVG: {
      title: 'PF',
      defaultValue: 0.01,
    },
    // 頻率
    frequency: {
      title: 'Frequency',
      defaultValue: 0.005,
    },
    // 累積電量
    total_kWh: {
      title: 'Wh',
      defaultValue: '-',
    },
    // 日照量
    irradiance: {
      title: '日照量',
      defaultValue: 0.05,
    },
    // 風速計
    wind_speed: {
      title: '風速計',
      defaultValue: 0.005,
    },
    // 變流器 PF 設定值
    PF_setting: {
      title: '變流器 PF 設定值',
      defaultValue: null,
    },
    // 變流器 P 設定值
    P_setting: {
      title: '變流器 P 設定值',
      defaultValue: null,
    },
    // 變流器 Q 設定值
    Q_setting: {
      title: '變流器 Q 設定值',
      defaultValue: null,
    },
    // 變流器 Vpset 設定值
    vpset_setting: {
      title: '變流器 Vpset 設定值',
      defaultValue: null,
    },
    control_result_01_25: {
      title: '1~25 變流器是否成功受控',
      defaultValue: null,
    },
    control_result_26_50: {
      title: '26~50 變流器是否成功受控',
      defaultValue: null,
    },
    currentPhaseA_deadband: {
      isDeadband: true,
      title: 'Line Current PhaseA Deadband',
      defaultValue: 0.05,
    },
    currentPhaseB_deadband: {
      isDeadband: true,
      title: 'Line Current PhaseB Deadband',
      defaultValue: 0.05,
    },
    currentPhaseC_deadband: {
      isDeadband: true,
      title: 'Line Current PhaseC Deadband',
      defaultValue: 0.05,
    },
    currentPhaseN_deadband: {
      isDeadband: true,
      title: 'Line Current PhaseN Deadband',
      defaultValue: 0.05,
    },
    voltagePhaseA_deadband: {
      isDeadband: true,
      title: 'Line/Bus Voltage PhaseA Deadband',
      defaultValue: 0.01,
    },
    voltagePhaseB_deadband: {
      isDeadband: true,
      title: 'Line/Bus Voltage PhaseB Deadband',
      defaultValue: 0.01,
    },
    voltagePhaseC_deadband: {
      isDeadband: true,
      title: 'Line/Bus Voltage PhaseC Deadband',
      defaultValue: 0.01,
    },
    P_SUM_deadband: {
      isDeadband: true,
      title: 'kW Deadband',
      defaultValue: 0.02,
    },
    Q_SUM_deadband: {
      isDeadband: true,
      title: 'kVar Deadband',
      defaultValue: 0.05,
    },
    PF_AVG_deadband: {
      isDeadband: true,
      title: 'PF Deadband',
      defaultValue: 0.01,
    },
    frequency_deadband: {
      isDeadband: true,
      title: 'Frequency Deadband',
      defaultValue: 0.005,
    },
    // 時間戳 需再確認是不是這一個 key
    itemTimestamp: {
      title: '時間戳',
      defaultValue: '-',
    },
    atTimestamp: {
      title: '收到資料時間',
      defaultValue: '-',
    },
    // 案場電號
    plantNo: {
      title: 'plantNo',
      defaultValue: '-',
    },
  },
};
