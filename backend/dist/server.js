"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const carRoutes_1 = __importDefault(require("./routes/carRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Handle preflight requests
app.options('*', (0, cors_1.default)());
// Express middleware
app.use(express_1.default.json());
// Route Handlers
app.use(authRoutes_1.default);
app.use(carRoutes_1.default);
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
