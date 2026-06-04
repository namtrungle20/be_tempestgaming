'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Verification extends Model {
        static associate(models) {
            Verification.belongsTo(models.NguoiDung, {
                foreignKey: 'nguoidung_id',
                as: 'NguoiDung',
            });
        }
    }

    Verification.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nguoidung_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        sdt: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        loai: {
            type: DataTypes.ENUM('sdt', 'email', 'quen_mat_khau'),
            allowNull: false,
        },
        ma_otp: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        het_han: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        da_su_dung: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        so_lan_thu: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        sequelize,
        modelName: 'Verification',
        tableName: 'Verifications',
        timestamps: false,
        underscored: true,
        indexes: [
            { fields: ['nguoidung_id'] },
            { fields: ['sdt'] },
            { fields: ['loai'] },
        ],
    });

    return Verification;
};