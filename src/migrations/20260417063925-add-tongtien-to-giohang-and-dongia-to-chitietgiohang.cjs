'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const gioHangCols = await queryInterface.describeTable('GioHangs');
    if (!gioHangCols.tongtien) {
      await queryInterface.addColumn('GioHangs', 'tongtien', {
        type: Sequelize.DECIMAL(18, 2),
        defaultValue: 0,
        allowNull: false,
      });
    }

    const chiTietCols = await queryInterface.describeTable('ChiTietGioHangs');
    if (!chiTietCols.dongia) {
      await queryInterface.addColumn('ChiTietGioHangs', 'dongia', {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      });
    }
  },

  async down(queryInterface) {
    const chiTietCols = await queryInterface.describeTable('ChiTietGioHangs');
    if (chiTietCols.dongia) {
      await queryInterface.removeColumn('ChiTietGioHangs', 'dongia');
    }

    const gioHangCols = await queryInterface.describeTable('GioHangs');
    if (gioHangCols.tongtien) {
      await queryInterface.removeColumn('GioHangs', 'tongtien');
    }
  }
};
