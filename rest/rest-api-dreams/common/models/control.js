'use strict';
var docker = require('../utils/docker');

module.exports = function(Control) {
  Control.remoteMethod('controlDnp3Master', {
    http: {path: '/controlDnp3Master', verb: 'post'},
    accepts: [
      {arg: 'operation', type: 'string', required: true, description: 'start | stop | restart'},
    ],
    returns: {arg: 'data', type: 'object'},
  });

  Control.controlDnp3Master = async function(operation) {
    const dnp3Master = await docker.getService('dnp3-master');
    if (operation === 'start') {
      await dnp3Master.start();
      return { output: 'success' };
    } else if (operation === 'stop') {
      await dnp3Master.stop();
      return { output: 'success' };
    } else if (operation === 'restart') {
      await dnp3Master.restart();
      return { output: 'success' };
    }
  }
};
