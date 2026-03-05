'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sessions', {
      session_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        type: Sequelize.UUID, // Hoặc Sequelize.STRING(36)
        defaultValue: Sequelize.UUIDV4 // DB-level default (v4)
      },
      nguoidung_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'NguoiDungs',
          key: 'nguoidung_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      refreshToken: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      is_revoked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addIndex('Sessions', ['nguoidung_id']);
    await queryInterface.addIndex('Sessions', ['refreshToken'], { unique: true });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sessions');
  },
};
