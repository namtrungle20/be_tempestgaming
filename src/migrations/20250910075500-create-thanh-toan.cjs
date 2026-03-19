'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ThanhToans', {
      thanhtoan_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID, // Hoặc Sequelize.STRING(36)
        defaultValue: Sequelize.UUIDV4 // DB-level default (v4)
      },
      donhang_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'DonHangs',
          key: 'donhang_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      phuongthucthanhtoan: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.dropTable('ThanhToans');
  }
};