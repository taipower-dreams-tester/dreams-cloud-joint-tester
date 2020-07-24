#!/bin/sh
node /start.js || exit 1
npm run start-nossl
