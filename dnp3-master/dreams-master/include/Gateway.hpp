#ifndef DREAMS_GATEWAY_HPP
#define DREAMS_GATEWAY_HPP
#include "Plant.hpp"
#include <asiodnp3/DNP3Manager.h>
#include <map>
#include <string>
#include "dreams.hpp"

#define MASTER_LOCAL_ADDR 3

using asiodnp3::DNP3Manager;
using asiodnp3::IChannel;
using std::map;
using std::shared_ptr;
using std::string;

class Plant;

namespace dreams {

class Gateway {
public:
  Gateway(DNP3Manager *manager, const string address, const uint16_t port);
  void AddMaster(uint16_t remoteAddr, string plantNo, string plantName, double ctRatio,
                 double ptRatio, shared_ptr<DreamsPoints> dreamsPoints);

  const string address;
  const uint16_t port;
  map<uint32_t, Plant> plants;

protected:
  shared_ptr<IChannel> channel;
};

} // namespace dreams

#endif // DREAMS_GATEWAY_HPP
