'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChiTietGioHangs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      giohang_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'GioHangs',
          key: 'giohang_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sanpham_id: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: 'SanPhams',
          key: 'sanpham_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      soluong: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
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
  }
};