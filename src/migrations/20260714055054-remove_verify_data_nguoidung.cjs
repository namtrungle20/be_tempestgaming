'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('NguoiDungs', 'sdt_verified');
    await queryInterface.removeColumn('NguoiDungs', 'email_verified');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('NguoiDungs', 'sdt_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('NguoiDungs', 'email_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  }
};
