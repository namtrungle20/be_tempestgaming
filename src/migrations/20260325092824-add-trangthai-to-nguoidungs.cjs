'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Thêm column trangthai
        await queryInterface.addColumn('NguoiDungs', 'trangthai', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });

        // Xóa is_lock và is_deleted
        await queryInterface.removeColumn('NguoiDungs', 'is_lock');
        await queryInterface.removeColumn('NguoiDungs', 'is_deleted');
    },

    async down(queryInterface, Sequelize) {
        // Rollback: xóa trangthai, thêm lại is_lock và is_deleted
        await queryInterface.removeColumn('NguoiDungs', 'trangthai');

        await queryInterface.addColumn('NguoiDungs', 'is_lock', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0,
        });

        await queryInterface.addColumn('NguoiDungs', 'is_deleted', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
    }
};