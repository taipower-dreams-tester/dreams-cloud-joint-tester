'use strict';

const _  = require('lodash');
const { constant } = require('lodash');

let constants = {
  getOwnerKey: function() { return process.env.OWNER_KEY || 'dreams'; },
};

try {
  // eslint-disable-next-line import/no-unresolved
  const localContants = require('./constant.local.js');
  constants = _.assign(constants, localContants);
} catch (e) {} // eslint-disable-line no-empty

exports.getOwnerKey = function() { return constants.getOwnerKey(); };
exports.adminAccessToken = constants.adminAccessToken;
exports.jointerAccessToken = constants.jointerAccessToken;
