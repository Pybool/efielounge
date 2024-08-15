import bcrypt from "bcryptjs";
import { redisClient } from "../../../setup/init.redis";
const gredisClient = redisClient.generic


export const setExpirableCode = async (
  email: string,
  prefix: string,
  code: string,
  EXP: number = 300
) => {
  const cacheKey = prefix + email;
  await gredisClient.set(
    cacheKey,
    JSON.stringify({ email: email, code: code }),
    "EX",
    EXP
  )
}
  
  export const setExpirablePhoneCode = async (
    phone: string,
    prefix: string,
    code: string,
    EXP: number = 300
  ) => {
    const cacheKey = prefix + phone;
    await gredisClient.set(
      cacheKey,
      JSON.stringify({ phone: phone, code: code }),
      "EX",
      EXP
    );
};

export const setExpirableAccountData = async (
  emailOrPhone: string,
  prefix: string,
  data: any,
  EXP: number = 300
) => {
  try {
    const cacheKey = prefix + emailOrPhone;
    await gredisClient.set(cacheKey, JSON.stringify(data), "EX", EXP);
    return true;
  } catch {
    return false;
  }
};

export const getExpirableCode = async (prefix: string, emailOrPhone: string) => {
  const cacheKey = prefix + emailOrPhone;
  const codeCached = await gredisClient.get(cacheKey);
  const ttl = await gredisClient.ttl(cacheKey);

  if (codeCached !== null && ttl >= 0) {
    return JSON.parse(codeCached);
  } else {
    await gredisClient.del(cacheKey);
    return null;
  }
};

export const getExpirablePhoneCode = async (prefix: string, phone: string) => {
  const cacheKey = prefix + phone;
  const codeCached = await gredisClient.get(cacheKey);
  const ttl = await gredisClient.ttl(cacheKey);

  if (codeCached !== null && ttl >= 0) {
    return JSON.parse(codeCached);
  } else {
    await gredisClient.del(cacheKey);
    return null;
  }
};

export const getExpirableAccountData = async (
  prefix: string,
  emailOrPhone: string
) => {
  const cacheKey = prefix + emailOrPhone;
  const accountDataCached = await gredisClient.get(cacheKey);
  const ttl = await gredisClient.ttl(cacheKey);

  if (accountDataCached !== null && ttl >= 0) {
    return JSON.parse(accountDataCached);
  } else {
    await gredisClient.del(cacheKey);
    return null;
  }
};

export const generateOtp = () => {
  const otp: number = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
};

export async function makePassword(password: string) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw error;
  }
}

export const deleteExpirableCode = async (key: string) => {
  await gredisClient.del(key);
};
