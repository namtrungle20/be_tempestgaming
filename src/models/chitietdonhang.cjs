'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChiTietDonHang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ChiTietDonHang.belongsTo(models.DonHang, { foreignKey: 'donhang_id', as: 'DonHang' });
      ChiTietDonHang.belongsTo(models.SanPham, { foreignKey: 'sanpham_id', as: 'SanPham' });//product_id
    }
  }
  ChiTietDonHang.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    donhang_id: {
      type: DataTypes.UUID, // Bắt buộc phải là UUID để khớp với DonHang
      allowNull: false
    },
    sanpham_id: { // Khóa ngoại liên kết với SanPham
      type: DataTypes.STRING(10),
      allowNull: false
    },
    soluong: DataTypes.INTEGER,
    dongia: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'ChiTietDonHang',
    tableName: 'ChiTietDonHangs',
    underscored: true,
    timestamps: false
  });
  return ChiTietDonHang;
};