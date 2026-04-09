'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Thêm cột la_anh_dai_dien (cho phép NULL tạm, sau set default)
    await queryInterface.addColumn('HinhAnhSanPhams', 'la_anh_dai_dien', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
    // Cập nhật giá trị mặc định cho các dòng hiện có (false)
    await queryInterface.sequelize.query('UPDATE `HinhAnhSanPhams` SET `la_anh_dai_dien` = false WHERE `la_anh_dai_dien` IS NULL');
    // Đổi thành NOT NULL
    await queryInterface.changeColumn('HinhAnhSanPhams', 'la_anh_dai_dien', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    // 2. (Tuỳ chọn) Sửa image_url từ TEXT sang STRING(500)
    await queryInterface.changeColumn('HinhAnhSanPhams', 'image_url', {
      type: Sequelize.STRING(500),
      allowNull: false, // giữ nguyên ràng buộc
    });

    // 3. (Tuỳ chọn) Sửa sanpham_id từ STRING(10) sang INTEGER
    // Cần đảm bảo dữ liệu hiện có có thể ép kiểu được (toàn số)
    await queryInterface.changeColumn('HinhAnhSanPhams', 'sanpham_id', {
      type: Sequelize.STRING(10),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('HinhAnhSanPhams', 'la_anh_dai_dien');
    await queryInterface.changeColumn('HinhAnhSanPhams', 'image_url', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.changeColumn('HinhAnhSanPhams', 'sanpham_id', {
      type: Sequelize.STRING(10),
      allowNull: false,
    });
  }
};
