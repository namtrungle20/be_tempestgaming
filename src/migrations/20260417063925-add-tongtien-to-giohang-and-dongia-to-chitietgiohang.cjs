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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('GioHangs', 'tongtien');
  }
};
