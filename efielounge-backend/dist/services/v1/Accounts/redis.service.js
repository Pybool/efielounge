"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpirableCode = exports.makePassword = exports.generateOtp = exports.getExpirableAccountData = exports.getExpirableCode = exports.setExpirableAccountData = exports.setExpirableCode = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const init_redis_1 = require("../../../setup/init.redis");
const gredisClient = init_redis_1.redisClient.generic;
const setExpirableCode = async (email, prefix, code, EXP = 300) => {
    const cacheKey = prefix + email;
    await gredisClient.set(cacheKey, JSON.stringify({ email: email, code: code }), "EX", EXP);
};
exports.setExpirableCode = setExpirableCode;
const setExpirableAccountData = async (email, prefix, data, EXP = 300) => {
    try {
        const cacheKey = prefix + email;
        await gredisClient.set(cacheKey, JSON.stringify(data), "EX", EXP);
        return true;
    }
    catch {
        return false;
    }
};
exports.setExpirableAccountData = setExpirableAccountData;
const getExpirableCode = async (prefix, email) => {
    const cacheKey = prefix + email;
    const codeCached = await gredisClient.get(cacheKey);
    const ttl = await gredisClient.ttl(cacheKey);
    if (codeCached !== null && ttl >= 0) {
        return JSON.parse(codeCached);
    }
    else {
        await gredisClient.del(cacheKey);
        return null;
    }
};
exports.getExpirableCode = getExpirableCode;
const getExpirableAccountData = async (prefix, email) => {
    const cacheKey = prefix + email;
    const accountDataCached = await gredisClient.get(cacheKey);
    const ttl = await gredisClient.ttl(cacheKey);
    if (accountDataCached !== null && ttl >= 0) {
        return JSON.parse(accountDataCached);
    }
    else {
        await gredisClient.del(cacheKey);
        return null;
    }
};
exports.getExpirableAccountData = getExpirableAccountData;
const generateOtp = () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp.toString();
};
exports.generateOtp = generateOtp;
async function makePassword(password) {
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        return hashedPassword;
    }
    catch (error) {
        throw error;
    }
}
exports.makePassword = makePassword;
const deleteExpirableCode = async (key) => {
    await gredisClient.del(key);
};
exports.deleteExpirableCode = deleteExpirableCode;
