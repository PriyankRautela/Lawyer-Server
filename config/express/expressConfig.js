import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import cors from "cors";

export default function configureExpress(app) {

  app.use(
    cors({
      origin: "http://localhost:5173", // Frontend origin
      credentials: true,
    })
  );

  const generalLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 200,             // 200 requests per 10 seconds per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });

  
  const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,             // 20 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts, please wait a minute." },
  });

  if (process.env.NODE_ENV === "development") {
    console.log(" Rate limiting disabled in development mode");
  } else {
    app.use("/api/auth/", authLimiter);
    app.use("/api/", generalLimiter);
  }
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(cookieParser());

  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}
