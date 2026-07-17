'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TinNhans', {
      tinnhan_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nguoidung_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'NguoiDungs', // sửa lại đúng tên bảng NguoiDung thật của bạn nếu khác
          key: 'nguoidung_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      guest_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      noidung: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      nguoi_gui: {
        type: Sequelize.INTEGER, // 0 = user, 1 = admin — đồng bộ kiểu int như vaitro
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TinNhans')
  }
};
