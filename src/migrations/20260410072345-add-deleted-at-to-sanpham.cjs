'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('SanPhams', 'deleted_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('SanPham', 'deleted_at');
  }
};
