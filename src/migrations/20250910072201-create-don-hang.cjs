'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DonHangs', {
      donhang_id: {
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
        onDelete: 'RESTRICT' // Không cho xóa nếu có đơn hàng liên quan
      },
      khachhang_id: {
        type: Sequelize.UUID, // Hoặc Sequelize.STRING(36)
        defaultValue: Sequelize.UUIDV4, // DB-level default (v4)
        allowNull: true
      },
      tongtien: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0
      },
      trangthai: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.dropTable('DonHangs');
  }
};