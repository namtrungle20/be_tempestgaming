'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TinNhan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TinNhan.belongsTo(models.NguoiDung, { foreignKey: 'nguoidung_id' })
    }
  }
  TinNhan.init({
    tinnhan_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nguoidung_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    guest_id: DataTypes.STRING,
    noidung: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    nguoi_gui: {
      type: DataTypes.INTEGER,
      allowNull: false
    }, // 0 = user, 1 = admin
  }, {
    sequelize,
    modelName: 'TinNhan',
    tableName: 'TinNhans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });
  return TinNhan;
};