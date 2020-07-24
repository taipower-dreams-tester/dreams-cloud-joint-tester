const fs = require('fs');

if (!process.env.MYSQL_ADDRESS) {
  console.log('MYSQL_ADDRESS is not set');
  process.exit(0);
}
if (fs.existsSync('/rest-api-dreams/server/datasources.local.json')) {
  console.log('datasources.local.json already exists');
  process.exit(0);
}

const base = JSON.parse(fs.readFileSync('/rest-api-dreams/server/datasources.json'))
for (k in base) {
  if (base[k].connector === 'mysql') {
    base[k].host = process.env.MYSQL_ADDRESS;
    if (process.env.MYSQL_ROOT_PASSWORD) {
      base[k].password = process.env.MYSQL_ROOT_PASSWORD;
    }
  }
}

fs.writeFileSync('/rest-api-dreams/server/datasources.local.json', JSON.stringify(base, null, 2));

const localConstants =
  '\'use strict\';\n\n' +
  `exports.adminAccessToken = \'${process.env.ADMIN_ACCESS_TOKEN || 'top_secret'}\';\n` +
  `exports.jointerAccessToken = \'${process.env.JOINTER_ACCESS_TOKEN || 'site_token_for_cloud_jointer'}\';\n`;

fs.writeFileSync('/rest-api-dreams/server/constant.local.js', localConstants);