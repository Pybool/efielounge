import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
