#ifndef DREAMS_MSG_BUFFER_HPP
#define DREAMS_MSG_BUFFER_HPP
#include <cstdint>

#define MESG_TYPE_WRITE_ANALOG_OUTPUT 1
#define MESG_TYPE_INTEGRITY_POLL 2
#define MESG_TYPE_QUIT_PROGRAM 99

#define SIZE_OF_GATEWAY_ADDRESS 64

namespace dreams {
typedef struct MesgBuffer {
  long mesg_type;
  char gateway_address[SIZE_OF_GATEWAY_ADDRESS];
  uint16_t index;
  double value;
  uint16_t dnp3_address;
} MesgBuffer;
} // namespace dreams

#endif // DREAMS_MSG_BUFFER_HPP
