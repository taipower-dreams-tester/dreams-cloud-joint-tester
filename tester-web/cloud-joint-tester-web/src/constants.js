const PlantCategoryType = {
  grid: 'grid',
  energyStorage: 'energyStorage',
};

const PlantCategories = [
  {
    key: PlantCategoryType.grid,
    name: '再生能源',
  },
  {
    key: PlantCategoryType.energyStorage,
    name: '儲能',
  },
];

export default {
  PlantCategoryType,
  PlantCategories,
};
