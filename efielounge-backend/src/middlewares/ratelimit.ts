import { rateLimit } from "express-rate-limit";

// export const limiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 2,
//   message: "Too many requests from this IP, please try again later.",
// });

// Store the timestamp of the last request for each IP
const requestTimestamps = new Map();

export const limiter = (req: any, res: any, next: any) => {
  const ip = req.ip;
  const currentTime = Date.now();
  
  if (requestTimestamps.has(ip)) {
    const lastRequestTime = requestTimestamps.get(ip);
    
    // Check if 30 seconds have passed since the last request
    if (currentTime - lastRequestTime < 30 * 1000) {
      return res.status(200).json({ 
        message: "oops!!, that's too frequent, please try again later." 
      });
    }
  }
  
  // Update the timestamp for the current request
  requestTimestamps.set(ip, currentTime);
  next();
};
