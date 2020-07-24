#ifndef DREAMS_PLANT_HPP
#define DREAMS_PLANT_HPP
#include <asiodnp3/DNP3Manager.h>
#include <string>

using asiodnp3::IMaster;
using asiodnp3::MasterStackConfig;
using std::shared_ptr;
using std::string;

namespace dreams {

class Plant {
public:
  Plant(shared_ptr<IMaster> master, const string plantNo, const string plantName, const uint16_t remoteAddr)
      : master(master), plantNo(plantNo), plantName(plantName), remoteAddr(remoteAddr) {}

  shared_ptr<IMaster> master;
  const string plantNo;
  const string plantName;
  const uint16_t remoteAddr;

protected:
  MasterStackConfig stackConfig;
};

} // namespace dreams

#endif // DREAMS_PLANT_HPP
