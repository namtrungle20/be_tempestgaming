'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HinhAnhSanPham extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      HinhAnhSanPham.belongsTo(models.SanPham, {
        foreignKey: 'sanpham_id',
        as: 'SanPham'
      })
    }
  }
  HinhAnhSanPham.init({
    sanpham_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    la_anh_dai_dien: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    file_hash: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'MD5 hash của file ảnh gốc để detect trùng lặp',
    }
  }, {
    sequelize,
    modelName: 'HinhAnhSanPham',
    tableName: 'HinhAnhSanPhams',
    underscored: true,
    timestamps: false
  });
  return HinhAnhSanPham;
};