'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('NguoiDungs', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('NguoiDungs', 'sdt', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('NguoiDungs', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('NguoiDungs', 'sdt', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
