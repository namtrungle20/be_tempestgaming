'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DanhGia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DanhGia.belongsTo(models.SanPham, { foreignKey: 'sanpham_id' });
      DanhGia.belongsTo(models.NguoiDung, { foreignKey: 'nguoidung_id' });//user_id
    }
  }
  DanhGia.init({
    danhgia_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    // 2. Sửa khóa ngoại sanpham_id
    sanpham_id: {
      type: DataTypes.STRING(10), // Phải là UUID nếu bảng SanPham dùng UUID
      allowNull: false
    },
    // 3. Sửa khóa ngoại nguoidung_id
    nguoidung_id: {
      type: DataTypes.UUID, // Bắt buộc phải là UUID để khớp với model NguoiDung
      allowNull: false
    },
    so_sao: DataTypes.INTEGER,
    binh_luan: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'DanhGia',
    tableName: 'DanhGias',
    underscored: true,
  });
  return DanhGia;
};