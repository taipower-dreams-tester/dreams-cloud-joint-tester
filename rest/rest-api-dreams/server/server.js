'use strict';

const debug = require('debug')('application:server');
var loopback = require('loopback');
var boot = require('loopback-boot');

var http = require('http');
var https = require('https');


var app = module.exports = loopback();

// use loopback.token middleware on all routes
// setup gear for authentication using cookie (access_token)
// Note: requires cookie-parser (defined in middleware.json)
app.use(loopback.token({
  model: app.models.accessToken,
  currentUserLiteral: 'me',
  searchDefaultTokenKeys: false,
  cookies: ['access_token'],
  headers: ['access_token', 'X-Access-Token'],
  params: ['access_token'],
}));

app.start = function(httpsOnly) {
  if (httpsOnly === undefined) {
    httpsOnly = Number.parseInt(process.env.HTTPS);
  }
  var server = null;
  if (httpsOnly) {
    var sslConfig = require('./ssl-config');
    var options = {
      key: sslConfig.privateKey,
      cert: sslConfig.certificate,
    };
    server = https.createServer(options, app);
  } else {
    server = http.createServer(app);
  }
  server.listen(app.get('port'), function() {
    var baseUrl = (httpsOnly ? 'https://' : 'http://') + app.get('host') + ':' + app.get('port');
    app.emit('started', baseUrl);
    debug('LoopBack server listening @ %s%s', baseUrl, '/');
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      debug('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
  return server;
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.start();
  }
});
