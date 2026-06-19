'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChiTietSanPhams', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sanpham_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'SanPhams',
          key: 'sanpham_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ten_thuoc_tinh: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gia_tri: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('ChiTietSanPhams', ['sanpham_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ChiTietSanPhams');
  }
};
