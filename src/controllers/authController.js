const path = require("path");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const {
  createOtpPayload,
  compareOtp,
  isOtpExpired,
  MAX_OTP_ATTEMPTS,
  MAX_RESEND_COUNT
} = require("../services/otpService");
const { sendOtpEmail } = require("../services/emailService");

const PASSWORD_SALT_ROUNDS = 12;

function renderRegisterView(req, res) {
  return res.sendFile(path.join(__dirname, "..", "views", "register.html"));
}

function renderLoginView(req, res) {
  return res.sendFile(path.join(__dirname, "..", "views", "login.html"));
}

function renderDashboardView(req, res) {
  return res.sendFile(path.join(__dirname, "..", "views", "dashboard.html"));
}

async function registerUser(req, res) {
  try {
    const fullName = req.body.fullName.trim();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;
    const termsAccepted =
      req.body.termsAccepted === true || req.body.termsAccepted === "true";
    const privacyAccepted =
      req.body.privacyAccepted === true || req.body.privacyAccepted === "true";

    let user = await userModel.findUserByEmail(email);

    if (user && user.is_verified) {
      return res.status(409).json({
        success: false,
        message: "Ese correo ya tiene una cuenta verificada."
      });
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    if (!user) {
      user = await userModel.createUser({
        fullName,
        email,
        passwordHash,
        termsAccepted,
        privacyAccepted
      });
    } else {
      user = await userModel.updateUnverifiedUser({
        userId: user.id,
        fullName,
        passwordHash,
        termsAccepted,
        privacyAccepted
      });
    }

    await userModel.invalidateActiveOtps(user.id);

    const { otpPlain, otpHash, expiresAt } = await createOtpPayload();

    await userModel.createOtpCode({
      userId: user.id,
      otpHash,
      expiresAt,
      resendCount: 0
    });

    await sendOtpEmail({
      to: email,
      fullName,
      otp: otpPlain
    });

    return res.status(200).json({
      success: true,
      message: "Código OTP enviado correctamente al correo.",
      email,
      expiresInSeconds: 300
    });
  } catch (error) {
    console.error("registerUser error:", error.message);

    return res.status(500).json({
      success: false,
      message: "No se pudo completar el registro."
    });
  }
}

async function verifyOtp(req, res) {
  try {
    const email = req.body.email.trim().toLowerCase();
    const otp = req.body.otp.trim().toUpperCase();

    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No existe una solicitud de registro para ese correo."
      });
    }

    if (user.is_verified) {
      return res.status(200).json({
        success: true,
        message: "La cuenta ya estaba verificada."
      });
    }

    const activeOtp = await userModel.getLatestActiveOtpByUserId(user.id);

    if (!activeOtp) {
      return res.status(400).json({
        success: false,
        message: "No existe un OTP activo para este usuario."
      });
    }

    if (isOtpExpired(activeOtp.expires_at)) {
      await userModel.markOtpAsConsumed(activeOtp.id);

      return res.status(400).json({
        success: false,
        message: "El código OTP expiró. Solicita uno nuevo."
      });
    }

    if (activeOtp.attempts >= MAX_OTP_ATTEMPTS) {
      await userModel.markOtpAsConsumed(activeOtp.id);

      return res.status(429).json({
        success: false,
        message: "Superaste el número máximo de intentos. Solicita un nuevo código."
      });
    }

    const otpMatches = await compareOtp(otp, activeOtp.otp_hash);

    if (!otpMatches) {
      const updatedOtp = await userModel.incrementOtpAttempts(activeOtp.id);
      const attemptsUsed = updatedOtp ? updatedOtp.attempts : activeOtp.attempts + 1;
      const attemptsLeft = Math.max(MAX_OTP_ATTEMPTS - attemptsUsed, 0);

      if (attemptsUsed >= MAX_OTP_ATTEMPTS) {
        await userModel.markOtpAsConsumed(activeOtp.id);

        return res.status(429).json({
          success: false,
          message: "Superaste el número máximo de intentos. Solicita un nuevo código."
        });
      }

      return res.status(400).json({
        success: false,
        message: `Código incorrecto. Intentos restantes: ${attemptsLeft}.`
      });
    }

    await userModel.markOtpAsConsumed(activeOtp.id);
    const verifiedUser = await userModel.markUserAsVerified(user.id);

    req.session.user = {
      id: verifiedUser.id,
      email: verifiedUser.email
    };

    return res.status(200).json({
      success: true,
      message: "Cuenta verificada correctamente."
    });
  } catch (error) {
    console.error("verifyOtp error:", error.message);

    return res.status(500).json({
      success: false,
      message: "No se pudo verificar el código."
    });
  }
}

async function resendOtp(req, res) {
  try {
    const email = req.body.email.trim().toLowerCase();

    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No existe una solicitud de registro para ese correo."
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "La cuenta ya está verificada."
      });
    }

    const lastOtp = await userModel.getLatestOtpByUserId(user.id);
    const nextResendCount = lastOtp ? Number(lastOtp.resend_count) + 1 : 1;

    if (nextResendCount > MAX_RESEND_COUNT) {
      return res.status(429).json({
        success: false,
        message: "Superaste el número permitido de reenvíos. Intenta más tarde."
      });
    }

    await userModel.invalidateActiveOtps(user.id);

    const { otpPlain, otpHash, expiresAt } = await createOtpPayload();

    await userModel.createOtpCode({
      userId: user.id,
      otpHash,
      expiresAt,
      resendCount: nextResendCount
    });

    await sendOtpEmail({
      to: email,
      fullName: user.full_name,
      otp: otpPlain
    });

    return res.status(200).json({
      success: true,
      message: "Nuevo código OTP enviado correctamente.",
      expiresInSeconds: 300
    });
  } catch (error) {
    console.error("resendOtp error:", error.message);

    return res.status(500).json({
      success: false,
      message: "No se pudo reenviar el código."
    });
  }
}

async function loginUser(req, res) {
  try {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Correo o contraseña incorrectos."
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Debes verificar tu cuenta antes de iniciar sesión."
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Correo o contraseña incorrectos."
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email
    };

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión correcto."
    });
  } catch (error) {
    console.error("loginUser error:", error.message);

    return res.status(500).json({
      success: false,
      message: "No se pudo iniciar sesión."
    });
  }
}

function getCurrentUser(req, res) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: "No hay una sesión activa."
    });
  }

  return res.status(200).json({
    success: true,
    user: req.session.user
  });
}

function logoutUser(req, res) {
  if (!req.session) {
    return res.status(200).json({
      success: true,
      message: "Sesión cerrada."
    });
  }

  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "No se pudo cerrar sesión."
      });
    }

    return res.clearCookie("connect.sid").status(200).json({
      success: true,
      message: "Sesión cerrada correctamente."
    });
  });
}

module.exports = {
  renderRegisterView,
  renderLoginView,
  renderDashboardView,
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getCurrentUser,
  logoutUser
};