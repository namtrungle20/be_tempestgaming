'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GioHangs', {
      giohang_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID, // Hoặc Sequelize.STRING(36)
        defaultValue: Sequelize.UUIDV4 // DB-level default (v4)
      },
      nguoidung_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'NguoiDungs',
          key: 'nguoidung_id'
        },
        onUpdate: 'CASCADE', // Cập nhật theo hành động trên bảng cha
        onDelete: 'RESTRICT' // Không cho xóa nếu có giỏ hàng liên quan
      },
      khachhang_id: {
        type: Sequelize.UUID, // Hoặc Sequelize.STRING(36)
        defaultValue: Sequelize.UUIDV4, // DB-level default (v4)
        allowNull: true,
        unique: true

      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ChiTietGioHangs');
    await queryInterface.dropTable('GioHangs');
  }
};