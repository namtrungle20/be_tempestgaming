'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DanhGias', {
      danhgia_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID, // Hoặc Sequelize.STRING(36)
        defaultValue: Sequelize.UUIDV4 // DB-level default (v4)
      },
      sanpham_id: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: 'SanPhams',
          key: 'sanpham_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nguoidung_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'NguoiDungs',
          key: 'nguoidung_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sosao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      binhluan: {
        type: Sequelize.TEXT
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
    // Ràng buộc duy nhất: 1 user chỉ được đánh giá 1 lần cho 1 sản phẩm
    await queryInterface.addConstraint('DanhGias', {
      fields: ['sanpham_id', 'nguoidung_id'],
      type: 'unique',
      name: 'unique_danhgia_per_user'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DanhGias');
  }
};