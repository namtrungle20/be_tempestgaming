import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const isRemoteUrl = (str) =>
    typeof str === 'string' && (str.startsWith('http://') || str.startsWith('https://'));

const validateImageExists = (req, res, next) => {
    // Có file mới upload qua multer -> cho qua
    if (req.file || req.files?.length > 0) return next();

    const imageName = req.body?.image || req.body?.hinh_anh;

    // Không gửi ảnh -> cho qua (controller tự xử lý)
    if (!imageName) return next();

    // Ảnh là URL remote (Cloudinary, ...) -> cho qua
    if (isRemoteUrl(imageName)) return next();

    // Kiểm tra file local có tồn tại không
    const filePath = path.join(UPLOAD_DIR, path.basename(imageName));
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: 'File ảnh không tồn tại trên server',
        });
    }

    next();
};

export default validateImageExists;