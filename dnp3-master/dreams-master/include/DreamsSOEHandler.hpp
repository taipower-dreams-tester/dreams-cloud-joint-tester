/*
 * Copyright 2013-2019 Automatak, LLC
 *
 * Licensed to Green Energy Corp (www.greenenergycorp.com) and Automatak
 * LLC (www.automatak.com) under one or more contributor license agreements.
 * See the NOTICE file distributed with this work for additional information
 * regarding copyright ownership. Green Energy Corp and Automatak LLC license
 * this file to you under the Apache License, Version 2.0 (the "License"); you
 * may not use this file except in compliance with the License. You may obtain
 * a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
#ifndef ASIODNP3_DREAMSSOEHANDLER_H
#define ASIODNP3_DREAMSSOEHANDLER_H

#include <opendnp3/master/ISOEHandler.h>

#include <iostream>
#include <memory>
#include <sstream>

namespace dreams {

class PointValue {
public:
  PointValue() : value(0.0), updated(false) {}
  double value;
  bool updated;
};

/**
 *	ISOEHandler singleton that prints to the console.
 */
class DreamsSOEHandler final : public opendnp3::ISOEHandler {
  std::string m_gatewayAddress;
  std::string m_plantNo;
  std::string m_plantName;
  double m_ctRatio = 1.0;
  double m_ptRatio = 1.0;

public:
  DreamsSOEHandler(std::string gatewayAddress, std::string plantNo, std::string plantName,
                   double ctRatio, double ptRatio) {
    m_gatewayAddress = gatewayAddress;
    m_plantNo = plantNo;
    m_plantName = plantName;
    m_ctRatio = ctRatio == 0 ? 1.0 : ctRatio;
    m_ptRatio = ptRatio == 0 ? 1.0 : ptRatio;
  }

  static std::shared_ptr<ISOEHandler> Create(std::string gatewayAddress, std::string plantNo, std::string plantName,
                                             double ctRatio, double ptRatio) {
    return std::make_shared<DreamsSOEHandler>(gatewayAddress, plantNo, plantName, ctRatio, ptRatio);
  }

  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::Binary>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::DoubleBitBinary>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::Analog>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::Counter>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::FrozenCounter>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::BinaryOutputStatus>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::AnalogOutputStatus>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::OctetString>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::TimeAndInterval>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::BinaryCommandEvent>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::AnalogCommandEvent>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::Indexed<opendnp3::SecurityStat>> &values) override;
  virtual void Process(const opendnp3::HeaderInfo &info,
                       const opendnp3::ICollection<opendnp3::DNPTime> &values) override;

protected:
  void Start() final {}
  void End() final {}

private:
  template <class T>
  static void PrintAll(const opendnp3::HeaderInfo &info, const opendnp3::ICollection<opendnp3::Indexed<T>> &values) {
    auto print = [&](const opendnp3::Indexed<T> &pair) { Print<T>(info, pair.value, pair.index); };
    values.ForeachItem(print);
  }

  template <class T> static void Print(const opendnp3::HeaderInfo &, const T &value, uint16_t index) {
    std::cout << "[" << index << "] : " << ValueToString(value) << " : " << static_cast<int>(value.flags.value) << " : "
              << value.time << std::endl;
  }

  template <class T> static std::string ValueToString(const T &meas) {
    std::ostringstream oss;
    oss << meas.value;
    return oss.str();
  }

  static std::string GetTimeString(opendnp3::TimestampMode tsmode) {
    std::ostringstream oss;
    switch (tsmode) {
    case (opendnp3::TimestampMode::SYNCHRONIZED):
      return "synchronized";
      break;
    case (opendnp3::TimestampMode::UNSYNCHRONIZED):
      oss << "unsynchronized";
      break;
    default:
      oss << "no timestamp";
      break;
    }

    return oss.str();
  }

  static std::string ValueToString(const opendnp3::DoubleBitBinary &meas) {
    return opendnp3::DoubleBitToString(meas.value);
  }
};

} // namespace dreams

#endif
