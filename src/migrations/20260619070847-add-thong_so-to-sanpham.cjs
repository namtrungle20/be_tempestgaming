'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('SanPhams', 'thong_so', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'mota',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('SanPhams', 'thong_so');
  }
};
