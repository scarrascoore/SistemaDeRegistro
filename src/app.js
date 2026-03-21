const express = require("express");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { pool } = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiadas solicitudes. Intenta nuevamente más tarde."
  }
});

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(generalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: new pgSession({
      pool,
      tableName: "user_sessions"
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/", authRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server running correctly"
  });
});

module.exports = app;