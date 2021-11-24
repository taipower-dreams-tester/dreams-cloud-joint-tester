#include "dreams.hpp"

using std::vector;

namespace dreams {

const vector<Point *> points() {

  vector<Point *> all;
  // 00: Line Current PhaseA
  all.push_back(new Point(10, "currentPhaseA", true, false));

  // 01: Line Current PhaseB
  all.push_back(new Point(10, "currentPhaseB", true, false));

  // 02: Line Current PhaseC
  all.push_back(new Point(10, "currentPhaseC", true, false));

  // 03: Line Current PhaseN
  all.push_back(new Point(10, "currentPhaseN", true, false));

  // 04: Line/Bus Voltage PhaseA
  all.push_back(new Point(100, "voltagePhaseA", false, true));

  // 05: Line/Bus Voltage PhaseB
  all.push_back(new Point(100, "voltagePhaseB", false, true));

  // 06: Line/Bus Voltage PhaseC
  all.push_back(new Point(100, "voltagePhaseC", false, true));

  // 07: kW
  all.push_back(new Point(1000, "P_SUM", true, true));

  // 08: kVar
  all.push_back(new Point(1000, "Q_SUM", true, true));

  // 09: PF
  all.push_back(new Point(100, "PF_AVG"));

  // 10: Frequency
  all.push_back(new Point(10, "frequency"));

  // 11: Wha
  all.push_back(new Point(1000, "total_kWh", true, true));

  // 12: irradiance
  all.push_back(new Point(1, "irradiance"));

  // 13: Wind speed
  all.push_back(new Point(1, "wind_speed"));

  // 14: Inverter PF setting
  all.push_back(new Point(1, "PF_setting"));

  // 15: Inverter P setting
  all.push_back(new Point(1, "P_setting"));

  // 16: Inverter Q setting
  all.push_back(new Point(1, "Q_setting"));

  // 17: Inverter Vpset setting
  all.push_back(new Point(1, "vpset_setting"));

  // 18: 1 - 25 inverters control successful
  all.push_back(new Point(1, "control_result_01_25"));

  // 19: 26 - 50 inverters control successful
  all.push_back(new Point(1, "control_result_26_50"));

  // 20: Line Current PhaseA Dead Band Threshold
  all.push_back(new Point(10000, "currentPhaseA_deadband"));

  // 21: Line Current PhaseB Dead Band Threshold
  all.push_back(new Point(10000, "currentPhaseB_deadband"));

  // 22: Line Current PhaseC Dead Band Threshold
  all.push_back(new Point(10000, "currentPhaseC_deadband"));

  // 23: Line Current PhaseN Dead Band Threshold
  all.push_back(new Point(10000, "currentPhaseN_deadband"));

  // 24: Line/Bus Voltage PhaseA Dead Band Threshold
  all.push_back(new Point(10000, "voltagePhaseA_deadband"));

  // 25: Line/Bus Voltage PhaseB Dead Band Threshold
  all.push_back(new Point(10000, "voltagePhaseB_deadband"));

  // 26: Line/Bus Voltage PhaseC Dead Band Threshold
  all.push_back(new Point(10000, "voltagePhaseC_deadband"));

  // 27: kW Dead Band Threshold
  all.push_back(new Point(10000, "P_SUM_deadband"));

  // 28: kVar Dead Band Threshold
  all.push_back(new Point(10000, "Q_SUM_deadband"));

  // 29: PF Dead Band Threshold
  all.push_back(new Point(10000, "PF_AVG_deadband"));

  // 30: Frequency Dead Band Threshold
  all.push_back(new Point(10000, "frequency_deadband"));

  // 31: Wha Dead Band Threshold, legacy field kept only for backward compatibility
  all.push_back(new Point(10000, "total_kWh_deadband"));

  // 32: Timestamp
  all.push_back(new Point(1, "itemTimestamp"));

  return all;
}

const vector<Point *> allPoints = points();

} // namespace dreams
