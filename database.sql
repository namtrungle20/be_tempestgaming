ALTER TABLE SanPhams
ADD UNIQUE (name);

ALTER TABLE SanPhams
MODIFY gia DECIMAL(18,2) DEFAULT 0,
ADD CONSTRAINT chk_sanpham_gia CHECK (gia >= 0);

-- Ràng buộc số lượng tồn >= 0
ALTER TABLE SanPhams
MODIFY gia INT DEFAULT 0,
ADD CONSTRAINT chk_sanpham_soluongton CHECK (soluongton >= 0);

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `DangGias`;
SET FOREIGN_KEY_CHECKS = 1;