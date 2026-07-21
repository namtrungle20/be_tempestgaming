'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('DonHangs', 'giam_gia', {
      type: Sequelize.DECIMAL(12, 0),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('DonHangs', 'giam_gia');
  }
};
