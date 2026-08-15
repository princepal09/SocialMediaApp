import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis.js";

interface rateLimiterOptions {
  windowMs: number;
  max: number;
  prefix: string;
  perUser?: boolean;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  prefix: string;
  perUser?: boolean;
}

export const rateLimiter = ({
  windowMs,
  max,
  prefix,
  perUser = false,
}: RateLimiterOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier =
        perUser && req.user?._id ? req.user._id.toString() : req.ip;

      console.log("Identifier:", identifier);
      console.log("Redis connected:", redisClient.isOpen);

      if (!identifier) {
        return next();
      }

      const key = `${prefix}:${identifier}`;
      const now = Date.now();
      const windowStart = now - windowMs;
      const expirySeconds = Math.ceil(windowMs / 1000);

      const multi = redisClient.multi();

      multi.zRemRangeByScore(key, 0, windowStart);

      multi.zAdd(key, {
        score: now,
        value: `${now}-${Math.random()}`,
      });

      multi.zCard(key);

      multi.expire(key, expirySeconds);

      const results = await multi.exec();
      console.log("Redis results:", results);

      const result = results?.[2];

      const requestCount = typeof result === "number" ? result : 0;
      console.log({
        key,
        requestCount,
        max,
      });

      if (requestCount > max) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      return next();
    } catch (error) {
      console.error("Rate Limiter Error:", error);

      return res.status(500).json({
        success: false,
        message: "Rate limiter failed",
      });
    }
  };
};
