'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'GioHangs';
    const desc = await queryInterface.describeTable(table);

    if (desc.khachhang_id) {
      await queryInterface.removeColumn(table, 'khachhang_id');
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
