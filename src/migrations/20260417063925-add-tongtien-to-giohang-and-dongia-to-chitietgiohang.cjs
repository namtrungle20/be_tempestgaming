'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm cột tongtien vào bảng GioHang
    await queryInterface.addColumn('GioHangs', 'tongtien', {
      type: Sequelize.DECIMAL(18, 2),
      defaultValue: 0,
      allowNull: false,
    });

    // Thêm cột dongia vào bảng ChiTietGioHang
    await queryInterface.addColumn('ChiTietGioHangs', 'dongia', {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = 'ChiTietGioHangs';
    const columns = await queryInterface.describeTable(tableName);
    if (columns.dongia) {
      await queryInterface.removeColumn(tableName, 'dongia');
    }
    if (columns.tongtien) {
      await queryInterface.removeColumn(tableName, 'tongtien');
    }
  }
};
