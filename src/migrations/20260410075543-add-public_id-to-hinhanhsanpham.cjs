'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'HinhAnhSanPhams';
    const columns = await queryInterface.describeTable(tableName);
    if (!columns.public_id) {
      await queryInterface.addColumn(tableName, 'public_id', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    } else {
      console.log('Column public_id already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'HinhAnhSanPhams';
    const columns = await queryInterface.describeTable(tableName);
    if (columns.public_id) {
      await queryInterface.removeColumn(tableName, 'public_id');
    }
  }
};