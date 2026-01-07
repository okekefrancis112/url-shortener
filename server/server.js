const express = require("express");
const authRouter = require("./routes/auth");
const urlRouter = require("./routes/url");
const cors = require("cors");

//To access data from .env file
const dotenv = require("dotenv");
const userRouter = require("./routes/user");
dotenv.config();

//create express app
const app = express();
app.use(express.json());

//Define port
const port = process.env.PORT || 8080;

// Check environment
const isProduction = process.env.NODE_ENV === "production";

// FIXED CORS Configuration for Vercel
const corsOptions = {
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Always allow localhost in development
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return callback(null, true);
    }

    // 3. In production, allow:
    if (isProduction) {
      // a) Your main Vercel URL
      if (origin === process.env.CLIENT_PROD_URL) {
        return callback(null, true);
      }

      // b) ALL Vercel domains (main + preview deployments)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // c) Your Render domain (optional)
      if (origin.includes('.onrender.com')) {
        return callback(null, true);
      }
    }

    // 4. Block everything else
    console.log('🚫 CORS blocked:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Disable X-Powered-By Header
app.disable("x-powered-by");

app.set("trust proxy", true);

// Health check endpoint (add this for Render/Vercel monitoring)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

//get request when server is live
app.get("/", (req, res) => {
  res.status(200).json("Server is Live");
});

app.use(urlRouter);
app.use(authRouter);
app.use(userRouter);

//create a server
app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS configured for: ${isProduction ? 'Production' : 'Development'}`);
});
