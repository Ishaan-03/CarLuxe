import { asyncHandler } from "../utils/asyncHnadler";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


const JWT_SECRET= process.env.JWT_SECRET as string
export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
  
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
      req.user = decoded; 
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  });