'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChiTietGioHang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ChiTietGioHang.belongsTo(models.GioHang, {
        foreignKey: 'giohang_id',
        as: 'GioHang'
      });
      ChiTietGioHang.belongsTo(models.SanPham, {
        foreignKey: 'sanpham_id',
        as: 'SanPham'
      });
    }
  }
  ChiTietGioHang.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    giohang_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sanpham_id: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    dongia: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    soluong: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'ChiTietGioHang',
    tableName: 'ChiTietGioHangs',
    underscored: true,
    timestamps: false
  });
  return ChiTietGioHang;
};