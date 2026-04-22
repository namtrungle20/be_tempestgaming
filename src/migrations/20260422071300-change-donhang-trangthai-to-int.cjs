'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('DonHangs', 'trangthai_new', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    // Copy dữ liệu từ cột cũ sang cột mới (chuyển đổi giá trị)
    await queryInterface.sequelize.query(`
            UPDATE DonHangs SET trangthai_new = CASE 
                WHEN trangthai = 'cho_xac_nhan' THEN 0
                WHEN trangthai = 'da_xac_nhan' THEN 1
                WHEN trangthai = 'dang_giao' THEN 2
                WHEN trangthai = 'da_giao' THEN 3
                WHEN trangthai = 'da_huy' THEN 4
                WHEN trangthai = 'da_thanh_toan' THEN 5
                ELSE 0
            END
        `);
    // Xóa cột cũ
    await queryInterface.removeColumn('DonHangs', 'trangthai');
    // Đổi tên cột mới thành trangthai
    await queryInterface.renameColumn('DonHangs', 'trangthai_new', 'trangthai');
    // Đặt NOT NULL và DEFAULT
    await queryInterface.changeColumn('DonHangs', 'trangthai', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Rollback: khôi phục lại cột string
    await queryInterface.addColumn('DonHangs', 'trangthai_old', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.sequelize.query(`
            UPDATE DonHangs SET trangthai_old = CASE 
                WHEN trangthai = 0 THEN 'cho_xac_nhan'
                WHEN trangthai = 1 THEN 'da_xac_nhan'
                WHEN trangthai = 2 THEN 'dang_giao'
                WHEN trangthai = 3 THEN 'da_giao'
                WHEN trangthai = 4 THEN 'da_huy'
                WHEN trangthai = 5 THEN 'da_thanh_toan'
                ELSE 'cho_xac_nhan'
            END
        `);
    await queryInterface.removeColumn('DonHangs', 'trangthai');
    await queryInterface.renameColumn('DonHangs', 'trangthai_old', 'trangthai');
    await queryInterface.changeColumn('DonHangs', 'trangthai', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'cho_xac_nhan'
    });
  }
};