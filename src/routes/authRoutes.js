const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", authController.renderRegisterView);
router.get("/register", authController.renderRegisterView);
router.get("/login", authController.renderLoginView);

router.post("/api/auth/register", authController.registerUserMock);
router.post("/api/auth/verify-otp", authController.verifyOtpMock);
router.post("/api/auth/resend-otp", authController.resendOtpMock);

module.exports = router;