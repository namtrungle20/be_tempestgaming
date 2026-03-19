'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'DonHangs';
    const desc = await queryInterface.describeTable(table);

    if (!desc.trangthai) {
      await queryInterface.addColumn(table, 'trangthai', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1, // CHO_THANH_TOAN
        comment: '1: Chờ thanh toán, 2: Đang xử lý, 3: Thanh toán thành công, 4: Hoàn tất, 5: Đã hủy, 6: Hoàn tiền',
      });
    }
  },


  async down(queryInterface, Sequelize) {
    const table = 'DonHangs';
    const desc = await queryInterface.describeTable(table);

    if (desc.trangthai) {
      await queryInterface.removeColumn(table, 'trangthai');
    }
  }
};

