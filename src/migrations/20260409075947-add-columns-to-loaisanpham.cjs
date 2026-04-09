'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('LoaiSanPhams', 'danhmuc_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'DanhMucs',
        key: 'danhmuc_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('LoaiSanPhams', 'url', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('LoaiSanPhams', 'mota', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('LoaiSanPhams', 'thutu', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn('LoaiSanPhams', 'trangthai', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('LoaiSanPhams', 'danhmuc_id');
    await queryInterface.removeColumn('LoaiSanPhams', 'url');
    await queryInterface.removeColumn('LoaiSanPhams', 'mota');
    await queryInterface.removeColumn('LoaiSanPhams', 'thutu');
    await queryInterface.removeColumn('LoaiSanPhams', 'trangthai');
  }
};
