#ifndef ASIODNP3_AMQPSTRINGSENDER_H
#define ASIODNP3_AMQPSTRINGSENDER_H

#include <amqp.h>
#include <amqp_tcp_socket.h>
#include <string>

using std::string;

class AMQPStringSender {
  const string hostname;
  const int port;
  const string routingkey;
  const string username;
  const string password;
  amqp_socket_t *socket;
  amqp_connection_state_t conn;
  amqp_basic_properties_t props;

public:
  AMQPStringSender(const string &hostname, int port, const string &routingkey, const string &username = "guest",
                   const string &password = "guest");
  int SendString(const string &messagebody);
  ~AMQPStringSender();
};

#endif
