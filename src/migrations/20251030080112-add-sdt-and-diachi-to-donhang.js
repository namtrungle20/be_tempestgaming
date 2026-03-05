'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'DonHangs';
    const desc = await queryInterface.describeTable(table);
    if (!desc.sdt) {
      await queryInterface.addColumn(table, 'sdt', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!desc.diachi) {
      await queryInterface.addColumn(table, 'diachi', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },


  async down(queryInterface, Sequelize) {
    const table = 'DonHangs';
    const desc = await queryInterface.describeTable(table);
    if (desc.sdt) {
      await queryInterface.removeColumn(table, 'sdt');
    }

    if (desc.diachi) {
      await queryInterface.removeColumn(table, 'diachi');
    }
  }
};
