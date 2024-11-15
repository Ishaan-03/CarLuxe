"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const asyncHnadler_1 = require("../utils/asyncHnadler");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../prisma"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET;
// Zod validation schemas for signup and login
const signupValidation = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(4).max(8)
});
const loginValidation = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(4).max(8)
});
// User Signup Route
router.post('/api/signup', (0, asyncHnadler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const result = signupValidation.safeParse(body);
    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid request',
            errors: result.error.errors
        });
    }
    const { email, password } = result.data;
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        return res.status(409).json({
            message: 'User already exists, please try logging in'
        });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const newUser = await prisma_1.default.user.create({
        data: {
            email,
            password: hashedPassword
        }
    });
    const token = jsonwebtoken_1.default.sign({
        id: newUser.id,
        email: newUser.email
    }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
        message: 'User created successfully',
        token
    });
}));
// User Login Route
router.post('/api/login', (0, asyncHnadler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const result = loginValidation.safeParse(body);
    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid request',
            errors: result.error.errors
        });
    }
    const { email, password } = result.data;
    const user = await prisma_1.default.user.findUnique({
        where: { email }
    });
    if (!user) {
        return res.status(404).json({
            message: 'User does not exist, please sign up'
        });
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({
            message: 'Invalid credentials'
        });
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email
    }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
        message: 'User logged in successfully',
        token
    });
}));
// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'An unexpected error occurred',
        error: err.message
    });
});
// Handle server termination
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing Prisma client');
    await prisma_1.default.$disconnect();
    process.exit(0);
});
exports.default = router;
