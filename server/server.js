const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test
app.get("/", (req, res) => {
  res.json({
    message: "KN Vivid Invoice Generator API is running"
  });
});

// Authentication
app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

// Invoices
app.use(
  "/api/invoices",
  require("./routes/invoiceRoutes")
);

const PORT = 5001;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});