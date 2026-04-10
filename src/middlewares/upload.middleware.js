import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { Readable } from 'stream'
import cloudinary from '../config/cloudinaryConfig.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const UPLOAD_DIR = path.join(__dirname, '../uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Chỉ được phép tải lên file ảnh!'), false)
}

const diskStorage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
        const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`
        cb(null, safeName)
    },
})

export const uploadSingle = multer({
    storage: diskStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).single('image')

export const uploadArray = (fieldName = 'images', maxCount = 5) =>
    multer({
        storage: diskStorage,
        fileFilter: imageFileFilter,
        limits: { fileSize: MAX_FILE_SIZE },
    }).array(fieldName, maxCount)

// ── Cloudinary ────────────────────────────────────────────────────────────

const memoryStorage = multer.memoryStorage()

export const uploadCloudinarySingle = multer({
    storage: memoryStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).single('image')

export const uploadCloudinaryArray = multer({
    storage: memoryStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).array('images', 5)

export const toCloudinary = async (req, res, next) => {
    if (!req.file) return next()

    const stream = cloudinary.uploader.upload_stream(
        {
            folder: 'Images',
            transformation: [
                { width: 800, height: 800, crop: 'pad', background: 'white' }
            ],
        },
        (error, result) => {
            if (error) return next(error)
            req.file.path = result.secure_url
            req.file.public_id = result.public_id
            next()
        }
    )

    Readable.from(req.file.buffer).pipe(stream)
}
// middlewares/upload.middleware.js (thêm)
export const toCloudinaryArray = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    try {
        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'Images', transformation: [{ width: 800, height: 800, crop: 'pad', background: 'white' }] },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve({ url: result.secure_url, public_id: result.public_id });
                    }
                );
                Readable.from(file.buffer).pipe(stream);
            });
        });
        const uploadedImages = await Promise.all(uploadPromises);
        req.uploadedImages = uploadedImages; // gắn vào req để controller dùng
        next();
    } catch (error) {
        next(error);
    }
};