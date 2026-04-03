'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'NguoiDungs';
    const desc = await queryInterface.describeTable(table);
    if (!desc.is_lock) {
      await queryInterface.addColumn(table, 'is_lock', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      });
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
