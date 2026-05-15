'use strict';


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('GioHangs', 'sanpham_id', {
      type: Sequelize.STRING(10),
      allowNull: false,
      references: {
        model: 'SanPhams',
        key: 'sanpham_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.addColumn('GioHangs', 'soluong', {
      type: Sequelize.INTEGER,
      allowNull: true, // hoặc false tùy logic
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('GioHangs', 'sanpham_id');
    await queryInterface.removeColumn('GioHangs', 'soluong');
  }
};