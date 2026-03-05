'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChiTietDonHangs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      donhang_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'DonHangs',
          key: 'donhang_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sanpham_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'SanPhams',
          key: 'sanpham_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      soluong: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      dongia: {
        type: Sequelize.DECIMAL(18, 2),
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
    await queryInterface.dropTable('ChiTietDonHangs');
  }
};