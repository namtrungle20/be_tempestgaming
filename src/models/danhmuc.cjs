'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DanhMuc extends Model {
    static associate(models) {
      DanhMuc.hasMany(models.LoaiSanPham, { foreignKey: 'danhmuc_id', as: 'LoaiSanPham' });
    }
  }
  DanhMuc.init({
    danhmuc_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ten: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mota: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thutu: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    trangthai: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
  }, {
    sequelize,
    modelName: 'DanhMuc',
    tableName: 'DanhMucs',
    underscored: true,
    timestamps: false
  });
  return DanhMuc;
};