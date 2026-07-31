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
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'NguoiDungs',
        key: 'nguoidung_id'
      }
    },
    phi_van_chuyen: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tongtien: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    trangthai: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // name: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    giam_gia: {
      type: DataTypes.DECIMAL(12, 0),
      allowNull: false,
      defaultValue: 0
    },
    ly_do_huy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ghi_chu_huy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    huy_boi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sdt: DataTypes.STRING,
    diachi: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'DonHang',
    tableName: 'DonHangs',
    underscored: true,
  });
  return DonHang;
};