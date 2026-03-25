'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('NguoiDungs', 'is_deleted', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('NguoiDungs', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('NguoiDungs', 'is_deleted');
    await queryInterface.removeColumn('NguoiDungs', 'deleted_at');
  }
};
