const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { handleValidationResults } = require("../middlewares/validationMiddleware");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados intentos de registro. Intenta nuevamente en unos minutos."
  }
});

const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados intentos de verificación. Intenta nuevamente más tarde."
  }
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados reenvíos de OTP. Intenta nuevamente más tarde."
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados intentos de login. Intenta nuevamente más tarde."
  }
});

router.get("/", authController.renderRegisterView);
router.get("/register", authController.renderRegisterView);
router.get("/login", authController.renderLoginView);
router.get("/dashboard", requireAuth, authController.renderDashboardView);
router.get("/forgot-password", authController.renderForgotPasswordView);

router.post(
  "/api/auth/register",
  registerLimiter,
  [
    body("fullName")
      .trim()
      .notEmpty().withMessage("El nombre completo es obligatorio.")
      .isLength({ min: 3, max: 120 }).withMessage("El nombre debe tener entre 3 y 120 caracteres."),
    body("email")
      .trim()
      .notEmpty().withMessage("El correo es obligatorio.")
      .isEmail().withMessage("El correo electrónico no es válido.")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8, max: 64 }).withMessage("La contraseña debe tener entre 8 y 64 caracteres."),
    body("termsAccepted")
      .custom((value) => value === true || value === "true")
      .withMessage("Debes aceptar los Términos de Servicio."),
    body("privacyAccepted")
      .custom((value) => value === true || value === "true")
      .withMessage("Debes aceptar la Política de Privacidad.")
  ],
  handleValidationResults,
  authController.registerUser
);

router.post(
  "/api/auth/verify-otp",
  verifyLimiter,
  [
    body("email")
      .trim()
      .notEmpty().withMessage("El correo es obligatorio.")
      .isEmail().withMessage("El correo electrónico no es válido.")
      .normalizeEmail(),
    body("otp")
      .trim()
      .matches(/^[A-Za-z0-9]{6}$/).withMessage("El OTP debe tener 6 caracteres alfanuméricos.")
  ],
  handleValidationResults,
  authController.verifyOtp
);

router.post(
  "/api/auth/resend-otp",
  resendLimiter,
  [
    body("email")
      .trim()
      .notEmpty().withMessage("El correo es obligatorio.")
      .isEmail().withMessage("El correo electrónico no es válido.")
      .normalizeEmail()
  ],
  handleValidationResults,
  authController.resendOtp
);

router.post(
  "/api/auth/login",
  loginLimiter,
  [
    body("email")
      .trim()
      .notEmpty().withMessage("El correo es obligatorio.")
      .isEmail().withMessage("El correo electrónico no es válido.")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8, max: 64 }).withMessage("La contraseña debe tener entre 8 y 64 caracteres.")
  ],
  handleValidationResults,
  authController.loginUser
);

router.get("/api/auth/me", authController.getCurrentUser);
router.post("/api/auth/logout", authController.logoutUser);

router.post(
  "/api/auth/forgot-password",
  resendLimiter,
  [
    body("email")
      .trim()
      .notEmpty().withMessage("El correo es obligatorio.")
      .isEmail().withMessage("El correo electrónico no es válido.")
      .normalizeEmail()
  ],
  handleValidationResults,
  authController.forgotPassword
);


router.post(
  "/api/auth/verify-reset-otp",
  verifyLimiter,
  [
    body("email")
      .trim()
      .notEmpty().withMessage("El correo es obligatorio.")
      .isEmail().withMessage("El correo electrónico no es válido.")
      .normalizeEmail(),
    body("otp")
      .trim()
      .matches(/^[A-Za-z0-9]{6}$/).withMessage("El OTP debe tener 6 caracteres alfanuméricos.")
  ],
  handleValidationResults,
  authController.verifyResetOtp
);

router.post(
  "/api/auth/reset-password",
  verifyLimiter,
  [
    body("email")
      .trim()
      .notEmpty().withMessage("El correo es obligatorio.")
      .isEmail().withMessage("El correo electrónico no es válido.")
      .normalizeEmail(),
    body("newPassword")
      .isLength({ min: 8, max: 64 }).withMessage("La nueva contraseña debe tener entre 8 y 64 caracteres.")
  ],
  handleValidationResults,
  authController.resetPassword
);



module.exports = router;