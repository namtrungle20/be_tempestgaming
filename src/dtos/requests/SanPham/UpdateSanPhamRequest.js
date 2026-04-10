import Joi from "joi";

class UpdateSanPhamRequest {
    // constructor(data) {
    //     this.name = data.name;
    //     this.mota = data.mota;
    //     this.gia = data.gia;
    //     this.soluong = data.soluong;
    //     this.loai_id = data.loai_id;
    //     this.thuonghieu_id = data.thuonghieu_id;
    //     this.deleteImageIds = data.deleteImageIds;
    //     this.setDefaultImageId = data.setDefaultImageId;
    // }
    static validate(data) {
        const schema = Joi.object({
            name: Joi.string().min(3).max(255).optional(),
            mota: Joi.string().min(10).optional(),
            gia: Joi.number().positive().optional(),
            soluong: Joi.number().integer().min(0).optional(),
            loai_id: Joi.number().integer().optional(),
            thuonghieu_id: Joi.number().integer().optional(),
            deleteImageIds: Joi.alternatives().try(
                Joi.string(),
                Joi.array().items(Joi.number())
            ).optional(),
            setDefaultImageId: Joi.number().integer().optional()
        }).min(1);
        return schema.validate(data);
    }
}
export default UpdateSanPhamRequest;