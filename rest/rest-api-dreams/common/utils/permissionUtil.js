'use strict';
var _ = require('lodash');

async function setDefaultMenuPermission(models, userId, role) {
  const menus = await models.ThingMenu.find({});
  const disabledMenuItems = _.filter(menus, menu => _.includes(menu.defaultRoleDisabled, role));

  const menuIdsDisabledMenuItems = _.map(disabledMenuItems, dmi => dmi.id);
  const instances = _.map(menuIdsDisabledMenuItems, menuId => ({
    userId,
    menuId,
    permission: false,
  }));
  
  await models.MenuPermission.destroyAll({ userId });

  return models.MenuPermission.create(instances);
}

module.exports = {
  setDefaultMenuPermission,
};
