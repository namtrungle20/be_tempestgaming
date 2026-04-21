'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('ThanhToans', 'phuongthucthanhtoan', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('ThanhToans', 'sotien', {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('ThanhToans', 'momo_order_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('ThanhToans', 'momo_request_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('ThanhToans', 'momo_trans_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('ThanhToans', 'momo_result_code', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('ThanhToans', 'momo_pay_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('ThanhToans', 'momo_time_pay', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ThanhToans', 'sotien');
    await queryInterface.removeColumn('ThanhToans', 'momo_order_id');
    await queryInterface.removeColumn('ThanhToans', 'momo_request_id');
    await queryInterface.removeColumn('ThanhToans', 'momo_trans_id');
    await queryInterface.removeColumn('ThanhToans', 'momo_result_code');
    await queryInterface.removeColumn('ThanhToans', 'momo_pay_type');
    await queryInterface.removeColumn('ThanhToans', 'momo_time_pay');

    await queryInterface.changeColumn('ThanhToans', 'phuongthucthanhtoan', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
