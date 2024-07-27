#include "dreams.hpp"

using std::vector;

namespace dreams {

DreamsGridPoints::DreamsGridPoints() {
  // 00: Line Current PhaseA
  points.push_back(new Point(10, "currentPhaseA", true, false));

  // 01: Line Current PhaseB
  points.push_back(new Point(10, "currentPhaseB", true, false));

  // 02: Line Current PhaseC
  points.push_back(new Point(10, "currentPhaseC", true, false));

  // 03: Line Current PhaseN
  points.push_back(new Point(10, "currentPhaseN", true, false));

  // 04: Line/Bus Voltage PhaseA
  points.push_back(new Point(100, "voltagePhaseA", false, true));

  // 05: Line/Bus Voltage PhaseB
  points.push_back(new Point(100, "voltagePhaseB", false, true));

  // 06: Line/Bus Voltage PhaseC
  points.push_back(new Point(100, "voltagePhaseC", false, true));

  // 07: kW
  points.push_back(new Point(1000, "P_SUM", true, true));

  // 08: kVar
  points.push_back(new Point(1000, "Q_SUM", true, true));

  // 09: PF
  points.push_back(new Point(100, "PF_AVG"));

  // 10: Frequency
  points.push_back(new Point(10, "frequency"));

  // 11: Wha
  points.push_back(new Point(1000, "total_kWh", true, true));

  // 12: irradiance
  points.push_back(new Point(1, "irradiance"));

  // 13: Wind speed
  points.push_back(new Point(1, "wind_speed"));

  // 14: Inverter PF setting
  points.push_back(new Point(1, "PF_setting"));

  // 15: Inverter P setting
  points.push_back(new Point(1, "P_setting"));

  // 16: Inverter Q setting
  points.push_back(new Point(1, "Q_setting"));

  // 17: Inverter Vpset setting
  points.push_back(new Point(1, "vpset_setting"));

  // 18: 1 - 25 inverters control successful
  points.push_back(new Point(1, "control_result_01_25"));

  // 19: 26 - 50 inverters control successful
  points.push_back(new Point(1, "control_result_26_50"));

  // 20: Line Current PhaseA Dead Band Threshold
  points.push_back(new Point(10000, "currentPhaseA_deadband"));

  // 21: Line Current PhaseB Dead Band Threshold
  points.push_back(new Point(10000, "currentPhaseB_deadband"));

  // 22: Line Current PhaseC Dead Band Threshold
  points.push_back(new Point(10000, "currentPhaseC_deadband"));

  // 23: Line Current PhaseN Dead Band Threshold
  points.push_back(new Point(10000, "currentPhaseN_deadband"));

  // 24: Line/Bus Voltage PhaseA Dead Band Threshold
  points.push_back(new Point(10000, "voltagePhaseA_deadband"));

  // 25: Line/Bus Voltage PhaseB Dead Band Threshold
  points.push_back(new Point(10000, "voltagePhaseB_deadband"));

  // 26: Line/Bus Voltage PhaseC Dead Band Threshold
  points.push_back(new Point(10000, "voltagePhaseC_deadband"));

  // 27: kW Dead Band Threshold
  points.push_back(new Point(10000, "P_SUM_deadband"));

  // 28: kVar Dead Band Threshold
  points.push_back(new Point(10000, "Q_SUM_deadband"));

  // 29: PF Dead Band Threshold
  points.push_back(new Point(10000, "PF_AVG_deadband"));

  // 30: Frequency Dead Band Threshold
  points.push_back(new Point(10000, "frequency_deadband"));

  // 31: Wha Dead Band Threshold, legacy field kept only for backward compatibility
  points.push_back(new Point(10000, "total_kWh_deadband"));

  // 32: Timestamp
  points.push_back(new Point(1, "itemTimestamp"));
}

DreamsEnergyStoragePoints::DreamsEnergyStoragePoints(){
  // 00: Line Current PhaseA
  points.push_back(new Point(10, "currentPhaseA", true, false));

  // 01: Line Current PhaseB
  points.push_back(new Point(10, "currentPhaseB", true, false));

  // 02: Line Current PhaseC
  points.push_back(new Point(10, "currentPhaseC", true, false));

  // 03: Line Current PhaseN
  points.push_back(new Point(10, "currentPhaseN", true, false));

  // 04: Line/Bus Voltage PhaseA
  points.push_back(new Point(100, "voltagePhaseA", false, true));

  // 05: Line/Bus Voltage PhaseB
  points.push_back(new Point(100, "voltagePhaseB", false, true));

  // 06: Line/Bus Voltage PhaseC
  points.push_back(new Point(100, "voltagePhaseC", false, true));

  // 07: kW
  points.push_back(new Point(1000, "P_SUM", true, true));

  // 08: kVar
  points.push_back(new Point(1000, "Q_SUM", true, true));

  // 09: PF
  points.push_back(new Point(100, "PF_AVG"));

  // 10: Frequency
  points.push_back(new Point(10, "frequency"));

  // 11: Battery Discharging
  points.push_back(new Point(1000, "total_kWh_discharging", true, true));

  // 12: Battery Charging
  points.push_back(new Point(1000, "total_kWh_charging", true, true));

  // 13: Ess Status, 0:stand by / 1:charging / 2:discharging / 3:error
  points.push_back(new Point(1, "status"));

  // 14: SOC
  points.push_back(new Point(1000, "SOC"));

  // 15: Battery Cycle Count
  points.push_back(new Point(1, "battery_cycle_count"));

  // 16: Line Current PhaseA Dead Band Threshold
  points.push_back(new Point(10000, "currentPhaseA_deadband"));

  // 17: Line Current PhaseB Dead Band Threshold
  points.push_back(new Point(10000, "currentPhaseB_deadband"));

  // 18: Line Current PhaseC Dead Band Threshold
  points.push_back(new Point(10000, "currentPhaseC_deadband"));

  // 19: Line Current PhaseN Dead Band Threshold
  points.push_back(new Point(10000, "currentPhaseN_deadband"));

  // 20: Line/Bus Voltage PhaseA Dead Band Threshold
  points.push_back(new Point(10000, "voltagePhaseA_deadband"));

  // 21: Line/Bus Voltage PhaseB Dead Band Threshold
  points.push_back(new Point(10000, "voltagePhaseB_deadband"));

  // 22: Line/Bus Voltage PhaseC Dead Band Threshold
  points.push_back(new Point(10000, "voltagePhaseC_deadband"));

  // 23: kW Dead Band Threshold
  points.push_back(new Point(10000, "P_SUM_deadband"));

  // 24: kVar Dead Band Threshold
  points.push_back(new Point(10000, "Q_SUM_deadband"));

  // 25: PF Dead Band Threshold
  points.push_back(new Point(10000, "PF_AVG_deadband"));

  // 26: Frequency Dead Band Threshold
  points.push_back(new Point(10000, "frequency_deadband"));

  // 27: Timestamp
  points.push_back(new Point(1, "itemTimestamp"));
}

} // namespace dreams
