import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { asyncHandler } from '../utils/asyncHnadler';
import { z } from 'zod';
import prisma from '../prisma';
import { authMiddleware } from '../middlewares/authmiddleware';

dotenv.config();

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET as string;

// Zod validation schemas for signup and login
const signupValidation = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(8)
});

const loginValidation = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(8)
});

// User Signup Route
router.post(
  '/api/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body;
    const result = signupValidation.safeParse(body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid request',
        errors: result.error.errors
      });
    }

    const { email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists, please try logging in'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token
    });
  })
);

// User Login Route
router.post(
  '/api/login',
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body;
    const result = loginValidation.safeParse(body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid request',
        errors: result.error.errors
      });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User does not exist, please sign up'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'User logged in successfully',
      token
    });
  })
);


// Error handling middleware
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: err.message
  });
});

// Handle server termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing Prisma client');
  await prisma.$disconnect();
  process.exit(0);
});

export default router;
