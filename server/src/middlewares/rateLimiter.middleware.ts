import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis.js";

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

      const result = results?.[2];

      const requestCount = typeof result === "number" ? result : 0;

      if (requestCount > max) {
        return res.set("Retry-After", String(expirySeconds)).status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      return next();
    } catch (error) {
      console.error("Rate Limiter Error:", error);

      return res.status(503).json({
        success: false,
        message: "Pixora is temporarily unavailable. Please try again.",
      });
    }
  };
};
