'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Verifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      nguoidung_id: {
        type: Sequelize.UUID,
        allowNull: true, // null khi chưa tạo tài khoản (flow đăng ký)
        references: { model: 'NguoiDungs', key: 'nguoidung_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sdt: {
        type: Sequelize.STRING(15),
        allowNull: true, // lưu SĐT khi chưa có nguoidung_id
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      loai: {
        type: Sequelize.ENUM('sdt', 'email', 'quen_mat_khau'),
        allowNull: false,
      },
      ma_otp: {
        type: Sequelize.STRING,
        allowNull: false, // đã hash bằng argon2
      },
      het_han: {
        type: Sequelize.DATE,
        allowNull: false, // OTP hết hạn sau 5 phút
      },
      da_su_dung: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // dùng 1 lần rồi vô hiệu
      },
      so_lan_thu: {
        type: Sequelize.INTEGER,
        defaultValue: 0, // max 5 lần, chống brute force
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Index để query nhanh
    await queryInterface.addIndex('Verifications', ['nguoidung_id']);
    await queryInterface.addIndex('Verifications', ['sdt']);
    await queryInterface.addIndex('Verifications', ['loai']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Verifications');
  }
};