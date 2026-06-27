'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('HinhAnhSanPhams');
    if (!tableDefinition.type) {
      await queryInterface.addColumn('HinhAnhSanPhams', 'type', {
        type: Sequelize.ENUM('image', 'video'),
        allowNull: false,
        defaultValue: 'image', // ảnh cũ tự động = 'image'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('HinhAnhSanPhams');
    if (tableDefinition.type) {
      await queryInterface.removeColumn('HinhAnhSanPhams', 'type');
    }
  }
}
