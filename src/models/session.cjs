'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Session.belongsTo(models.NguoiDung, {
        foreignKey: 'nguoidung_id'
      });
    }
  }
  Session.init({
    session_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nguoidung_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    is_revoked: DataTypes.BOOLEAN,
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Session',
    tableName: 'Sessions',
    timestamps: false,
    indexes: [
      { fields: ['nguoidung_id'] },
      { unique: true, fields: ['refreshToken'] }
    ]
  });
  return Session;
};