// C Program for Message Queue (Writer Process)
#include "MesgBuffer.hpp"
#include <boost/program_options.hpp>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <iostream>
#include <string>
#include <sys/ipc.h>
#include <sys/msg.h>


namespace po = boost::program_options;
using std::cout;
using std::cerr;
using std::endl;
using std::string;
using std::vector;
dreams::MesgBuffer message;

bool getMesg(int argc, char **argv);
void printHelp(const char* command);

// structure for message queue
int main(int argc, char *argv[]) {
  key_t key;
  int msgid;

  memset(message.gateway_address, 0, SIZE_OF_GATEWAY_ADDRESS);
  try {
    if (!getMesg(argc, argv)) {
      printHelp(argv[0]);
      return 0;
    }
  } catch (const po::error &ex) {
    std::cerr << ex.what() << '\n';
    printHelp(argv[0]);
    return 1;
  }

  // ftok to generate unique key
  key = ftok("progfile", 65);

  // msgget creates a message queue
  // and returns identifier
  msgid = msgget(key, 0666 | IPC_CREAT);

  // msgsnd to send message
  msgsnd(msgid, &message, sizeof(message), 0);

  // display the message
  printf("Data send is : type=%ld gateway_address=%s index=%d value=%g dnp3_address=%d\n",
         message.mesg_type, message.gateway_address,
         message.index, message.value, message.dnp3_address);

  return 0;
}

bool getMesg(int argc, char **argv) {
  po::options_description global("Global options");
  global.add_options()
    ("help,h", "show help for this command")
    ("command", po::value<string>()->default_value("help"), "command to execute")
    ("subargs", po::value<vector<string>>(), "Arguments for command");
  po::positional_options_description pos;
  pos.add("command", 1).add("subargs", -1);

  po::variables_map vm;
  po::parsed_options parsed =
      po::command_line_parser(argc, argv).options(global).positional(pos).allow_unregistered().run();
  po::store(parsed, vm);
  string cmd = vm["command"].as<string>();

  if (vm.count("help") || cmd == "help") {
    printHelp(argv[0]);
    return false;
  } else if (cmd == "ao" || cmd == "1") {
    po::options_description ao_desc("ao options");
    ao_desc.add_options()
      ("gateway-address", po::value<string>(), "gateway IP / hostname")
      ("index", po::value<int>(), "point index")
      ("value", po::value<double>(), "point value")
      ("dnp3-address", po::value<int>()->default_value(4), "DNP3 address");
    po::positional_options_description ao_pos;
    ao_pos.add("gateway-address", 1)
          .add("index", 1)
          .add("value", 1)
          .add("dnp3-address", 1);
    std::vector<std::string> opts = po::collect_unrecognized(parsed.options, po::include_positional);
    opts.erase(opts.begin());
    po::store(po::command_line_parser(opts).options(ao_desc).positional(ao_pos).run(), vm);

    message.mesg_type = MESG_TYPE_WRITE_ANALOG_OUTPUT;
    if (!vm.count("gateway-address") || !vm.count("index") || !vm.count("value")) {
      cerr << "invalid arguments for command ao" << endl;
      return false;
    }
    strncpy(message.gateway_address, vm["gateway-address"].as<string>().c_str(), SIZE_OF_GATEWAY_ADDRESS);
    message.index = vm["index"].as<int>();
    message.value = vm["value"].as<double>();
    message.dnp3_address = vm["dnp3-address"].as<int>();
    return true;
  } else if (cmd == "poll" || cmd == "2") {
    po::options_description ao_desc("ao options");
    ao_desc.add_options()
      ("gateway-address", po::value<string>(), "gateway IP / hostname")
      ("dnp3-address", po::value<int>()->default_value(4), "DNP3 address");
    po::positional_options_description ao_pos;
    ao_pos.add("gateway-address", 1)
          .add("dnp3-address", 1);
    std::vector<std::string> opts = po::collect_unrecognized(parsed.options, po::include_positional);
    opts.erase(opts.begin());
    po::store(po::command_line_parser(opts).options(ao_desc).positional(ao_pos).run(), vm);

    message.mesg_type = MESG_TYPE_INTEGRITY_POLL;
    if (!vm.count("gateway-address")) {
      cerr << "invalid arguments for command poll" << endl;
      return false;
    }
    strncpy(message.gateway_address, vm["gateway-address"].as<string>().c_str(), SIZE_OF_GATEWAY_ADDRESS);
    message.index = 0;
    message.value = 0;
    message.dnp3_address = vm["dnp3-address"].as<int>();
    return true;
  } else if (cmd == "quit" || cmd == "99") {
    message.mesg_type = MESG_TYPE_QUIT_PROGRAM;
    strncpy(message.gateway_address, "", SIZE_OF_GATEWAY_ADDRESS);
    message.index = 0;
    message.value = 0;
    message.dnp3_address = 0;
    return true;
  }

  printHelp(argv[0]);
  return false;
}

void printHelp(const char* command) {
  cout << "Usage: " << command << " <COMMAND> [options]" << endl;
  cout << endl;
  cout << "Commands:" << endl;
  cout << "  ao | 1 <gateway address> <point index> <point value> [<DNP3 address>]" << endl;
  cout << "  poll | 2 <gateway address> [<DNP3 address>]" << endl;
  cout << "  quit | 99" << endl;
}
