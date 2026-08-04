'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Otp extends Model {
        static associate(models) {
            Otp.belongsTo(models.NguoiDung, { foreignKey: 'nguoidung_id' });
        }
    }
    Otp.init({
        otp_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nguoidung_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        otp_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        loai: {
            type: DataTypes.INTEGER, // đổi từ STRING sang INTEGER
            allowNull: false,
            defaultValue: 1, // 1 = xac_thuc_email
        },
        het_han: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        da_su_dung: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        so_lan_thu: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        sequelize,
        modelName: 'Otp',
        tableName: 'OTPs',
        underscored: true,
        timestamps: true,
    });
    return Otp;
};