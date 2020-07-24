#!/bin/bash


wait_for_service() {
  while [ 1 -eq 1 ]; do
    (> /dev/tcp/127.0.0.1/15672) 2>/dev/null && return
    (> /dev/tcp/127.0.0.1/15671) 2>/dev/null && return
    sleep 1
  done
}

get_pass() {
  user="$1"
  while ! [ -f "/config/$user" ]; do
    sleep 1
  done
  cat "/config/$user"
}

add_user() {
  user="$1"
  pass="$2"
  echo "Adding user $user"

  # `user []`
  rabbitmqctl list_users | grep "^$user\\s" >/dev/null \
    && rabbitmqctl change_password "$user" "$pass" \
    || rabbitmqctl add_user "$user" "$pass"

  # `/       log-messages    log-messages    log-messages`
  rabbitmqctl list_user_permissions "$user" \
    | grep "^/\s$3\s$4\s$5" >/dev/null \
    || rabbitmqctl set_permissions -p / "$user" "$3" "$4" "$5"
}

generate_pwd() {
  user="$1"
  test -f /config/$user && return
  echo "Generating password for $user"
  < /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c16 > /config/$user
}

configure() {
  for user in 'mq-admin' 'mqtt'; do
    generate_pwd "$user"
  done
  wait_for_service
  echo "Changing mq-admin password"
  admin_pass=`get_pass mq-admin`
  rabbitmqctl change_password mq-admin "$admin_pass"
  rabbitmqctl set_policy ha-logs "^log\." '{"ha-mode":"exactly","ha-params":2,"ha-sync-mode":"automatic"}'
}

configure &
