const path = require("path");

function renderRegisterView(req, res) {
  return res.sendFile(path.join(__dirname, "..", "views", "register.html"));
}

function renderLoginView(req, res) {
  return res.sendFile(path.join(__dirname, "..", "views", "login.html"));
}

function registerUserMock(req, res) {
  const { fullName, email, password, termsAccepted, privacyAccepted } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios."
    });
  }

  if (String(termsAccepted) !== "true" || String(privacyAccepted) !== "true") {
    return res.status(400).json({
      success: false,
      message: "Debes aceptar Términos de Servicio y Política de Privacidad."
    });
  }

  return res.status(200).json({
    success: true,
    message: "Código OTP enviado correctamente (simulado).",
    email
  });
}

function verifyOtpMock(req, res) {
  const { otp } = req.body;

  const otpPattern = /^[A-Za-z0-9]{6}$/;

  if (!otp || !otpPattern.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "El código OTP debe tener 6 caracteres alfanuméricos."
    });
  }

  return res.status(200).json({
    success: true,
    message: "Cuenta verificada correctamente (simulado)."
  });
}

function resendOtpMock(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "No se pudo reenviar el código porque falta el correo."
    });
  }

  return res.status(200).json({
    success: true,
    message: "Nuevo código OTP reenviado correctamente (simulado)."
  });
}

module.exports = {
  renderRegisterView,
  renderLoginView,
  registerUserMock,
  verifyOtpMock,
  resendOtpMock
};