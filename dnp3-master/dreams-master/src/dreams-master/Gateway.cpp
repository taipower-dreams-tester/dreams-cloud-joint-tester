#include "Gateway.hpp"
#include "DreamsSOEHandler.hpp"

#include <asiodnp3/DefaultMasterApplication.h>
#include <asiopal/IPEndpoint.h>
#include <opendnp3/LogLevels.h>
#include <opendnp3/app/ClassField.h>
#include <openpal/executor/TimeDuration.h>

using asiodnp3::DefaultMasterApplication;
using asiopal::ChannelRetry;
using asiopal::IPEndpoint;
using opendnp3::ClassField;
using opendnp3::FunctionCode;
using opendnp3::Header;
using opendnp3::levels::NOTHING;
using openpal::TimeDuration;

namespace dreams {

Gateway::Gateway(DNP3Manager *manager, const string address, const uint16_t port) : address(address), port(port) {
  channel = manager->AddTCPClient("tcpclient", NOTHING, ChannelRetry::Default(), {IPEndpoint(address.c_str(), port)}, "0.0.0.0",
                        nullptr);
}

void Gateway::AddMaster(uint16_t remoteAddr, string plantNo, string plantName, double ctRatio,
                        double ptRatio, std::shared_ptr<DreamsPoints> dreamsPoints) {
  MasterStackConfig stackConfig;
  stackConfig.master.responseTimeout = TimeDuration::Seconds(2);
  stackConfig.master.disableUnsolOnStartup = true;
  stackConfig.link.LocalAddr = MASTER_LOCAL_ADDR;
  stackConfig.link.RemoteAddr = remoteAddr;
  auto master = channel->AddMaster(address,                  // id for logging
                                   DreamsSOEHandler::Create( // callback for data processing
                                       address, plantNo, plantName, ctRatio, ptRatio, dreamsPoints),
                                   DefaultMasterApplication::Create(), // master application instance
                                   stackConfig                         // stack configuration
  );

  master->Enable();
  master->ScanClasses(ClassField::AllClasses());
  master->PerformFunction("write", FunctionCode::WRITE, {Header::AllObjects(80, 1)});
  Plant plant(master, plantNo, plantName, remoteAddr);
  plants.insert(map<uint32_t, Plant>::value_type(remoteAddr, plant));
}

} // namespace dreams
