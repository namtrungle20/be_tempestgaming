'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NguoiDung extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      NguoiDung.hasOne(models.GioHang, { foreignKey: 'nguoidung_id' });
      // NguoiDung.hasMany(models.GioHang, { foreignKey: 'nguoidung_id' });
      NguoiDung.hasMany(models.DanhGia, { foreignKey: 'nguoidung_id' });//user_id
      NguoiDung.hasMany(models.DonHang, { foreignKey: 'nguoidung_id' });
      NguoiDung.hasMany(models.Session, { foreignKey: 'nguoidung_id' });
    }
  }
  NguoiDung.init({
    nguoidung_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: DataTypes.STRING,
    sdt: {
      type: DataTypes.STRING, // Nên để STRING vì số điện thoại có thể có số 0 ở đầu
      allowNull: true
    },
    diachi: DataTypes.STRING,
    avatar: DataTypes.STRING,
    vaitro: DataTypes.INTEGER,
    is_lock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ngayvao: DataTypes.DATE,
    ngayhoatdong: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'NguoiDung',
    tableName: 'NguoiDungs',
    underscored: true,
    timestamps: false
  });
  return NguoiDung;
};