'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChiTietGioHangs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      giohang_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'GioHangs', key: 'giohang_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sanpham_id: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'SanPhams', key: 'sanpham_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      dongia: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      soluong: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('ChiTietGioHangs', ['giohang_id']);
    await queryInterface.addIndex('ChiTietGioHangs', ['sanpham_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ChiTietGioHangs');
  }
};
