import asyncio
import aio_pika
from os import environ
from functools import partial
import json
import mysql.connector
import time

queue_name = "dnp3_messages"
routing_key = 'dnp3_messages'

TABLE1 = 'LogRegistersMeter'
FIELDS1 = [
    'currentPhaseA',
    'currentPhaseB',
    'currentPhaseC',
    'currentPhaseN',
    'voltagePhaseA',
    'voltagePhaseB',
    'voltagePhaseC',
    'P_SUM',
    'Q_SUM',
    'PF_AVG',
    'frequency',
    'total_kWh',
    'irradiance',
    'wind_speed',
    'PF_setting',
    'P_setting',
    'Q_setting',
    'vpset_setting',
    'control_result_01_25',
    'control_result_26_50',
    'currentPhaseA_deadband',
    'currentPhaseB_deadband',
    'currentPhaseC_deadband',
    'currentPhaseN_deadband',
    'voltagePhaseA_deadband',
    'voltagePhaseB_deadband',
    'voltagePhaseC_deadband',
    'P_SUM_deadband',
    'Q_SUM_deadband',
    'PF_AVG_deadband',
    'frequency_deadband',
    'itemTimestamp',
    'atTimestamp',
    'plantNo',
    'total_kWh_discharging',
    'total_kWh_charging',
    'status',
    'SOC',
    'battery_cycle_count',
]
sql = 'INSERT INTO `{}` ({}) VALUES ({})'.format(
    TABLE1,
    ','.join(map(lambda x: '`{}`'.format(x), FIELDS1)),
    ','.join((['%s'] * len(FIELDS1)))
)

TABLE2 = 'LogCurrent'
COALESCE_FIELDS2 = [
    'currentPhaseA',
    'currentPhaseB',
    'currentPhaseC',
    'currentPhaseN',
    'voltagePhaseA',
    'voltagePhaseB',
    'voltagePhaseC',
    'P_SUM',
    'Q_SUM',
    'PF_AVG',
    'frequency',
    'total_kWh',
    'irradiance',
    'wind_speed',
    'PF_setting',
    'P_setting',
    'Q_setting',
    'vpset_setting',
    'control_result_01_25',
    'control_result_26_50',
    'currentPhaseA_deadband',
    'currentPhaseB_deadband',
    'currentPhaseC_deadband',
    'currentPhaseN_deadband',
    'voltagePhaseA_deadband',
    'voltagePhaseB_deadband',
    'voltagePhaseC_deadband',
    'P_SUM_deadband',
    'Q_SUM_deadband',
    'PF_AVG_deadband',
    'frequency_deadband',
    'total_kWh_discharging',
    'total_kWh_charging',
    'status',
    'SOC',
    'battery_cycle_count',
]
NORMAL_FIELDS2 = [
    'itemTimestamp',
    'atTimestamp',
]
_sql2 = '''
INSERT INTO `{}` ({})
VALUES ({})
ON DUPLICATE KEY UPDATE {};'''

REGULAR_FIELDS_GRID = [
    "currentPhaseA",
    "currentPhaseB",
    "currentPhaseC",
    "currentPhaseN",
    "voltagePhaseA",
    "voltagePhaseB",
    "voltagePhaseC",
    "P_SUM",
    "Q_SUM",
    "PF_AVG",
    "frequency",
    "total_kWh",
    "PF_setting",
    "P_setting",
    "Q_setting",
    "vpset_setting",
    "control_result_01_25",
    "control_result_26_50",
    "currentPhaseA_deadband",
    "currentPhaseB_deadband",
    "currentPhaseC_deadband",
    "currentPhaseN_deadband",
    "voltagePhaseA_deadband",
    "voltagePhaseB_deadband",
    "voltagePhaseC_deadband",
    "P_SUM_deadband",
    "Q_SUM_deadband",
    "PF_AVG_deadband",
    "frequency_deadband",
]


REGULAR_FIELDS_ENERGY_STORAGE = [
    "currentPhaseA",
    "currentPhaseB",
    "currentPhaseC",
    "currentPhaseN",
    "voltagePhaseA",
    "voltagePhaseB",
    "voltagePhaseC",
    "P_SUM",
    "Q_SUM",
    "PF_AVG",
    "frequency",
    "total_kWh_discharging",
    "total_kWh_charging",
    "status",
    "SOC",
    "battery_cycle_count",
    "currentPhaseA_deadband",
    "currentPhaseB_deadband",
    "currentPhaseC_deadband",
    "currentPhaseN_deadband",
    "voltagePhaseA_deadband",
    "voltagePhaseB_deadband",
    "voltagePhaseC_deadband",
    "P_SUM_deadband",
    "Q_SUM_deadband",
    "PF_AVG_deadband",
    "frequency_deadband",
]


def get_regular_fields_by_plant_category(plant_category):
    return REGULAR_FIELDS_GRID if plant_category == 'grid' else REGULAR_FIELDS_ENERGY_STORAGE


def build_delete_deadband_sql(plant_category):
    fields = get_regular_fields_by_plant_category(plant_category)
    # consider records to be deadband if any of the above fields are missing
    return "DELETE FROM `{}` WHERE plantNo=%s and ({})".format(
        TABLE1,
        " OR ".join(map(lambda x: "{} is null".format(x), fields)),
    )


def sql2(values):
    def format_str(value):
        return '"{}"'.format(value) if isinstance(value, str) else '{}'.format(value)

    return _sql2.format(
        TABLE2,
        ','.join(map(lambda x: x[0], values)),
        ','.join(map(lambda x: format_str(x[1]), values)),
        ','.join(map(lambda x: '{} = {}'.format(x[0], format_str(x[1])), values)),
    )


def get_value(log, field):
    default = time.time() if field == 'atTimestamp' else None
    return log.get(field, default)


def get_log_value(log):
    get = partial(get_value, log)
    return tuple(map(get, FIELDS1))


def is_deadband(log, plant_category):
    fields = get_regular_fields_by_plant_category(plant_category)
    for field in fields:
        if field not in log:
            return True
    return False


def get_log_value2(log):
    get = partial(get_value, log)
    fields = COALESCE_FIELDS2 + NORMAL_FIELDS2 + ['plantNo']
    return list(filter(
        lambda entry: entry[1] is not None,
        map(lambda field: (field, get(field)), fields)))


def get_plant_category(cursor, plant_no):
    cursor.execute('SELECT plantCategory FROM Plant WHERE plantNo=%s', (plant_no,))
    return cursor.fetchone()[0].decode()


async def main(loop):
    amqp_url = 'amqp://{}:{}@{}/'.format(
        environ.get('AMQP_USERNAME', 'guest'),
        environ.get('AMQP_PASSWORD', 'guest'),
        environ.get('AMQP_HOST', 'localhost'),
    )
    connection = await aio_pika.connect_robust(
        amqp_url, loop=loop
    )

    mysql_params = {
        'host': environ.get('MYSQL_HOST', 'localhost'),
        'user': 'root',
        'passwd': environ.get('MYSQL_ROOT_PASSWORD', 'pass'),
        'database': environ.get('MYSQL_DB', 'dreams_business'),
    }
    mydb = mysql.connector.connect(**mysql_params)

    mycursor = mydb.cursor()

    async with connection:
        # Creating channel
        channel = await connection.channel()    # type: aio_pika.Channel

        # Declaring queue
        queue = await channel.declare_queue(
            queue_name,
        )   # type: aio_pika.Queue
        await queue.bind('amq.topic', routing_key=routing_key)

        async with queue.iterator() as queue_iter:
            # Cancel consuming after __aexit__
            async for message in queue_iter:
                async with message.process():
                    log = json.loads(message.body)
                    if 'plantNo' in log and 'itemTimestamp' in log:
                        # Insert LogCurrent
                        cmd = sql2(get_log_value2(log))
                        mycursor.execute(cmd)

                        plant_category = get_plant_category(mycursor, log['plantNo'])
                        # Remove old deadband logs, as we won't need it anymore
                        if is_deadband(log, plant_category):
                            mycursor.execute(build_delete_deadband_sql(plant_category), (log['plantNo'],))

                        # Insert LogRegistersMeter
                        mycursor.execute(sql, get_log_value(log))

                        mydb.commit()

                    if queue.name in message.body.decode():
                        pass


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main(loop))
    loop.close()
