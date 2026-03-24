'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.addColumn('NguoiDungs', 'ho_ten', {
            type: Sequelize.STRING,
            allowNull: true,
        });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('NguoiDungs', 'ho_ten');
  }
};
