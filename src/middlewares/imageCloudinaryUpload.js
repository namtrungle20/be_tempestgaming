import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Lưu file tạm vào thư mục uploads/
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../uploads'),
    filename: (req, file, cb) => {
        const safeName = Date.now() + '-' + file.originalname.replaceAll(' ', '_');
        cb(null, safeName);
    },
});
// Chỉ cho phép file ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ được phép tải lên file ảnh!'), false);
    }
};

// Giới hạn dung lượng 5MB
const imageCloudinaryUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
export default imageCloudinaryUpload;
