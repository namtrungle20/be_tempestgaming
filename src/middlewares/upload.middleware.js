import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const UPLOAD_DIR = path.join(__dirname, '../uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Chỉ được phép tải lên file ảnh!'), false)
    }
}

const diskStorage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
        const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`
        cb(null, safeName)
    },
})

const baseOptions = {
    storage: diskStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}

export const uploadSingle = multer(baseOptions).single('image')
export const uploadArray = (fieldName = 'images', maxCount = 5) =>
    multer(baseOptions).array(fieldName, maxCount)
export const uploadCloudinarySingle = multer(baseOptions).single('image')