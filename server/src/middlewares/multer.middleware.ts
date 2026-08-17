import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.resolve("public/temp");

console.log("Upload path:", uploadPath);

// Create temp folder if missing
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

export const upload = multer({
    storage
});