'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OTPs', {
      otp_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nguoidung_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'NguoiDungs', key: 'nguoidung_id' },
        onDelete: 'CASCADE',
      },
      email: { type: Sequelize.STRING, allowNull: false },
      otp_code: { type: Sequelize.STRING, allowNull: false },
      loai: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      het_han: { type: Sequelize.DATE, allowNull: false },
      da_su_dung: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      so_lan_thu: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('OTPs');
  }
};
