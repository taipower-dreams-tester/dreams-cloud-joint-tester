'use strict';
const moment = require('moment');

module.exports = function(LogRegistersMeter) {
  LogRegistersMeter.beforeRemote('create', function(ctx, modelInstance, next) {
    const currentTimestamp = moment().unix();
    ctx.req.body.atTimestamp = currentTimestamp;
    if (!ctx.req.body.itemTimestamp) {
      ctx.req.body.itemTimestamp = currentTimestamp;
    }
    next();
  });

  LogRegistersMeter.afterRemote('create', function(ctx, modelInstance, next) {
    const app = LogRegistersMeter.app;
    const log = ctx.req.body;
    const { plantNo, deviceNo } = log;
    app.models.LogCurrent.upsertWithWhere({ plantNo, deviceNo }, log, (err) => {
      if (err) { next(); return false; }
      next();
    });
  });
};
