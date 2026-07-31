'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ThanhToans', 'vnp_txn_ref', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('ThanhToans', 'vnp_transaction_no', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('ThanhToans', 'vnp_response_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('ThanhToans', 'vnp_bank_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('ThanhToans', 'vnp_pay_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('ThanhToans', 'vnp_txn_ref');
    await queryInterface.removeColumn('ThanhToans', 'vnp_transaction_no');
    await queryInterface.removeColumn('ThanhToans', 'vnp_response_code');
    await queryInterface.removeColumn('ThanhToans', 'vnp_bank_code');
    await queryInterface.removeColumn('ThanhToans', 'vnp_pay_date');
  },
};
