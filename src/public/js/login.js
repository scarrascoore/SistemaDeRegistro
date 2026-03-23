const loginForm = document.getElementById("loginForm");
const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const toggleLoginPasswordButton = document.getElementById("toggleLoginPassword");
const loginMessage = document.getElementById("loginMessage");
const loginSubmitButton = document.getElementById("loginSubmitButton");

function showLoginMessage(message, type) {
  loginMessage.textContent = message;
  loginMessage.classList.remove("success", "error");

  if (type) {
    loginMessage.classList.add(type);
  }
}

function validateLoginForm() {
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  if (!email || !password) {
    showLoginMessage("Completa todos los campos.", "error");
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    showLoginMessage("Ingresa un correo válido.", "error");
    return false;
  }

  if (password.length < 8) {
    showLoginMessage("La contraseña debe tener al menos 8 caracteres.", "error");
    return false;
  }

  showLoginMessage("", "");
  return true;
}

async function loginUser(event) {
  event.preventDefault();

  if (!validateLoginForm()) {
    return;
  }

  loginSubmitButton.disabled = true;
  loginSubmitButton.textContent = "Ingresando...";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: loginEmailInput.value.trim(),
        password: loginPasswordInput.value
      })
    });

    const result = await response.json();

    if (!response.ok) {
      showLoginMessage(result.message || "No se pudo iniciar sesión.", "error");
      return;
    }

    showLoginMessage(result.message, "success");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);
  } catch (error) {
    showLoginMessage("Ocurrió un error inesperado.", "error");
  } finally {
    loginSubmitButton.disabled = false;
    loginSubmitButton.textContent = "Ingresar →";
  }
}

toggleLoginPasswordButton.addEventListener("click", () => {
  const isVisible = loginPasswordInput.type === "text";

  loginPasswordInput.type = isVisible ? "password" : "text";

  toggleLoginPasswordButton.innerHTML = isVisible
    ? '<i class="bi bi-eye-slash"></i>'
    : '<i class="bi bi-eye"></i>';
});

loginForm.addEventListener("submit", loginUser);