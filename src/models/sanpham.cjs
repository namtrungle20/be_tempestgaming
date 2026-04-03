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
      SanPham.hasMany(models.ChiTietGioHang, {
        foreignKey: 'sanpham_id',
        as: 'ChiTietGioHang'
      });

      SanPham.hasMany(models.DanhGia, { foreignKey: 'sanpham_id' });
      SanPham.hasMany(models.HinhAnhSanPham, { foreignKey: 'sanpham_id', as: 'HinhAnhSanPhams' });
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
    image: DataTypes.TEXT,
    loai_id: DataTypes.INTEGER,
    thuonghieu_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SanPham',
    tableName: 'SanPhams',
    underscored: true,
  });
  return SanPham;
};