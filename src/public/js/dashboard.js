const dashboardEmailInput = document.getElementById("dashboardEmail");
const logoutButton = document.getElementById("logoutButton");
const dashboardMessage = document.getElementById("dashboardMessage");

async function loadCurrentUser() {
  try {
    const response = await fetch("/api/auth/me");
    const result = await response.json();

    if (!response.ok) {
      window.location.href = "/login";
      return;
    }

    dashboardEmailInput.value = result.user.email;
  } catch (error) {
    dashboardMessage.textContent = "No se pudo cargar la sesión.";
    dashboardMessage.classList.remove("success");
    dashboardMessage.classList.add("error");
  }
}

async function logoutUser() {
  logoutButton.disabled = true;
  logoutButton.textContent = "Cerrando sesión...";

  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST"
    });

    const result = await response.json();

    if (!response.ok) {
      dashboardMessage.textContent = result.message || "No se pudo cerrar sesión.";
      dashboardMessage.classList.remove("success");
      dashboardMessage.classList.add("error");
      return;
    }

    window.location.href = "/login";
  } catch (error) {
    dashboardMessage.textContent = "Ocurrió un error inesperado.";
    dashboardMessage.classList.remove("success");
    dashboardMessage.classList.add("error");
  } finally {
    logoutButton.disabled = false;
    logoutButton.textContent = "Cerrar sesión";
  }
}

logoutButton.addEventListener("click", logoutUser);

loadCurrentUser();