const fs = require('fs');

const apiConfig =
  `export const baseApiUrl = 'https://${process.env.API_HOST}:${process.env.API_PORT}/api';\n` +
  `export const accessToken = '${process.env.ADMIN_ACCESS_TOKEN}';\n\n` +
  'export default baseApiUrl;';

fs.writeFileSync('/cloud-joint-tester-web/src/configs/apiConfig.js', apiConfig);