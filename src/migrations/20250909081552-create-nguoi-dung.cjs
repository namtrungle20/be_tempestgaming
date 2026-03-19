'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NguoiDungs', {
      nguoidung_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID, // Hoặc Sequelize.STRING(36)
        defaultValue: Sequelize.UUIDV4 // DB-level default (v4)
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sdt: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true
      },
      diachi: {
        type: Sequelize.STRING
      },
      avatar: {
        type: Sequelize.STRING
      },
      vaitro_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'VaiTros',
          key: 'vaitro_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      ngayvao: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      ngayhoatdong: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      trangthai: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NguoiDungs');
  }
};