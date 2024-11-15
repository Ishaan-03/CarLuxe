import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import carRoutes from "./routes/carRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "*",  
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],  
  allowedHeaders: ["Content-Type", "Authorization"],  
};

app.use(cors(corsOptions)); 

app.use(express.json());

app.use(authRoutes);
app.use(carRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
