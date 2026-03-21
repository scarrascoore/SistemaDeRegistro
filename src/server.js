require("dotenv").config();

const app = require("./app");
const { testConnection } = require("./config/db");

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await testConnection();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();