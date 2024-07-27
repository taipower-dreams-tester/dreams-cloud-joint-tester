# Fake Modbus TCP Slave

## Introduction
Ppeople deal with sensors (inverter/power meter/pyranometer/...) all the time. For either testing our loggers or doing the device integration, we always need to access sensor devices. However, it's hard to access real devices most of the time. As a result, it is necessary to have a way to simulate read devices via virtual ones.

*fake_slave* is a MODBUS TCP server. It can simulate multiple devices. It supports simutaneous connections for multiple MODBUS TCP clients. Simulated devices of the server are configurable by specifying a proper config files and corresponding data at the launch time.

## Background

### What is MODBUS?
Quotation from [wikipedia](https://en.wikipedia.org/wiki/Modbus):
> "Modbus is a data communications protocol originally published by Modicon (now Schneider Electric) in 1979 for use with its programmable logic controllers (PLCs). Modbus has become ***a de facto standard communication protocol*** and is now a commonly available means ***of connecting industrial electronic devices***." -- quoted from [wikipedia](https://en.wikipedia.org/wiki/Modbus)

Quotation from [MODBUS Protocol Specification](https://modbus.org/docs/Modbus_Application_Protocol_V1_1b3.pdf)
> "MODBUS is ***an application layer messaging protocol***, positioned at level 7 of the OSI model, ***which provides client/server communication between devices*** connected on different types of buses or networks." -- quoted from [MODBUS Protocol Specification](https://modbus.org/docs/Modbus_Application_Protocol_V1_1b3.pdf) on page 2, chapter 1

In short:
- MODBUS is a very popular application protocol for communication between industrial devices.
- MODBUS supports communication over a variety of underlying medias, such as RS-232, RS-485, TCP/IP over Ethernet, etc.
- MODBUS provides a client/server communication model which uses a request/reply protocol.
- A MODBUS server can receive requests from one or more MODBUS clients, and then the sending MODBUS client will receive corresponding replys from the MODBUS server. One reply per one request.
- MODBUS reserves a system port 502 on IANA for TCP/IP over Ethernet.

References:
- [MODBUS official website](https://modbus.org/)
- [MODBUS official specifications](https://modbus.org/specs.php)
  - Core application protocol: [MODBUS Protocol Specification](https://modbus.org/docs/Modbus_Application_Protocol_V1_1b3.pdf)
  - Serial transmission (ex. RTU, ASCII, etc.): [Modbus Serial Line Protocol and Implementation Guide V1.02](https://modbus.org/docs/Modbus_over_serial_line_V1_02.pdf)
  - TCP/IP transmission: [MODBUS TCP/IP](https://modbus.org/docs/Modbus_Messaging_Implementation_Guide_V1_0b.pdf)
- [IANA registry](https://www.iana.org/assignments/service-names-port-numbers/)
  - [502: Modbus Application Protocol](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml?search=502)

## Prerequisite
Python 3, Docker Desktop

## Config & Data Formats
Files and sub-folders under the project folder:
```
(project root)
|-- config.json
|-- data
    |-- devices.json
    |-- SOME-VENDOR_SOME-MODEL_SOME-TYPE_SOME-MISC
        |-- address_mapping.json
        |-- data_source.json
    |-- OTHER_VENDOR_OTHER-MODEL_OTHER-TYPE_OTHER-MISC
        |-- address_mapping.json
        |-- data_source.json
    |-- ...
```
The file ***config.json*** and the folder ***data*** are located under the project root. Under ***data*** folder, there is one ***devices.json*** file. Under ***data*** folder, there can also be multiple sub-folders to contain data for different devices. Associated ***address_mapping.json*** and ***data_source.json*** should be properly placed within a sub-folder under ***data*** folder. The naming of that sub-folder doesn't affect any functionality of the simulated device, but the suggested naming of each sub-folder is in the form of ***{vendor}\_{model}\_{type}\_{misc}*** convention.

### config.json
***config.json*** is used to provide the server configuration, such as the hosting IP and the hosting port.
```
{
    "ip": <Hosting IP address (default: "0.0.0.0")>,
    "port": <Hosting TCP port (default: 502)>
}
```

### devices.json
***devices.json*** is used to specify data sources of different simulated devices.
```
[
    {
        "source": <sub-folder name of one data source>,
        "modbus_id": <unit identifiers> or <array of modbus unit identifiers>,
        "interval": <interval for updating next values in seconds (default: 10)>
    },
    ...
]
```

### address_mapping.json
Each MODBUS object can be referred by a properly calculated number called *unique address*. This unique value is calculated from the register type and the register address of the object. *fake_slave* also uses this concept to associate object values in data sources. However, the calculation doesn't have a proper reverse function in any form, so it is hard to map this value back to MODBUS types and addresses. ***address_mapping.json*** is used to map the so called *unique address* back to the register type and the register address as the solution.
```
{
    <unique address>: { "fx": <coil|discrete_input|holding|input>, "address": <modbus address> },
    ...
}
```

### data_source.json
The data source file is a text file. The first line of it is always the exact word `registerList` followed by one or more lines of logs. Each following line represents the data that queried from a set of registers on the sample device with almost the same (not exactly but close enough) timestamp.
```
[
  {
    "registerList":{
        "unique address 1":{"data":<binary data encoded by base64>},
        "unique address 2":{"data":<binary data encoded by base64>}, ...}
  },
  {
    "registerList":{
        "unique address 1":{"data":<binary data encoded by base64>},
        "unique address 2":{"data":<binary data encoded by base64>}, ...}
  },
  ...
]
...
```

*NOTE:* All raw data stored in data source files are in Base64 encoding. Because Base64 encoding is a bytes-to-bytes encoding mechanism, bit-wise data such as coils and discrete inputs are supported by using two bytes in the source file to represent each bit in the real register. For coils and discrete inputs, the zero byte-value (i.e. `0x0000`) means the bit-value `0`, and any non-zero byte-value (i.e. `0x0001` ~ `0xFFFF`) means the bit-value `1`.

## Run the service

### How to run fake_slave

#### docker compose
At root directory there is a docker-compoase.yaml, we had setup a fake-modbus-server service.
```bash

# Startup fake-modbus-server in foreground
docker compose up fake-modbus-server
# Or startup fake-modbus-server in background
docker compose up -d fake-modbus-server

# Restart fake-modbus-server after running
docker compose restart fake-modbus-server

# Shutdown fake-modbus-server
docker compose down fake-modbus-server
```

After *fake_slave* starts running, any MODBUS TCP clients can connect to the hosted MODBUS TCP server and perform read/write operations as needed. Since MODBUS is a device-agnostic protocol, be sure to check the corresponding vendor and model of the simulated devices before accessing the server. The server doesn't have limitation on available objects, but reading datasheets or manuals from the vendor would definitely help you to understand the meaning of each object with the corresponding register types and register addresses.

### How to connect to fake-modubs-server and get data

You can utilize the `modbus_tcp_reader.py` script to verify the connection and retrieve the data you need.

```sh
usage: modbus_tcp_reader.py [-h] [-H HOST] [-P PORT] -U UNIT -T {di,co,ir,hr} -A ADDRESS -C COUNT

options:
  -h, --help            show this help message and exit
  -H HOST, --host HOST  the host address (default: localhost).
  -P PORT, --port PORT  the port number (default: 502)
  -U UNIT, --unit UNIT  the unit identifier (range: 1..255)
  -T {di,co,ir,hr}, --table {di,co,ir,hr}
                        the primary table (choices: di,co,ir,hr)
  -A ADDRESS, --address ADDRESS
                        the address to be read (range: 0..65535)
  -C COUNT, --count COUNT
                        the count to be read (range: 1..2000 [di,co] or 1..125 [ir,hr]
```

The EMS simulator arguments are as follows:

- `-U`: The MODBUS ID is set to *7*.
- `-C`: The read length is *27*.
- `-A`: The start reading address is *21*.
- `-T`: The register operation is set to *holding*, using *hr* for the MODBUS TCP tool.

Example

```sh
python3 modbus_tcp_reader.py -A 21 -C 27 -T hr -U 7

Namespace(host='localhost', port=502, unit=7, table='hr', address=21, count=27)
modbus client: ModbusTcpClient(localhost:502)
modbus connected: True
holding registers: ['0x0', '0xe', '0x0', '0xe', '0x0', '0xf', '0x0', '0x0', '0x11', '0xf93e', '0x11', '0xeb49', '0x11', '0xf10a', '0xffff', '0xfff1', '0x0', '0x19', '0x33', '0x258', '0x1', '0x5923', '0x0', '0xcf72', '0x0', '0xbd', '0x13']
modbus response ReadRegisterResponse (27)
```
