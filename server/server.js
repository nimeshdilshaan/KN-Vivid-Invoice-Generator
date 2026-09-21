const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "KN Vivid Invoice Generator API is running"
  });
});

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});