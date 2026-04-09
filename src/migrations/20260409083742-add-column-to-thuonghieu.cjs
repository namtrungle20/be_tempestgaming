'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ThuongHieus', 'url', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('ThuongHieus', 'mota', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ThuongHieus', 'url');
    await queryInterface.removeColumn('ThuongHieus', 'mota');
  }
};
