'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoaiSanPham extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LoaiSanPham.hasMany(models.SanPham, { foreignKey: 'loai_id', as: 'SanPham' });
      LoaiSanPham.belongsTo(models.DanhMuc, { foreignKey: 'danhmuc_id', as: 'DanhMuc' });
    }
  }
  LoaiSanPham.init({
    loai_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    danhmuc_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: DataTypes.STRING,
    image: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'LoaiSanPham',
    tableName: 'LoaiSanPhams',
    underscored: true,
    timestamps: false
  });
  return LoaiSanPham;
};