'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SanPham extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SanPham.belongsTo(models.LoaiSanPham, { foreignKey: 'loai_id' });
      SanPham.belongsTo(models.ThuongHieu, { foreignKey: 'thuonghieu_id' });
      SanPham.hasMany(models.ChiTietDonHang, {
        foreignKey: 'sanpham_id',
        as: 'ChiTietDonHang'
      });
      SanPham.hasMany(models.GioHang, {
        foreignKey: 'sanpham_id', as: 'GioHang'
      })

      SanPham.hasMany(models.DanhGia, { foreignKey: 'sanpham_id' });
      SanPham.hasMany(models.HinhAnhSanPham, { foreignKey: 'sanpham_id', as: 'HinhAnhSanPham' });
    }
  }
  SanPham.init({
    sanpham_id: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
    mota: DataTypes.TEXT,
    gia: DataTypes.DECIMAL(10, 2),
    soluong: DataTypes.INTEGER,
    url: DataTypes.STRING(255),
    loai_id: DataTypes.INTEGER,
    thuonghieu_id: DataTypes.INTEGER,
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'SanPham',
    tableName: 'SanPhams',
    underscored: true,
  });
  return SanPham;
};