const registerForm = document.getElementById("registerForm");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePasswordButton = document.getElementById("togglePassword");

const strengthBar1 = document.getElementById("strengthBar1");
const strengthBar2 = document.getElementById("strengthBar2");
const strengthBar3 = document.getElementById("strengthBar3");
const passwordStrengthText = document.getElementById("passwordStrengthText");

const acceptanceCheckbox = document.getElementById("acceptanceCheckbox");
const termsAcceptedInput = document.getElementById("termsAccepted");
const privacyAcceptedInput = document.getElementById("privacyAccepted");

const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");

const modalBackdrop = document.getElementById("modalBackdrop");
const termsModal = document.getElementById("termsModal");
const privacyModal = document.getElementById("privacyModal");
const otpModal = document.getElementById("otpModal");

const openTermsLink = document.getElementById("openTermsLink");
const openPrivacyLink = document.getElementById("openPrivacyLink");
const acceptTermsButton = document.getElementById("acceptTermsButton");
const acceptPrivacyButton = document.getElementById("acceptPrivacyButton");

const otpEmailText = document.getElementById("otpEmailText");
const otpInputs = Array.from(document.querySelectorAll(".otp-input"));
const verifyOtpButton = document.getElementById("verifyOtpButton");
const resendOtpButton = document.getElementById("resendOtpButton");
const otpCountdown = document.getElementById("otpCountdown");
const otpMessage = document.getElementById("otpMessage");

const state = {
  termsAccepted: false,
  privacyAccepted: false,
  otpSeconds: 300,
  otpTimer: null,
  registeredEmail: ""
};

function showMessage(element, message, type) {
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

function openModal(modalElement) {
  modalBackdrop.classList.remove("hidden");
  modalElement.classList.remove("hidden");
  modalElement.setAttribute("aria-hidden", "false");
}

function closeModal(modalElement) {
  modalElement.classList.add("hidden");
  modalElement.setAttribute("aria-hidden", "true");

  const anyModalOpen = !termsModal.classList.contains("hidden")
    || !privacyModal.classList.contains("hidden")
    || !otpModal.classList.contains("hidden");

  if (!anyModalOpen) {
    modalBackdrop.classList.add("hidden");
  }
}

function syncAcceptanceState() {
  termsAcceptedInput.value = String(state.termsAccepted);
  privacyAcceptedInput.value = String(state.privacyAccepted);
  acceptanceCheckbox.checked = state.termsAccepted && state.privacyAccepted;
}

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
}

function updatePasswordStrength() {
  const password = passwordInput.value;
  const strength = getPasswordStrength(password);

  [strengthBar1, strengthBar2, strengthBar3].forEach((bar) => {
    bar.classList.remove("weak", "medium", "strong");
  });

  if (!password) {
    passwordStrengthText.textContent = "La contraseña debe tener al menos 8 caracteres.";
    return;
  }

  if (strength === 1) {
    strengthBar1.classList.add("weak");
    passwordStrengthText.textContent = "Contraseña débil.";
    return;
  }

  if (strength === 2) {
    strengthBar1.classList.add("medium");
    strengthBar2.classList.add("medium");
    passwordStrengthText.textContent = "Contraseña media.";
    return;
  }

  if (strength >= 3) {
    strengthBar1.classList.add("strong");
    strengthBar2.classList.add("strong");
    strengthBar3.classList.add("strong");
    passwordStrengthText.textContent = "Contraseña fuerte.";
  }
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function resetOtpInputs() {
  otpInputs.forEach((input) => {
    input.value = "";
  });

  otpInputs[0].focus();
}

function getOtpValue() {
  return otpInputs.map((input) => input.value.trim().toUpperCase()).join("");
}

function startOtpCountdown() {
  if (state.otpTimer) {
    clearInterval(state.otpTimer);
  }

  state.otpSeconds = 300;
  otpCountdown.textContent = formatTime(state.otpSeconds);
  resendOtpButton.disabled = true;

  state.otpTimer = setInterval(() => {
    state.otpSeconds -= 1;
    otpCountdown.textContent = formatTime(state.otpSeconds);

    if (state.otpSeconds <= 0) {
      clearInterval(state.otpTimer);
      state.otpTimer = null;
      resendOtpButton.disabled = false;
      resendOtpButton.innerHTML = 'Reenviar código';
    }
  }, 1000);

  resendOtpButton.innerHTML = `Reenviar código en <span id="otpCountdown">${formatTime(state.otpSeconds)}</span>`;
}

function validateForm() {
  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!fullName || !email || !password) {
    showMessage(formMessage, "Completa todos los campos.", "error");
    return false;
  }

  if (fullName.length < 3) {
    showMessage(formMessage, "Ingresa un nombre válido.", "error");
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    showMessage(formMessage, "Ingresa un correo electrónico válido.", "error");
    return false;
  }

  if (password.length < 8) {
    showMessage(formMessage, "La contraseña debe tener al menos 8 caracteres.", "error");
    return false;
  }

  if (!(state.termsAccepted && state.privacyAccepted)) {
    showMessage(formMessage, "Debes aceptar Términos y Política de Privacidad.", "error");
    return false;
  }

  clearMessage(formMessage);
  return true;
}

async function registerUser(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Procesando...";

  try {
    const payload = {
      fullName: fullNameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
      termsAccepted: termsAcceptedInput.value,
      privacyAccepted: privacyAcceptedInput.value
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage(formMessage, result.message || "No se pudo registrar.", "error");
      return;
    }

    state.registeredEmail = payload.email;
    otpEmailText.textContent = payload.email;

    showMessage(formMessage, result.message, "success");
    clearMessage(otpMessage);
    resetOtpInputs();
    openModal(otpModal);
    startOtpCountdown();
  } catch (error) {
    showMessage(formMessage, "Ocurrió un error inesperado.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Crear cuenta →";
  }
}

async function verifyOtp() {
  const otp = getOtpValue();

  if (otp.length !== 6) {
    showMessage(otpMessage, "Debes ingresar los 6 caracteres del código.", "error");
    return;
  }

  verifyOtpButton.disabled = true;
  verifyOtpButton.textContent = "Verificando...";

  try {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: state.registeredEmail,
        otp
      })
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage(otpMessage, result.message || "No se pudo verificar el código.", "error");
      return;
    }

    showMessage(otpMessage, result.message, "success");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  } catch (error) {
    showMessage(otpMessage, "Ocurrió un error inesperado al verificar.", "error");
  } finally {
    verifyOtpButton.disabled = false;
    verifyOtpButton.textContent = "Verificar código";
  }
}

async function resendOtp() {
  if (resendOtpButton.disabled) {
    return;
  }

  try {
    const response = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: state.registeredEmail
      })
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage(otpMessage, result.message || "No se pudo reenviar el código.", "error");
      return;
    }

    showMessage(otpMessage, result.message, "success");
    resetOtpInputs();
    startOtpCountdown();
  } catch (error) {
    showMessage(otpMessage, "Ocurrió un error inesperado al reenviar el código.", "error");
  }
}

passwordInput.addEventListener("input", updatePasswordStrength);

const toggleLoginPasswordButton = document.getElementById("toggleLoginPassword");
const loginPasswordInput = document.getElementById("loginPasswordInput");


togglePasswordButton.addEventListener("click", () => {
  const isPasswordVisible = passwordInput.type === "text";

  passwordInput.type = isPasswordVisible ? "password" : "text";

  togglePasswordButton.innerHTML = isPasswordVisible
    ? '<i class="bi bi-eye-slash"></i>'
    : '<i class="bi bi-eye"></i>';

  togglePasswordButton.setAttribute(
    "aria-label",
    isPasswordVisible ? "Mostrar contraseña" : "Ocultar contraseña"
  );
});

openTermsLink.addEventListener("click", () => openModal(termsModal));
openPrivacyLink.addEventListener("click", () => openModal(privacyModal));

acceptTermsButton.addEventListener("click", () => {
  state.termsAccepted = true;
  syncAcceptanceState();
  closeModal(termsModal);
});

acceptPrivacyButton.addEventListener("click", () => {
  state.privacyAccepted = true;
  syncAcceptanceState();
  closeModal(privacyModal);
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    const modalId = button.getAttribute("data-close-modal");
    const modalElement = document.getElementById(modalId);

    if (modalElement) {
      closeModal(modalElement);
    }
  });
});

modalBackdrop.addEventListener("click", () => {
  [termsModal, privacyModal, otpModal].forEach((modalElement) => {
    if (!modalElement.classList.contains("hidden")) {
      closeModal(modalElement);
    }
  });
});

otpInputs.forEach((input, index) => {
  input.addEventListener("input", (event) => {
    const sanitizedValue = event.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    event.target.value = sanitizedValue;

    if (sanitizedValue && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();

    const pastedText = (event.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);

    pastedText.split("").forEach((character, pastedIndex) => {
      if (otpInputs[pastedIndex]) {
        otpInputs[pastedIndex].value = character;
      }
    });

    const nextIndex = Math.min(pastedText.length, otpInputs.length - 1);
    otpInputs[nextIndex].focus();
  });
});

registerForm.addEventListener("submit", registerUser);
verifyOtpButton.addEventListener("click", verifyOtp);
resendOtpButton.addEventListener("click", resendOtp);

syncAcceptanceState();
updatePasswordStrength();