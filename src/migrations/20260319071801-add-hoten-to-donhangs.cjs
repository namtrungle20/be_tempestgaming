'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('DonHangs', 'ho_ten', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.removeColumn('DonHangs', 'khachhang_id');
        await queryInterface.changeColumn('DonHangs', 'tongtien', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        });
        await queryInterface.changeColumn('DonHangs', 'trangthai', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'cho_xac_nhan',
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('DonHangs', 'ho_ten');
        await queryInterface.addColumn('DonHangs', 'khachhang_id', {
            type: Sequelize.UUID,
            allowNull: true,
        });
    }
};