import multer from 'multer'
import cloudinary from '../config/cloudinaryConfig.js'
import { Readable } from 'stream'

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true)
    else cb(new Error('Chỉ được phép tải lên file ảnh!'), false)
}

// Dùng memoryStorage — không lưu file xuống disk
const imageCloudinaryUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
})

// Middleware upload lên Cloudinary sau khi multer xử lý
export const uploadToCloudinary = async (req, res, next) => {
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

export default imageCloudinaryUpload