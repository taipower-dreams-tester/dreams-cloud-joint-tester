import { baseApiUrl } from './apiConfig';

const serviceList = {
  getPLantLogCurrents: `${baseApiUrl}/LogCurrents`,
  getPLantLog: `${baseApiUrl}/LogRegistersMeters`,
  getGatewayId: `${baseApiUrl}/Gateways`,
  deleteGatewayId: `${baseApiUrl}/Gateways`,
  addPlant: `${baseApiUrl}/Plants`,
  sendPolling: `${baseApiUrl}/Plants/integrityPoll`,
  powerControl: `${baseApiUrl}/Plants/powerControl`,
  deadbandControl: `${baseApiUrl}/Plants/setDeadband`,
  toggleDreamsOffline: `${baseApiUrl}/Controls/controlDnp3Master`,
  getCustomToken: `${baseApiUrl}/Users/2/accessTokens`,
};

export default serviceList;
