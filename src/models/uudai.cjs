'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UuDaiHang extends Model {
        static associate(models) {
        }
    }
    UuDaiHang.init({
        uudai_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        hang: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        phan_tram_giam: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
        },
        trang_thai: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        mo_ta: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'UuDaiHang',
        tableName: 'UuDaiHangs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });
    return UuDaiHang;
};