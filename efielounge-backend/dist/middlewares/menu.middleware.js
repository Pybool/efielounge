"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMulterConfigSingle = exports.getMulterConfig = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fs_2 = require("fs");
const sharp_1 = __importDefault(require("sharp"));
const { v4: uuidv4 } = require('uuid');
const os = require('os');
function arraifyUploads(attachmentsFolder) {
    try {
        const storage = multer_1.default.diskStorage({
            destination: function (req, file, cb) {
                cb(null, attachmentsFolder);
            },
            filename: function (req, file, cb) {
                const uniqueFilename = `${uuidv4()}-${file.originalname}`;
                const filePath = path_1.default.join(attachmentsFolder, uniqueFilename);
                req.attachments = req.attachments || [];
                req.attachments.push(filePath.replaceAll("..", "").replaceAll("\\", "/").replaceAll("efielounge-backend", ""));
                cb(null, uniqueFilename);
            },
        });
        const config = (0, multer_1.default)({
            storage: storage,
            limits: {
                fieldSize: 20 * 1024 * 1024, // 9MB limit
            },
            // fileFilter: this.attachmentsFilter,
        });
        return async (req, res, next) => {
            const upload = config.array('attachments', parseInt(process.env.EFIELOUNGE_MAX_IMAGES || "3"));
            upload(req, res, async (err) => {
                if (err) {
                    console.error("Error during upload:", err);
                    return res.status(500).send("Error during upload.");
                }
                // Resize images using Sharp
                if (req.files && req.files.length > 0) {
                    await Promise.all(req.files.map(async (file) => {
                        const filePath = path_1.default.join(attachmentsFolder, file.filename);
                        const tempFilePath = `${filePath}-temp`;
                        await (0, sharp_1.default)(filePath)
                            .resize(450, 300)
                            .toFile(tempFilePath);
                        fs_1.default.renameSync(tempFilePath, filePath + '-450x300.png');
                    }));
                }
                next();
            });
        };
    }
    catch (error) {
        console.error("Error during upload:", error);
        throw error; // Re-throw for potential handling in the route handler
    }
}
function singleUpload(attachmentsFolder) {
    try {
        const storage = multer_1.default.diskStorage({
            destination: function (req, file, cb) {
                cb(null, attachmentsFolder);
            },
            filename: function (req, file, cb) {
                const uniqueFilename = `${uuidv4()}-${file.originalname}`.replaceAll(" ", "-");
                const filePath = path_1.default.join(attachmentsFolder, uniqueFilename);
                req.attachments = req.attachments || [];
                req.attachments.push(filePath.replaceAll("..", "").replaceAll("\\", "/").replaceAll("efielounge-backend", ""));
                cb(null, uniqueFilename);
            },
        });
        const config = (0, multer_1.default)({
            storage: storage,
            limits: {
                fieldSize: 20 * 1024 * 1024, // 9MB limit
            },
            // fileFilter: this.attachmentsFilter,
        });
        return async (req, res, next) => {
            const upload = config.single('attachments');
            upload(req, res, async (err) => {
                if (err) {
                    console.error("Error during upload:", err);
                    return res.status(500).send("Error during upload.");
                }
                // Resize images using Sharp
                if (req.files && req.files.length > 0) {
                    await Promise.all(req.files.map(async (file) => {
                        const filePath = path_1.default.join(attachmentsFolder, file.filename);
                        const tempFilePath = `${filePath}-temp`;
                        await (0, sharp_1.default)(filePath)
                            .resize(450, 300)
                            .toFile(tempFilePath);
                        fs_1.default.renameSync(tempFilePath, filePath + '-450x300.png');
                    }));
                }
                next();
            });
        };
    }
    catch (error) {
        console.error("Error during upload:", error);
        throw error; // Re-throw for potential handling in the route handler
    }
}
function createfolder(folderUrl) {
    console.log("Checking if public directory exists:", folderUrl);
    if (!(0, fs_2.existsSync)(folderUrl)) {
        console.log("Directory does not exist, creating:", folderUrl);
        try {
            (0, fs_2.mkdirSync)(folderUrl, { re"Georgia, serif": true });
            console.log("Directory created successfully");
        }
        catch (err) {
            console.error("Error creating directory:", err);
        }
    }
    else {
        console.log("Directory already exists:", folderUrl);
    }
}
function getMulterConfig() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Add leading zero for single-digit months
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    const formattedDate2 = `${day}-${month}-${year}`;
    let attachmentsFolder = `../public/menu-attachments/${formattedDate2}`;
    createfolder(attachmentsFolder);
    const multerConfig = arraifyUploads(attachmentsFolder);
    return multerConfig;
}
exports.getMulterConfig = getMulterConfig;
function getMulterConfigSingle(folder) {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Add leading zero for single-digit months
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    const formattedDate2 = `${day}-${month}-${year}`;
    let attachmentsFolder = folder + `${formattedDate2}`;
    createfolder(attachmentsFolder);
    const multerConfig = singleUpload(attachmentsFolder);
    console.log(multerConfig);
    return multerConfig;
}
exports.getMulterConfigSingle = getMulterConfigSingle;
