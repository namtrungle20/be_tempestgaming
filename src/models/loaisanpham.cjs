'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoaiSanPham extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LoaiSanPham.hasMany(models.SanPham, { foreignKey: 'loai_id' });
    }
  }
  LoaiSanPham.init({
    loai_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    image: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'LoaiSanPham',
    tableName: 'LoaiSanPhams',
    underscored: true,
  });
  return LoaiSanPham;
};