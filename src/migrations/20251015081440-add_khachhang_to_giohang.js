'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'GioHangs';
    const desc = await queryInterface.describeTable(table);
    if (!desc.khachhang_id) {
      await queryInterface.addColumn(table, 'khachhang_id', {
        allowNull: true,
        type: Sequelize.UUID, // Hoặc Sequelize.STRING(36)
        defaultValue: Sequelize.UUIDV4 // DB-level default (v4)
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = 'GioHangs';
    const desc = await queryInterface.describeTable(table);
    if (desc.khachhang_id) {
      await queryInterface.removeColumn(table, 'khachhang_id');
    }
  }
};
