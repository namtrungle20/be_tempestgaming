'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ThanhToan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ThanhToan.belongsTo(models.DonHang, { foreignKey: 'donhang_id' });//order_id
    }
  }
  ThanhToan.init({
    thanhtoan_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    donhang_id: {
      type: DataTypes.UUID,
      allowNull: false, // Thanh toán bắt buộc phải gắn với một đơn hàng
      references: {
        model: 'DonHangs',
        key: 'donhang_id'
      }
    },
    phuongthucthanhtoan: {
      type: DataTypes.STRING,
      allowNull: false
    },
    trangthai: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 0: Chờ thanh toán, 1: Thành công, 2: Thất bại
      allowNull: false
    }
  }, {

    sequelize,
    modelName: 'ThanhToan',
    tableName: 'ThanhToans',
    underscored: true,
  });
  return ThanhToan;
};