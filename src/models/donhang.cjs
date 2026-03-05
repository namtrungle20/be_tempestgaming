'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DonHang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DonHang.belongsTo(models.NguoiDung, { foreignKey: 'nguoidung_id' });
      DonHang.hasMany(models.ChiTietDonHang, { foreignKey: 'donhang_id' });
      DonHang.hasOne(models.ThanhToan, { foreignKey: 'donhang_id' });
    }
  }
  DonHang.init({
    donhang_id: { // Định nghĩa khóa chính
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nguoidung_id: {
      type: DataTypes.UUID,           // PHẢI là UUID để khớp với model NguoiDung
      allowNull: true,
      references: {
        model: 'NguoiDungs',
        key: 'nguoidung_id'
      }
    },
    khachhang_id: {
      type: DataTypes.UUID, // hoặc UUID, hoặc INTEGER tùy bạn
      allowNull: true
    },
    tongtien: DataTypes.DECIMAL,
    trangthai: DataTypes.STRING,
    sdt: DataTypes.STRING,
    diachi: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DonHang',
    tableName: 'DonHangs',
    underscored: true,
  });
  return DonHang;
};