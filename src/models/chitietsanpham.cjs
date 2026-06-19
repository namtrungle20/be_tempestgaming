'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChiTietSanPham extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ChiTietSanPham.belongsTo(models.SanPham, {
        foreignKey: 'sanpham_id',
        as: 'SanPham',
      });
    }
  }
  ChiTietSanPham.init({
    sanpham_id: DataTypes.STRING,
    name: DataTypes.STRING,
    gia_tri: DataTypes.STRING
  }, {
    sequelize,
    tableName: 'ChiTietSanPhams',
    modelName: 'ChiTietSanPham',
    underscored: true,
    timestamps: false
  });
  return ChiTietSanPham;
};