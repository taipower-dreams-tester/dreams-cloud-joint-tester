#!/bin/sh

CURRENT_DIR=$(dirname "$0")
cd $CURRENT_DIR

git pull
git submodule update --init --recursive

nice -n 10 docker-compose build
nice -n 10 docker-compose up -d
sleep 10s
docker-compose restart nginx
