// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");

// dotenv.config();

// const isAuthenticated = async (req, res, next) => {
//   try {
//     // Get access token from request header
//     const token = req.header("auth-token");

//     // Check token exists or not
//     if (!token) {
//       return res.status(401).json({
//         message: "Authentication token is missing",
//       });
//     } else {
//       // Check user is authenticated or not
//       const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//       if (decoded) {
//         // Attach decoded token payload to req.user
//         //req.userId = decoded.id;
//         next();
//       } else {
//         return res.status(401).json({
//           message: "Invalid token",
//         });
//       }
//     }
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// module.exports = isAuthenticated;

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const isAuthenticated = async (req, res, next) => {
  try {
    // Get access token from request header
    let token = null;

    // First, check for Bearer token in Authorization header (standard)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // If not found, check for 'auth-token' header (legacy support)
    if (!token && req.headers['auth-token']) {
      token = req.headers['auth-token'];
    }

    // Check token exists or not
    if (!token) {
      return res.status(401).json({
        message: "Authentication token is missing",
        details: "Please provide a token in Authorization header as 'Bearer <token>' or in 'auth-token' header"
      });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Attach decoded user information to request object
      req.user = decoded;

      // Try multiple possible field names
      req.userId = decoded.id || decoded._id || decoded.userId;

      next();
    } catch (jwtError) {
      console.error("JWT Verification Error:", jwtError.message);
      console.error("JWT Error Name:", jwtError.name);

      // Handle specific JWT errors
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: "Token has expired",
          details: "Please login again to get a new token"
        });
      }

      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: "Invalid token",
          details: "The provided token is malformed or invalid"
        });
      }

      // Generic JWT error
      return res.status(401).json({
        message: "Authentication failed",
        details: jwtError.message
      });
    }
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      message: "Internal server error during authentication",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = isAuthenticated;