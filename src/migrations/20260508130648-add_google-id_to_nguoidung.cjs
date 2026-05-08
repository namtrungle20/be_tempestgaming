'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('NguoiDungs', 'google_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      after: 'password'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('NguoiDungs', 'google_id');
  }
};
