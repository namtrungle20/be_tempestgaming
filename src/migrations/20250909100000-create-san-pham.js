'use strict';

const { sequelize } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SanPhams', {
      sanpham_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID, // Hoặc Sequelize.STRING(36)
        defaultValue: Sequelize.UUIDV4 // DB-level default (v4)
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      mota: {
        type: Sequelize.TEXT
      },
      gia: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false
      },
      soluong: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      image: {
        type: Sequelize.TEXT
      },
      loai_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LoaiSanPhams',
          key: 'loai_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      thuonghieu_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ThuongHieus',
          key: 'thuonghieu_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('SanPhams');
  }
};