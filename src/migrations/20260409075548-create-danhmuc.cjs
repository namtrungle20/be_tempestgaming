'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DanhMucs', {
      danhmuc_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ten: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      mota: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      thutu: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      trangthai: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('DanhMucs');
  }
};
