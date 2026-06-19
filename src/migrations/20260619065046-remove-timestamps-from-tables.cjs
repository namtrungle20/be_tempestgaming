'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      'ChiTietDonHangs',
      'ChiTietGioHangs',
      'HinhAnhSanPhams',
      'ThuongHieus',
      'LoaiSanPhams',
      'DanhMucs',
      'GioHangs',
    ];

    for (const table of tables) {
      const desc = await queryInterface.describeTable(table);

      if (desc.created_at) {
        await queryInterface.removeColumn(table, 'created_at');
        console.log(`✅ Removed created_at from ${table}`);
      } else {
        console.log(`⏭️  ${table} không có cột created_at, bỏ qua`);
      }

      if (desc.updated_at) {
        await queryInterface.removeColumn(table, 'updated_at');
        console.log(`✅ Removed updated_at from ${table}`);
      } else {
        console.log(`⏭️  ${table} không có cột updated_at, bỏ qua`);
      }
    }

    const spDesc = await queryInterface.describeTable('SanPhams');
    if (spDesc.url) {
      await queryInterface.removeColumn('SanPhams', 'url');
      console.log('✅ Removed url from SanPhams');
    } else {
      console.log('⏭️  SanPhams không có cột url, bỏ qua');
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'ChiTietDonHangs',
      'ChiTietGioHangs',
      'HinhAnhSanPhams',
      'ThuongHieus',
      'LoaiSanPhams',
      'DanhMucs',
      'GioHangs',
    ];

    for (const table of tables) {
      await queryInterface.addColumn(table, 'created_at', {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      });
      await queryInterface.addColumn(table, 'updated_at', {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      });
      await queryInterface.addColumn('SanPhams', 'url', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
};