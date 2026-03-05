'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ThuongHieu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ThuongHieu.hasMany(models.SanPham, { foreignKey: 'thuonghieu_id' });
    }
  }
  ThuongHieu.init({
    thuonghieu_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    image: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ThuongHieu',
    tableName: 'ThuongHieus',
    underscored: true,
  });
  return ThuongHieu;
};