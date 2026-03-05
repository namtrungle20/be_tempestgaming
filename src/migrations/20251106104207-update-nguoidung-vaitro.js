'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Gỡ ràng buộc foreign key trước
    await queryInterface.removeConstraint('NguoiDungs', 'NguoiDungs_ibfk_1');

    // 2. Đổi tên cột vaitro_id → vaitro
    await queryInterface.renameColumn('NguoiDungs', 'vaitro_id', 'vaitro');

    // 3. Sửa kiểu dữ liệu nếu cần
    await queryInterface.changeColumn('NguoiDungs', 'vaitro', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // 4. Xóa bảng VaiTros
    await queryInterface.dropTable('VaiTros');
  },


  async down(queryInterface, Sequelize) {
  }
};
