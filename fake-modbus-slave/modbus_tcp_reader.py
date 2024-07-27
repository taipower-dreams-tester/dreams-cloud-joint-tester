#!/usr/bin/env python

import argparse
import sys

from pymodbus.client.sync import ModbusTcpClient
from pymodbus.bit_read_message import ReadDiscreteInputsResponse, ReadCoilsResponse
from pymodbus.register_read_message import ReadInputRegistersResponse, ReadHoldingRegistersResponse
from pymodbus.pdu import ExceptionResponse


class ModbusException(BaseException):
    def __init__(self, response):
        self.response = response


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('-H', '--host', type=str, default='localhost',
                        help='the host address (default: localhost).')
    parser.add_argument('-P', '--port', type=int, default=502,
                        help='the port number (default: 502)')
    parser.add_argument('-U', '--unit', type=int, required=True,
                        help='the unit identifier (range: 1..255)')
    parser.add_argument('-T', '--table', type=str, required=True,
                        choices=['di', 'co', 'ir', 'hr'],
                        help='the primary table (choices: di,co,ir,hr)')
    parser.add_argument('-A', '--address', type=int, required=True,
                        help='the address to be read (range: 0..65535)')
    parser.add_argument('-C', '--count', type=int, required=True,
                        help='the count to be read (range: 1..2000 [di,co] or 1..125 [ir,hr]')
    return parser.parse_args()


def main():
    args = parse_args()
    print(args)

    client = ModbusTcpClient(host=args.host, port=args.port)
    print('modbus client:', client)

    connected = client.connect()
    print('modbus connected:', connected)

    try:
        if (args.table == 'di'):
            response = client.read_discrete_inputs(unit=args.unit,
                                                   address=args.address,
                                                   count=args.count)
            if not isinstance(response, ReadDiscreteInputsResponse):
                raise ModbusException(response)
            print('discrete inputs:', response.bits)

        elif (args.table == 'co'):
            response = client.read_coils(unit=args.unit,
                                         address=args.address,
                                         count=args.count)
            if not isinstance(response, ReadCoilsResponse):
                raise ModbusException(response)
            print('coils:', response.bits)

        elif (args.table == 'ir'):
            response = client.read_input_registers(unit=args.unit,
                                                   address=args.address,
                                                   count=args.count)
            if not isinstance(response, ReadInputRegistersResponse):
                raise ModbusException(response)
            print('input registers:', list(map(hex, response.registers)))

        elif (args.table == 'hr'):
            response = client.read_holding_registers(unit=args.unit,
                                                     address=args.address,
                                                     count=args.count)
            if not isinstance(response, ReadHoldingRegistersResponse):
                raise ModbusException(response)
            print('holding registers:', list(map(hex, response.registers)))

        else:
            raise RuntimeError('invalid argument:', args)
        print('modbus response', response)

    except ModbusException as e:
        if isinstance(e.response, ExceptionResponse):
            print('modbus exception:', str(e.response))
        else:
            print('unknown exception:', str(e.response))
        response = None
    except Exception as e:
        print('exception:', str(e))
        response = None

    client.close()

    if (not connected) or (response is None):
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
