import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes"
import carRoutes from "./routes/carRoutes"

const app = express();
const PORT = process.env.PORT || 5000;


// Handle preflight requests
app.options('*', cors());

// Express middleware
app.use(express.json());

// Route Handlers
app.use(authRoutes);
app.use(carRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});