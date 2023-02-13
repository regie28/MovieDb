import multer from "multer";
import path from "path";
import { infoLogger, errorLogger } from "../utils/logger.js"

export const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null,"./public/upload");
    },

    filename: (req, file, callback) => {
        const uniquePrefix =
        new Date().toLocaleString("sv-SE").replace(/[\s\:]/g,"-") + "-"
        Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        callback(null, uniquePrefix + extension);
    },
});

export const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpeg"
        ){
            callback(null, true);
        } else {
            errorLogger.error("Unsupported file")
            callback(null, false);
        }
    },
    limits: {
        filesSize: 1024 * 1024 * 3
    }
});