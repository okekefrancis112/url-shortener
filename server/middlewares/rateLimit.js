const redisClient = require("../config/redis");

const rateLimit = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const key = `rate-limit:${ip}`;

    // Get current count
    const current = await redisClient.get(key);
    const currentCount = current ? parseInt(current) : 0;

    // Check if limit exceeded
    const limit = parseInt(process.env.HITS_COUNT_LIMIT) || 100;
    if (currentCount >= limit) {
      return res.status(429).json({
        status: "Failed",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: process.env.EXPIRATION_TIME || 60
      });
    }

    // Increment count
    await redisClient.incr(key);

    // Set expiration on first request
    if (currentCount === 0) {
      const expiration = parseInt(process.env.EXPIRATION_TIME) || 60;
      await redisClient.expire(key, expiration);
    }

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Allow request if Redis fails
    next();
  }
};

module.exports = rateLimit;