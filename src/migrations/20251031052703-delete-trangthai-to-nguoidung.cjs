'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'NguoiDungs';
    const desc = await queryInterface.describeTable(table);

    if (desc.trangthai) {
      await queryInterface.removeColumn(table, 'trangthai');
    }
  },


  async down(queryInterface, Sequelize) {
   
  }
};
