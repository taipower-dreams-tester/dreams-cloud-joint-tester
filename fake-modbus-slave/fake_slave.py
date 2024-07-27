#!/usr/bin/env python
"""
Fake modbus slave
--------------------------------------------------------------------------
"""
import argparse
import base64
import json
import signal
import struct

from os import path
from threading import Thread
from time import sleep

# --------------------------------------------------------------------------- #
# import the various server implementations
# --------------------------------------------------------------------------- #
from pymodbus.server.asynchronous import StartTcpServer, StopServer
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.datastore import ModbusSparseDataBlock
from pymodbus.datastore import ModbusSlaveContext, ModbusServerContext

# --------------------------------------------------------------------------- #
# configure the service logging
# --------------------------------------------------------------------------- #
import logging


LOGGER_LEVEL = {
    'critical': logging.CRITICAL,
    'error': logging.ERROR,
    'warning': logging.WARNING,
    'info': logging.INFO,
    'debug': logging.DEBUG,
    'notset': logging.NOTSET,
}
FORMAT = ('%(asctime)-15s %(threadName)-15s'
          ' %(levelname)-8s %(module)-15s:%(lineno)-8s %(message)s')
logging.basicConfig(format=FORMAT)
log = logging.getLogger()
log.setLevel(logging.DEBUG)


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config-path',
                        default=path.join(path.dirname(__file__), 'config.json'),
                        help='the config path (default: "config.json").')
    parser.add_argument('--data-path',
                        default=path.join(path.dirname(__file__), 'data'),
                        help='the data folder path (default: "data")')
    parser.add_argument('--logger-level', default='debug',
                        help='the logger level (default: "debug")')

    return parser.parse_args()


FX_MAP = {
    "coil": 1,
    "coil_write": 15,  # single: 5, multiple: 15
    "discrete_input": 2,
    "holding": 3,
    "holding_write": 16,  # single: 6, multiple: 16
    "input": 4,
}

terminate_triggered = False


def _exit_gracefully(signum, fram):
    print('Terminate!')
    global terminate_triggered
    StopServer()
    terminate_triggered = True


def _sleep(count):
    global terminate_triggered
    while (not terminate_triggered) and count > 0:
        count -= 1
        sleep(1)


def convert_to_pymodbus_data_block(address_mapping, unique_address, value):
    register_type = address_mapping.get(unique_address, {}).get('fx', 'unknown_type')
    function_code = FX_MAP.get(register_type, 0)
    register_address = address_mapping.get(unique_address, {}).get('address', -1)
    raw_data = base64.decodebytes(value.get('data', '').encode('ascii'))
    print(raw_data)
    if register_type in FX_MAP:
        registers = struct.unpack('>' + 'H' * int(len(raw_data) / 2), raw_data)
    else:
        registers = []
    return function_code, register_address, list(registers)


def updating_writer(slaves, device_source_path, interval):
    global terminate_triggered

    with open(path.join(device_source_path, 'address_mapping.json')) as f:
        # mapping from thingnario unique addresses back to register types and register addresses
        # example:
        # {
        #   "10000": { "fx": "coil", "address": 0 },
        #   "20000": { "fx": "discrete_input", "address": 0 },
        #   "30001": { "fx": "input", "address": 0 },
        #   "40001": { "fx": "holding", "address": 0 }
        # }
        address_mapping = json.load(f)

    while not terminate_triggered:
        with open(path.join(device_source_path, 'data_source.json')) as f:
            logs = json.load(f)
            for log in logs:
                if terminate_triggered:
                    break

                # example:
                # {"10000":{"data":"AA=="},"20000":{"data":"/w=="},"30001":{"data":"AAA="},"40001":{"data":"//8="}}
                for unique_address, value in log['registerList'].items():
                    function_code, register_address, registers = convert_to_pymodbus_data_block(
                        address_mapping, unique_address, value)
                    for slave in slaves:
                        slave.setValues(function_code, register_address, registers)
                _sleep(interval)
            f.seek(0)


def run_server():
    signal.signal(signal.SIGINT, _exit_gracefully)
    signal.signal(signal.SIGTERM, _exit_gracefully)
    args = parse_args()

    log.setLevel(LOGGER_LEVEL.get(args.logger_level.lower()))

    with open(args.config_path) as f:
        config = json.load(f)

    with open(path.join(args.data_path, 'devices.json')) as f:
        devices = json.load(f)

    id_to_slave_mapping = {}
    threads = []
    for device in devices:
        slaves = []
        device_source_path = path.join(args.data_path, device['source'])
        ids = device['modbus_id']
        ids = [ids] if isinstance(ids, int) else ids
        for id in ids:
            slave = ModbusSlaveContext(
                di=ModbusSparseDataBlock({0: 0}),
                co=ModbusSparseDataBlock({0: 0}),
                hr=ModbusSparseDataBlock({0: 0}),
                ir=ModbusSparseDataBlock({0: 0}),
            )
            id_to_slave_mapping[id] = slave
            slaves.append(slave)
        threads.append(Thread(target=updating_writer,
                              args=(slaves, device_source_path, device.get('interval', 10))))

    context = ModbusServerContext(slaves=id_to_slave_mapping, single=False)

    # ----------------------------------------------------------------------- #
    # initialize the server information
    # ----------------------------------------------------------------------- #
    # If you don't set this or any fields, they are defaulted to empty strings.
    # ----------------------------------------------------------------------- #
    identity = ModbusDeviceIdentification()
    identity.VendorName = ''
    identity.ProductCode = ''
    identity.VendorUrl = ''
    identity.ProductName = 'Fake Modbus Server'
    identity.ModelName = 'Fake Modbus Server'
    identity.MajorMinorRevision = '0.1.0'

    # ----------------------------------------------------------------------- #
    # run the server you want
    # ----------------------------------------------------------------------- #
    # Tcp:
    for thread in threads:
        thread.start()
    address = (config.get('ip', "0.0.0.0"), config.get('port', 502))
    StartTcpServer(context, identity=identity, address=address)
    global terminate_triggered
    while not terminate_triggered:
        sleep(1)


if __name__ == "__main__":
    run_server()
