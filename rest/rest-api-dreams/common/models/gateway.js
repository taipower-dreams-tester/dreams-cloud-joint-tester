'use strict';
var _ = require('lodash');
const debug = require('debug')('application:gateway');

module.exports = function(Gateway) {
  Gateway.remoteMethod('getDnp3Addresses', {
    http: {path: '/getDnp3Addresses/:siteToken', verb: 'get'},
    accepts: [
      { arg: 'siteToken', type: 'string', required: true, description: 'Site token' },
    ],
    returns: { arg: 'data', type: 'object', root: true },
  });

  Gateway.getDnp3Addresses = async function(siteToken) {
    const gateway = await Gateway.findOne({'where': {'siteToken': siteToken}, 'include': ['plant']});
    if (gateway === null) {
      throw {status: 401, message: 'Unauthorized'};
    }
    return gateway.plant().map(({plantName, plantNo, dnp3Address}) => {
      return {plantName, plantNo, dnp3Address};
    });
  };

  Gateway.observe('before delete', async (ctx) => {
    debug('Deleted %s matching %j', ctx.Model.pluralModelName, ctx.where);
    const gatewayId = ctx.where ? ctx.where.id : null;
    if (!gatewayId) {
      return;
    }
    const models = Gateway.app.models;

    const plants = await models.Plant.find({where: {gatewayId}});
    _.forEach(plants, ({id, plantNo}) => {
      models.Plant.destroyById(id);
      models.LogCurrent.destroyAll({plantNo});
      models.LogRegistersMeter.destroyAll({plantNo});
    });
  });
};