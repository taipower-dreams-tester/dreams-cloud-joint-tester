#include "AMQPStringSender.hpp"
#include <iostream>

using std::cerr;
using std::endl;

AMQPStringSender::AMQPStringSender(const string &hostname, int port, const string &routingkey, const string &username,
                                   const string &password)
    : hostname(hostname), port(port), routingkey(routingkey), username(username), password(password) {
  int status;
  this->conn = amqp_new_connection();
  this->socket = amqp_tcp_socket_new(conn);
  status = amqp_socket_open(socket, hostname.c_str(), port);
  if (status != AMQP_STATUS_OK) {
    cerr << "amqp_socket_open failed: " << status << endl;
    exit(1);
  }
  amqp_login(conn, "/", 0, 131072, 0, AMQP_SASL_METHOD_PLAIN, username.c_str(), password.c_str());
  amqp_channel_open(conn, 1);

  this->props._flags = AMQP_BASIC_CONTENT_TYPE_FLAG | AMQP_BASIC_DELIVERY_MODE_FLAG;
  this->props.content_type = amqp_cstring_bytes("applicaton/json");
  this->props.delivery_mode = 2; /* persistent delivery mode */
}

AMQPStringSender::~AMQPStringSender() {
  amqp_channel_close(conn, 1, AMQP_REPLY_SUCCESS);
  amqp_connection_close(conn, AMQP_REPLY_SUCCESS);
  amqp_destroy_connection(conn);
}

int AMQPStringSender::SendString(const string &messagebody) {
  amqp_basic_publish(this->conn, 1, amqp_cstring_bytes("amq.topic"), amqp_cstring_bytes(this->routingkey.c_str()), 0, 0,
                     &this->props, amqp_cstring_bytes(messagebody.c_str()));
  return 0;
}
