import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinaryConfig.js';
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const db = require('../models');
import db from "../models/index.js";
import { fileURLToPath } from 'url';
import { where } from 'sequelize';



export async function uploadImages(req, res) {
    if (!req.files || req.files.length === 0) {
        throw new Error('Không có file nào được tải lên')
    }
    const uploadImagePaths = req.files.map(file => ({
        filename: path.basename(file.path),
        originalname: file.originalname
    }));
    res.status(201).json({
        message: 'Tải ảnh thành công',
        file: uploadImagePaths
    })
}

export async function uploadImageToCloudinaryStorage(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: 'Không có file ảnh nào được upload!' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'Images', // 📂 folder trên Cloudinary
    });

    req.imageUrl = result.secure_url;

    // Xoá file tạm sau khi upload
    fs.unlink(req.file.path, (err) => {
        if (err) console.error('Lỗi khi xoá file tạm:', err);
    });
    // Trả kết quả về client
    return res.status(201).json({
        message: 'Tải ảnh lên Cloudinary thành công',
        file: result.secure_url,
        public_id: result.public_id, // thêm id để sau này xoá/sửa ảnh dễ hơn
    });

}

async function checkImageInUse(imageUrl) {
    const checks = [
        { model: db.NguoiDung, field: 'avatar' },
        { model: db.ThuongHieu, field: 'image' },
        { model: db.SanPham, field: 'image' },
        { model: db.LoaiSanPham, field: 'image' },
    ];

    for (let { model, field } of checks) {
        const result = await model.findOne({ where: { [field]: imageUrl } });
        if (result) {
            return { inUse: true, model: model.name || 'Unknown', field };
        }
    }

    return { inUse: false };
}



export async function deleteImage(req, res) {
    const { url: rawUrl } = req.body;

    // 1. Kiểm tra đầu vào
    if (!rawUrl || typeof rawUrl !== 'string') {
        return res.status(400).json({ message: 'Thiếu đường dẫn ảnh cần xoá!' });
    }

    const url = rawUrl.trim();

    // 2. Kiểm tra ảnh có đang được sử dụng trong DB không (Dùng hàm check đã viết của ông)
    const check = await checkImageInUse(url);
    if (check.inUse) {
        return res.status(400).json({
            message: `Ảnh đang được sử dụng trong {${check.model}.${check.field}}, không thể xoá!`,
        });
    }

    // 3. Xử lý xóa ảnh trên Cloudinary
    if (url.includes('https://res.cloudinary.com/')) {
        try {
            const parts = url.split('/');
            const fileName = parts.pop();
            let afterUpload = parts.slice(parts.indexOf('upload') + 1);

            // Bỏ version (v123...)
            if (afterUpload[0]?.startsWith('v') && !isNaN(afterUpload[0].substring(1))) {
                afterUpload = afterUpload.slice(1);
            }

            const folder = afterUpload.join('/');
            const publicId = folder + '/' + fileName.split('.')[0];

            const result = await cloudinary.uploader.destroy(publicId);

            if (result.result === 'ok') {
                return res.status(200).json({ message: 'Ảnh Cloudinary đã được xoá thành công!' });
            } else {
                return res.status(404).json({ message: 'Không tìm thấy ảnh trên Cloudinary (có thể đã xóa trước đó)!' });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi khi xóa ảnh trên Cloudinary', error: error.message });
        }
    }

    // 4. Xử lý xóa ảnh Local (Dùng fs.promises để code sạch hơn)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        try {
            // Lấy đúng tên file từ URL gửi lên (tránh lỗi path nếu gửi kèm slug/api/images/)
            const fileName = path.basename(url);
            const filePath = path.join(process.cwd(), 'uploads', fileName);

            // Kiểm tra xem file có thực sự tồn tại trên đĩa không trước khi xóa
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
                return res.status(200).json({ message: 'Ảnh local đã được xoá thành công!' });
            } else {
                // Nếu không thấy file trên đĩa, coi như đã xóa để tránh báo lỗi cho người dùng
                return res.status(200).json({ message: 'File không tồn tại trên hệ thống, coi như đã xóa.' });
            }
        } catch (error) {
            console.error("Lỗi xóa file local:", error);
            return res.status(500).json({ message: 'Lỗi hệ thống khi xóa file ảnh local' });
        }
    }

    return res.status(400).json({ message: 'Định dạng URL hoặc Host không được hỗ trợ!' });
}



export async function viewImage(req, res) {
    try {
        const { fileName } = req.params
        const decodedFileName = decodeURIComponent(fileName);
        const imagePath = path.join(process.cwd(), 'uploads', decodedFileName);
        if (fs.existsSync(imagePath)) {
            return res.sendFile(imagePath);
        } else {
            console.error("Không tìm thấy file tại:", imagePath);
            return res.status(404).send('Không tìm thấy ảnh');
        }
    } catch (error) {
        console.error("Lỗi viewImage:", error);
        return res.status(500).send('Lỗi server khi hiển thị ảnh');
    }
}

export async function getAllCloudinaryImages(req, res) {
    const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'image',
        max_results: 100, // số lượng ảnh tối đa trả về
    });

    const images = result.resources.map((img) => ({
        public_id: img.public_id,
        url: img.secure_url,
        format: img.format,
        created_at: img.created_at,
        bytes: img.bytes,
        width: img.width,
        height: img.height,
        folder: img.folder || null,
    }));

    return res.status(200).json({ images });

}