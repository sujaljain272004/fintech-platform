const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const env = require("./config/env");
const apiRoutes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = new Set(env.frontendUrls.length ? env.frontendUrls : [env.frontendUrl]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/healthz", (req, res) => {
  res.json({
    success: true,
    message: "FinLink backend is healthy.",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FinLink API is running.",
  });
});

app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`FinLink backend running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start backend server", error);
  process.exit(1);
});
