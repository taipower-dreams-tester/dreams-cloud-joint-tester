#!/bin/sh
while [ -z "$AMQP_PASSWORD" ]; do
    if [ -f "/config/mq-admin" ]; then
        export AMQP_PASSWORD=`cat /config/mq-admin`
        break
    fi
    echo "Waitinng for RabbitMQ..."
    sleep 5
done

export MYSQL_PASSWORD="$MYSQL_ROOT_PASSWORD"

exec "$@"