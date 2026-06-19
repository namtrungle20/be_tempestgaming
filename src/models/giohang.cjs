'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GioHang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GioHang.belongsTo(models.NguoiDung, { foreignKey: 'nguoidung_id' });
      GioHang.hasMany(models.ChiTietGioHang, {
        foreignKey: 'giohang_id',
        as: 'ChiTietGioHang'
      });
    }
  }
  GioHang.init({
    giohang_id: {
      type: DataTypes.UUID,           // Chuyển từ INTEGER sang UUID
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Đảm bảo luôn có ID nếu quên tạo ở Controller
      allowNull: false
    },
    nguoidung_id: {
      type: DataTypes.UUID,           // PHẢI là UUID để khớp với model NguoiDung
      allowNull: true,
      references: {
        model: 'NguoiDungs',
        key: 'nguoidung_id'
      }
    },
    tongtien: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'GioHang',
    tableName: 'GioHangs',
    underscored: true,
    timestamps: false
  });
  return GioHang;
};