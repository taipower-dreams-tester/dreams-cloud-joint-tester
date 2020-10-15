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
#include "DreamsSOEHandler.hpp"
#include "AMQPStringSender.hpp"
#include "dreams.hpp"
#include "utils.hpp"
#include <ctime>
#include <curl/curl.h>
#include <limits>
#include <sstream>
#include <vector>

typedef std::numeric_limits<double> dbl;

using namespace std;
using namespace opendnp3;

namespace dreams {

AMQPStringSender *ptr_amqp_sender = NULL;

void DreamsSOEHandler::Process(const HeaderInfo &info, const ICollection<Indexed<Binary>> &values) {
  return PrintAll(info, values);
}

void DreamsSOEHandler::Process(const HeaderInfo &info, const ICollection<Indexed<DoubleBitBinary>> &values) {
  return PrintAll(info, values);
}

void DreamsSOEHandler::Process(const HeaderInfo &, const ICollection<Indexed<Analog>> &values) {
  unsigned int currentTimestamp = (unsigned)time(NULL);
  char strTimestamp[16];
  sprintf(strTimestamp, "%u", currentTimestamp);

  vector<PointValue> AI;
  bool updated = false;
  AI.resize(allPoints.size());

  printf("[%s %s] analog input:", m_gatewayAddress.c_str(), m_plantName.c_str());
  auto print = [&AI, &updated](const Indexed<Analog> &pair) {
    if (pair.index < allPoints.size()) {
      AI[pair.index].value = pair.value.value;
      AI[pair.index].updated = true;
      printf(" [%d]=%g", pair.index, pair.value.value);
      updated = true;
    }
  };
  values.ForeachItem(print);
  printf(" timestamp=%u\n", currentTimestamp);

  // insert to LogRegistersMeters
  if (updated) {

    // char post_data[1024];
    stringstream post_data;
    post_data.precision(dbl::max_digits10);
    post_data << "{\"plantNo\":\"" << m_plantNo << "\",\"itemTimestamp\":" << strTimestamp;
    for (size_t i = 0; i < allPoints.size(); i++) {
      if (AI[i].updated) {
        cout << allPoints[i]->field << ' ' << fixed << AI[i].value << ' ' << allPoints[i]->ratio << ' ' << m_ctRatio << ' '
             << m_ptRatio << endl;
        auto value = AI[i].value / allPoints[i]->ratio;
        if (allPoints[i]->ctRatio) {
          value *= m_ctRatio;
        }
        if (allPoints[i]->ptRatio) {
          value *= m_ptRatio;
        }
        post_data << ",\"" << allPoints[i]->field << "\":" << value;
      }
    }
    post_data << "}";

    // *** USE AMQP
    if (ptr_amqp_sender == NULL) {
      string amqp_host = getenv_default("AMQP_HOST", "localhost");
      string amqp_port_str = getenv_default("AMQP_PORT", "5672");
      int amqp_port;
      istringstream(amqp_port_str) >> amqp_port;
      string amqp_routing_key = getenv_default("AMQP_ROUTING_KEY", "dnp3_messages");
      string amqp_username = getenv_default("AMQP_USERNAME", "guest");
      string amqp_password = getenv_default("AMQP_PASSWORD", "guest");
      ptr_amqp_sender = new AMQPStringSender(amqp_host, amqp_port, amqp_routing_key, amqp_username, amqp_password);
    }
    ptr_amqp_sender->SendString(post_data.str().c_str());
  }
}

void DreamsSOEHandler::Process(const HeaderInfo &info, const ICollection<Indexed<Counter>> &values) {
  return PrintAll(info, values);
}

void DreamsSOEHandler::Process(const HeaderInfo &info, const ICollection<Indexed<FrozenCounter>> &values) {
  return PrintAll(info, values);
}

void DreamsSOEHandler::Process(const HeaderInfo &info, const ICollection<Indexed<BinaryOutputStatus>> &values) {
  return PrintAll(info, values);
}

void DreamsSOEHandler::Process(const HeaderInfo &, const ICollection<Indexed<AnalogOutputStatus>> &) {
  // Analog output
  // return PrintAll(info, values);
}

void DreamsSOEHandler::Process(const HeaderInfo & /*info*/, const ICollection<Indexed<OctetString>> &values) {
  auto print = [](const Indexed<OctetString> &pair) {
    std::cout << "OctetString "
              << " [" << pair.index << "] : Size : " << pair.value.ToRSlice().Size() << std::endl;
  };

  values.ForeachItem(print);
}

void DreamsSOEHandler::Process(const HeaderInfo & /*info*/, const ICollection<Indexed<TimeAndInterval>> &values) {
  auto print = [](const Indexed<TimeAndInterval> &pair) {
    std::cout << "TimeAndInterval: "
              << "[" << pair.index << "] : " << pair.value.time << " : " << pair.value.interval << " : "
              << IntervalUnitsToString(pair.value.GetUnitsEnum()) << std::endl;
  };

  values.ForeachItem(print);
}

void DreamsSOEHandler::Process(const HeaderInfo & /*info*/, const ICollection<Indexed<BinaryCommandEvent>> &values) {
  auto print = [](const Indexed<BinaryCommandEvent> &pair) {
    std::cout << "BinaryCommandEvent: "
              << "[" << pair.index << "] : " << pair.value.time << " : " << pair.value.value << " : "
              << CommandStatusToString(pair.value.status) << std::endl;
  };

  values.ForeachItem(print);
}

void DreamsSOEHandler::Process(const HeaderInfo & /*info*/, const ICollection<Indexed<AnalogCommandEvent>> &values) {
  auto print = [](const Indexed<AnalogCommandEvent> &pair) {
    std::cout << "AnalogCommandEvent: "
              << "[" << pair.index << "] : " << pair.value.time << " : " << pair.value.value << " : "
              << CommandStatusToString(pair.value.status) << std::endl;
  };

  values.ForeachItem(print);
}

void DreamsSOEHandler::Process(const HeaderInfo & /*info*/, const ICollection<Indexed<SecurityStat>> &values) {
  auto print = [](const Indexed<SecurityStat> &pair) {
    std::cout << "SecurityStat: "
              << "[" << pair.index << "] : " << pair.value.time << " : " << pair.value.value.count << " : "
              << static_cast<int>(pair.value.quality) << " : " << pair.value.value.assocId << std::endl;
  };

  values.ForeachItem(print);
}

void DreamsSOEHandler::Process(const opendnp3::HeaderInfo & /*info*/,
                               const opendnp3::ICollection<opendnp3::DNPTime> &values) {
  auto print = [](const DNPTime &value) { std::cout << "DNPTime: " << value.value << std::endl; };

  values.ForeachItem(print);
}

} // namespace dreams
