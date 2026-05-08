'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('NguoiDungs', 'ho_ten', 'name');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('NguoiDungs', 'name', 'ho_ten')
  }
};
