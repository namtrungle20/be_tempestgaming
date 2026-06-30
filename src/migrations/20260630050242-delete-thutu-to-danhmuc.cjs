'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('DanhMucs');
    if (!tableDefinition.type) {
      // await queryInterface.removeColumn('DanhMucs', 'thutu');
      await queryInterface.removeColumn('DanhMucs', 'trangthai')
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('DanhMucs');
    if (tableDefinition.type) {
      // await queryInterface.addColumn('DanhMucs', 'thutu', {
      //   type: Sequelize.INTEGER,
      //   allowNull: false,
      //   defaultValue: 0
      // });
      await queryInterface.addColumn('DanhMucs', 'trangthai', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      });
    }
  }
};
