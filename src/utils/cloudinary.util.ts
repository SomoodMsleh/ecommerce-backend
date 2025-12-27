import cloudinary from "../config/cloudinary.config.js";


export const uploadToCloudinary = async (buffer: Buffer, folder: string): Promise<{ secure_url: string, public_id: string }> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder,
            transformation: [
                { width: 400, height: 400, crop: "fill" },
                { quality: "auto" }
            ]
        },
            (error, result) => {
                if (error || !result) {
                    return reject(error);
                }
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });

            },

        );
        stream.end(buffer);
    });
};


export const deleteFromCloudinary = async (public_id: string) => {
    return await cloudinary.uploader.destroy(public_id);
}