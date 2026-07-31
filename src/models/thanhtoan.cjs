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
      type: DataTypes.INTEGER,
      allowNull: false,
      // 0: COD | 1: MoMo | 2: VNPay | 3: Bank Transfer
    },
    sotien: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    trangthai: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      // 0: Chờ thanh toán | 1: Thành công | 2: Thất bại | 3: Hoàn tiền
    },
    momo_order_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    momo_request_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    momo_trans_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    momo_result_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    momo_pay_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    momo_time_pay: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    vnp_txn_ref: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    vnp_transaction_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vnp_response_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vnp_bank_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vnp_pay_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'ThanhToan',
    tableName: 'ThanhToans',
    underscored: true,
  });
  return ThanhToan;
};