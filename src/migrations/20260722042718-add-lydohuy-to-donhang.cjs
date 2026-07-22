'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('DonHangs', 'ly_do_huy', {
      type: Sequelize.INTEGER,
      allowNull: true, // null nếu đơn chưa từng bị hủy
      after: 'trangthai',
    });

    await queryInterface.addColumn('DonHangs', 'ghi_chu_huy', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'ly_do_huy',
    });

    await queryInterface.addColumn('DonHangs', 'huy_boi', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'ghi_chu_huy',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('DonHangs', 'huy_boi');
    await queryInterface.removeColumn('DonHangs', 'ghi_chu_huy');
    await queryInterface.removeColumn('DonHangs', 'ly_do_huy');
  }
};
