import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { Readable } from 'stream'
import crypto from 'crypto'
import cloudinary from '../config/cloudinaryConfig.js'
import db from '../models/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const UPLOAD_DIR = path.join(__dirname, '../uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024
const EXCEL_FILE_SIZE = 10 * 1024 * 1024

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Chỉ được phép tải lên file ảnh!'), false)
}

const hashBuffer = (buffer) =>
    crypto.createHash('md5').update(buffer).digest('hex')

// ── Disk storage (upload thường) ──────────────────────────────────────────────

export const uploadSingle = multer({
    storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) =>
            cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).single('image')

export const uploadArray = (fieldName = 'images', maxCount = 20) =>
    multer({
        storage: multer.diskStorage({
            destination: UPLOAD_DIR,
            filename: (req, file, cb) =>
                cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
        }),
        fileFilter: imageFileFilter,
        limits: { fileSize: MAX_FILE_SIZE },
    }).array(fieldName, maxCount)

// ── Cloudinary storage ────────────────────────────────────────────────────────

export const uploadCloudinarySingle = multer({
    storage: multer.memoryStorage(),
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).single('image')

export const uploadCloudinaryArray = multer({
    storage: multer.memoryStorage(),
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).array('images', 20)

// ── Middleware upload single lên Cloudinary + check trùng hash ────────────────

export const toCloudinary = async (req, res, next) => {
    if (!req.file) return next()

    // ✅ Check hash trùng trước khi upload
    const sanpham_id = req.body.sanpham_id
    if (sanpham_id) {
        const fileHash = hashBuffer(req.file.buffer)
        const existed = await db.HinhAnhSanPham.findOne({
            where: { sanpham_id, file_hash: fileHash }
        })
        if (existed) {
            return res.status(409).json({
                success: false,
                message: 'Ảnh này đã tồn tại cho sản phẩm',
            })
        }
        req.file.file_hash = fileHash
    }

    const stream = cloudinary.uploader.upload_stream(
        {
            folder: 'Images',
            transformation: [{ width: 800, height: 800, crop: 'pad', background: 'white' }],
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

// ── Middleware upload array lên Cloudinary + check trùng hash ─────────────────

export const toCloudinaryArray = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next()

    const sanpham_id = req.body.sanpham_id

    try {
        // ✅ Check hash trùng cho từng file trước khi upload
        if (sanpham_id) {
            for (const file of req.files) {
                const fileHash = hashBuffer(file.buffer)
                const existed = await db.HinhAnhSanPham.findOne({
                    where: { sanpham_id, file_hash: fileHash }
                })
                if (existed) {
                    return res.status(409).json({
                        success: false,
                        message: `Ảnh "${file.originalname}" đã tồn tại cho sản phẩm`,
                    })
                }
                file.file_hash = fileHash
            }
        }

        const uploadPromises = req.files.map(file =>
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'Images',
                        transformation: [{ width: 800, height: 800, crop: 'pad', background: 'white' }],
                    },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve({
                            url: result.secure_url,
                            public_id: result.public_id,
                            file_hash: file.file_hash,
                            originalname: file.originalname,
                        })
                    }
                )
                Readable.from(file.buffer).pipe(stream)
            })
        )

        req.uploadedImages = await Promise.all(uploadPromises)
        next()
    } catch (error) {
        next(error)
    }
}

export const uploadExcelWithImages = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: Math.max(EXCEL_FILE_SIZE, MAX_FILE_SIZE) }, // lấy max trong 2
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'file') {
            // Kiểm tra size Excel thủ công vì multer limits áp dụng chung
            const ext = path.extname(file.originalname).toLowerCase()
            if (!['.xlsx', '.xls'].includes(ext))
                return cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'), false)
            cb(null, true)
        } else if (file.fieldname === 'images') {
            if (!file.mimetype.startsWith('image/'))
                return cb(new Error('Chỉ được phép tải lên file ảnh!'), false)
            cb(null, true)
        } else {
            cb(new Error('Field không hợp lệ'), false)
        }
    },
}).fields([
    { name: 'file', maxCount: 1 },
    { name: 'images', maxCount: 50 },
])

export const validateImportFiles = (req, res, next) => {
    // Check Excel size
    const excelFile = req.files?.file?.[0]
    if (excelFile && excelFile.size > EXCEL_FILE_SIZE)
        return res.status(400).json({ success: false, message: 'File Excel không được vượt quá 10MB' })

    // Check từng ảnh size
    const images = req.files?.images || []
    for (const img of images) {
        if (img.size > MAX_FILE_SIZE)
            return res.status(400).json({
                success: false,
                message: `Ảnh "${img.originalname}" không được vượt quá 5MB`
            })
    }

    next()
}