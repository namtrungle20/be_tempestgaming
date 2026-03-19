'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'NguoiDungs';
    const desc = await queryInterface.describeTable(table);
    // Chỉ sửa nếu cột tồn tại
    if (desc.email) {
      await queryInterface.changeColumn(table, 'email', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      });
    }
  },


  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('NguoiDungs', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  }
};
