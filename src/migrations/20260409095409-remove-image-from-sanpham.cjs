'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('SanPhams', 'url', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: false, // có thể đặt true sau khi cập nhật dữ liệu
    });
    await queryInterface.removeColumn('SanPhams', 'image');
  },


  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('SanPham', 'image', { type: Sequelize.TEXT });
    await queryInterface.removeColumn('SanPham', 'url');
  }
};
