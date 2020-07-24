'use strict';
const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('application:create-sample-models');
const getOwnerKey = require('../constant').getOwnerKey;
const adminAccessToken = require('../constant').adminAccessToken;
const jointerAccessToken = require('../constant').jointerAccessToken;

function getNewFieldsMigrator(model, fieldInfos) {
  return function(err) {
    if (err) throw err;

    model.find({}, function(err, entries) {
      if (err) throw err;

      _.forEach(entries, (entry) => {
        _.forEach(fieldInfos, (info) => {
          const { name, getDefault } = info;
          if (!entry[name]) {
            entry.updateAttribute(name, getDefault(entry));
          }
        });
      });
    });
  };
}

async function mysqlBusinessMigrate(app) {
  const _ = await app.dataSources.mysqlBusiness.autoupdate([
    'AccessToken',
    'RoleMapping',
    'Role',
    'User',
    'LogRegistersMeter',
    'LogCurrent',
    'Plant',
    'Gateway',
  ]);

  app.dataSources.mysqlBusiness.autoupdate('Plant', getNewFieldsMigrator(
    app.models.Plant,
    [{ name: 'type', getDefault: () => 'pv' }]
  ));

  // Move foreign key from Gateway to Plant
  const gateways = await app.models.Gateway.find({});
  gateways.forEach(async gateway => {
    if(gateway.plantId === null) {
      return;
    }
    const plant = app.models.Plant.findById(gateway.plantId);
    if (!plant.gatewayId) {
      plant.updateAttribute('gatewayId', gateway.id);
    }
  });

  app.dataSources.mysqlBusiness.autoupdate('Gateway', getNewFieldsMigrator(
    app.models.Gateway,
    [
      { name: 'dnp3Port', getDefault: () => 20000 },
      { name: 'powerMeterCTRatio', getDefault: () => 1 },
      { name: 'powerMeterPTRatio', getDefault: () => 1 }
    ]
  ));

  const roles = await app.models.Role.find({});
  if (roles.length === 0) {
    try {
      const roles = await app.models.Role.create([
        { id: 1, name: 'admin', description: 'Administrator' },
        { id: 2, name: 'guest', description: 'Guest' }]);
      debug('Roles created: \n', roles);

      const users = await app.models.User.find({});
      if (users.length === 0) {
        const adminInst = await app.models.User.create(
          { username: 'machineadmin', email: `machineadmin@${getOwnerKey()}.taipower.com.tw`, password: 'dreamscometrue',
            fullName: 'machineadmin', role: 'admin', id: 1 });
        debug('Admin User created: \n', adminInst);
        const adminRoleMapping = await app.models.RoleMapping.create({principalType: 'USER', principalId: adminInst.id, roleId: 1});
        debug('Admin Role Mapping created: \n', adminRoleMapping);
        const adminTokenInst = await app.models.AccessToken.create({id: adminAccessToken, ttl: 31556926, userId: adminInst.id});
        debug('Admin Access Token created: \n', adminTokenInst);

        const jointerInst = await app.models.User.create(
          { username: 'cloudjointer', email: `cloudjointer@some.cloud.provider.com.tw`, password: 'iwanttoconnect',
            fullName: 'cloud jointer', role: 'guest', id: 2 });
        debug('Jointer User created: \n', jointerInst);
        const jointerRoleMapping = await app.models.RoleMapping.create({principalType: 'USER', principalId: jointerInst.id, roleId: 2});
        debug('Jointer Role Mapping created: \n', jointerRoleMapping);
        const jointerTokenInst = await app.models.AccessToken.create({id: jointerAccessToken, ttl: 31556926, userId: jointerInst.id});
        debug('Jointer Access Token created: \n', jointerTokenInst);
      }
    } catch (e) {
      debug(e);
    }
  }
}

module.exports = function(app) {
  const dsMysqlPV = app.dataSources.mysqlBusiness;

  debug('dsMysqlPV.connected: ', dsMysqlPV.connected);

  if (dsMysqlPV.connected) {
    mysqlBusinessMigrate(app);
  } else {
    dsMysqlPV.once('connected', function() {
      debug('***dsMysqlPV.connected: ', dsMysqlPV.connected);
      mysqlBusinessMigrate(app);
    });
  }
};
