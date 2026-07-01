'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('NguoiDungs', 'hang_thanh_vien', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('NguoiDungs', 'tong_chi_tieu', {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('NguoiDungs', 'hang_thanh_vien');
    await queryInterface.removeColumn('NguoiDungs', 'tong_chi_tieu');
  }
};
