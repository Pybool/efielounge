"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
const logger_1 = __importDefault(require("./logger"));
(0, dotenv_1.config)();
const mongouri = process.env.MONGODB_URI;
logger_1.default.info("MONGO_URI: " + mongouri);
logger_1.default.info("DATABASE NAME " + process.env.DATABASE_NAME);
mongoose_1.default
    .connect(mongouri, {
    dbName: process.env.DATABASE_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
    logger_1.default.info('MongoDB connected Successfully.');
})
    .catch((err) => logger_1.default.info(err.message));
mongoose_1.default.connection.on('connected', () => {
    logger_1.default.info('Mongoose connected to db');
});
mongoose_1.default.connection.on('error', (err) => {
    logger_1.default.info(err.message);
});
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.default.info('Mongoose connection is disconnected');
});
process.on('SIGINT', async () => {
    await mongoose_1.default.connection.close();
    process.exit(0);
});
