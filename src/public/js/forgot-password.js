const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const recoveryEmailInput = document.getElementById("recoveryEmail");
const recoveryMessage = document.getElementById("recoveryMessage");
const sendRecoveryOtpButton = document.getElementById("sendRecoveryOtpButton");

const resetSection = document.getElementById("resetSection");
const recoveryOtpInput = document.getElementById("recoveryOtp");
const recoveryCountdownText = document.getElementById("recoveryCountdownText");
const otpVerifyMessage = document.getElementById("otpVerifyMessage");
const verifyRecoveryOtpButton = document.getElementById("verifyRecoveryOtpButton");
const resendRecoveryOtpButton = document.getElementById("resendRecoveryOtpButton");

const newPasswordInput = document.getElementById("newPassword");
const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
const resetMessage = document.getElementById("resetMessage");
const resetPasswordButton = document.getElementById("resetPasswordButton");

const toggleNewPasswordButton = document.getElementById("toggleNewPassword");
const toggleConfirmNewPasswordButton = document.getElementById("toggleConfirmNewPassword");

const recoveryState = {
  email: "",
  seconds: 300,
  timer: null,
  otpVerified: false
};

function setMessage(element, message, type) {
  element.textContent = message;
  element.classList.remove("success", "error");

  if (type) {
    element.classList.add(type);
  }
}

function clearMessage(element) {
  element.textContent = "";
  element.classList.remove("success", "error");
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateRecoveryCountdown() {
  recoveryCountdownText.textContent = formatTime(recoveryState.seconds);
}

function startRecoveryCountdown(seconds = 300) {
  if (recoveryState.timer) {
    clearInterval(recoveryState.timer);
  }

  recoveryState.seconds = seconds;
  resendRecoveryOtpButton.disabled = true;
  updateRecoveryCountdown();

  recoveryState.timer = setInterval(() => {
    recoveryState.seconds -= 1;
    updateRecoveryCountdown();

    if (recoveryState.seconds <= 0) {
      clearInterval(recoveryState.timer);
      recoveryState.timer = null;
      recoveryState.seconds = 0;
      updateRecoveryCountdown();
      resendRecoveryOtpButton.disabled = false;
    }
  }, 1000);
}

function togglePasswordVisibility(button, input) {
  const isVisible = input.type === "text";
  input.type = isVisible ? "password" : "text";

  button.innerHTML = isVisible
    ? '<i class="bi bi-eye-slash"></i>'
    : '<i class="bi bi-eye"></i>';

  button.setAttribute(
    "aria-label",
    isVisible ? "Mostrar contraseña" : "Ocultar contraseña"
  );
}

function setResetControlsEnabled(enabled) {
  newPasswordInput.disabled = !enabled;
  confirmNewPasswordInput.disabled = !enabled;
  toggleNewPasswordButton.disabled = !enabled;
  toggleConfirmNewPasswordButton.disabled = !enabled;
  resetPasswordButton.disabled = !enabled;
}

function resetVerificationState() {
  recoveryState.otpVerified = false;
  setResetControlsEnabled(false);
  newPasswordInput.value = "";
  confirmNewPasswordInput.value = "";
  clearMessage(resetMessage);
}

async function sendRecoveryOtp(event) {
  event.preventDefault();

  const email = recoveryEmailInput.value.trim();

  if (!email) {
    setMessage(recoveryMessage, "Ingresa tu correo.", "error");
    return;
  }

  sendRecoveryOtpButton.disabled = true;
  sendRecoveryOtpButton.textContent = "Enviando...";

  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(recoveryMessage, result.message || "No se pudo enviar el código.", "error");
      return;
    }

    recoveryState.email = email;
    setMessage(recoveryMessage, result.message, "success");
    clearMessage(otpVerifyMessage);
    resetVerificationState();
    recoveryOtpInput.value = "";
    resetSection.classList.remove("hidden");
    startRecoveryCountdown(result.expiresInSeconds || 300);
  } catch (error) {
    setMessage(recoveryMessage, "Ocurrió un error inesperado.", "error");
  } finally {
    sendRecoveryOtpButton.disabled = false;
    sendRecoveryOtpButton.textContent = "Enviar código de recuperación";
  }
}

async function verifyRecoveryOtp() {
  const otp = recoveryOtpInput.value.trim().toUpperCase();

  if (!otp || otp.length !== 6) {
    setMessage(otpVerifyMessage, "Ingresa un OTP válido de 6 caracteres.", "error");
    return;
  }

  verifyRecoveryOtpButton.disabled = true;
  verifyRecoveryOtpButton.textContent = "Verificando...";

  try {
    const response = await fetch("/api/auth/verify-reset-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: recoveryState.email,
        otp
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(otpVerifyMessage, result.message || "No se pudo verificar el código.", "error");
      return;
    }

    recoveryState.otpVerified = true;
    setMessage(otpVerifyMessage, result.message, "success");
    setResetControlsEnabled(true);
    newPasswordInput.focus();
  } catch (error) {
    setMessage(otpVerifyMessage, "Ocurrió un error inesperado.", "error");
  } finally {
    verifyRecoveryOtpButton.disabled = false;
    verifyRecoveryOtpButton.textContent = "Verificar código";
  }
}

async function resetPassword() {
  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;

  if (!recoveryState.otpVerified) {
    setMessage(resetMessage, "Primero debes verificar el código OTP.", "error");
    return;
  }

  if (newPassword.length < 8) {
    setMessage(resetMessage, "La nueva contraseña debe tener al menos 8 caracteres.", "error");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    setMessage(resetMessage, "Las contraseñas no coinciden.", "error");
    return;
  }

  resetPasswordButton.disabled = true;
  resetPasswordButton.textContent = "Actualizando...";

  try {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: recoveryState.email,
        newPassword
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(resetMessage, result.message || "No se pudo restablecer la contraseña.", "error");
      return;
    }

    setMessage(resetMessage, result.message, "success");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  } catch (error) {
    setMessage(resetMessage, "Ocurrió un error inesperado.", "error");
  } finally {
    resetPasswordButton.disabled = false;
    resetPasswordButton.textContent = "Restablecer contraseña";
  }
}

async function resendRecoveryOtp() {
  if (resendRecoveryOtpButton.disabled) {
    return;
  }

  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: recoveryState.email
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(otpVerifyMessage, result.message || "No se pudo reenviar el código.", "error");
      return;
    }

    recoveryState.otpVerified = false;
    recoveryOtpInput.value = "";
    clearMessage(otpVerifyMessage);
    resetVerificationState();
    setMessage(otpVerifyMessage, result.message, "success");
    startRecoveryCountdown(result.expiresInSeconds || 300);
  } catch (error) {
    setMessage(otpVerifyMessage, "Ocurrió un error inesperado.", "error");
  }
}

forgotPasswordForm.addEventListener("submit", sendRecoveryOtp);
verifyRecoveryOtpButton.addEventListener("click", verifyRecoveryOtp);
resetPasswordButton.addEventListener("click", resetPassword);
resendRecoveryOtpButton.addEventListener("click", resendRecoveryOtp);

toggleNewPasswordButton.addEventListener("click", () => {
  togglePasswordVisibility(toggleNewPasswordButton, newPasswordInput);
});

toggleConfirmNewPasswordButton.addEventListener("click", () => {
  togglePasswordVisibility(toggleConfirmNewPasswordButton, confirmNewPasswordInput);
});

updateRecoveryCountdown();
setResetControlsEnabled(false);
toggleNewPasswordButton.innerHTML = '<i class="bi bi-eye-slash"></i>';
toggleConfirmNewPasswordButton.innerHTML = '<i class="bi bi-eye-slash"></i>';