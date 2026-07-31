'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      'DonHangs',
      'ho_ten',
      'name'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      'DonHangs',
      'name',
      'ho_ten'
    );
  }
};
