'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UuDaiHangs', {
      uudai_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      hang: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true, // mỗi rank chỉ có 1 bản ghi ưu đãi
      },
      phan_tram_giam: {
        type: Sequelize.DECIMAL(5, 2), // ví dụ 12.50 (%)
        allowNull: false,
        defaultValue: 0,
      },
      trang_thai: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      mo_ta: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
    await queryInterface.bulkInsert('UuDaiHangs', [
      { uudai_id: Sequelize.literal('UUID()'), hang: 0, phan_tram_giam: 0, trang_thai: true, mo_ta: 'Hạng Đồng', created_at: new Date(), updated_at: new Date() },
      { uudai_id: Sequelize.literal('UUID()'), hang: 1, phan_tram_giam: 2, trang_thai: true, mo_ta: 'Hạng Bạc', created_at: new Date(), updated_at: new Date() },
      { uudai_id: Sequelize.literal('UUID()'), hang: 2, phan_tram_giam: 5, trang_thai: true, mo_ta: 'Hạng Vàng', created_at: new Date(), updated_at: new Date() },
      { uudai_id: Sequelize.literal('UUID()'), hang: 3, phan_tram_giam: 10, trang_thai: true, mo_ta: 'Hạng Kim Cương', created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UuDaiHangs');
  }
};
