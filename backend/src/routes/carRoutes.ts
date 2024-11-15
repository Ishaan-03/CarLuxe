import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import express, { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHnadler";
import { authMiddleware } from "../middlewares/authmiddleware";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// Define Params type
type Params = {
  folder: string;
  resource_type: string;
};

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "car_uploads",
    resource_type: "auto",
  } as Params,
});

const upload = multer({ storage: storage });

// Route to add a new car with multiple images
router.post(
  "/addcars",
  authMiddleware,
  upload.array('images', 10), // Limit to 10 images
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description, tags, userId } = req.body;
    const imageUrls = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : [];

    try {
      const newCar = await prisma.car.create({
        data: {
          title,
          description,
          images: imageUrls,
          tags: JSON.parse(tags),
          user: { connect: { id: userId } },
        },
      });
      res.status(201).json(newCar);
    } catch (error) {
      res.status(500).json({ error: 'Error creating car.' });
    }
  })
);

// Route to get all cars of the authenticated user
router.get("/cars/me", authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ message: "User not authenticated." });
  }

  const userCars = await prisma.car.findMany({
    where: { userId: userId },
    orderBy: { title: "asc" },
  });

  res.status(200).json(userCars);
}));

// Route to get all cars
router.get("/cars", authMiddleware, asyncHandler(async (_req: Request, res: Response) => {
  const cars = await prisma.car.findMany({
    orderBy: { title: "asc" },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  res.status(200).json(cars);
}));


router.get(
  "/cars/search",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ message: "A search keyword is required." });
    }

    const cars = await prisma.car.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
          { tags: { has: keyword } }, 
        ],
      },
      orderBy: { title: "asc" }, 
    });

    res.status(200).json(cars);
  })
);


// Route to update a car's details
router.post(
  "/cars/update/:carId",
  authMiddleware,
  upload.array('images', 10),
  asyncHandler(async (req: Request, res: Response) => {
    const { carId } = req.params;
    const { title, description, tags } = req.body;
    const userId = req.user?.id;

    if (!carId || !title || !description || !tags) {
      return res.status(400).json({ message: "Car ID, title, description, and tags are required." });
    }

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    if (car.userId !== userId) {
      return res.status(403).json({ message: "You do not have permission to update this car." });
    }

    const imageUrls = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : car.images;

    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: {
        title,
        description,
        tags: JSON.parse(tags),
        images: imageUrls,
      },
    });

    res.status(200).json({
      message: "Car updated successfully.",
      car: updatedCar,
    });
  })
);

// Route to delete a car
router.delete(
  "/cars/delete/:carId",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { carId } = req.params;
    const userId = req.user?.id;

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    if (car.userId !== userId) {
      return res.status(403).json({ message: "You do not have permission to delete this car." });
    }

    const deletedCar = await prisma.car.delete({ where: { id: carId } });

    res.status(200).json({
      message: "Car deleted successfully.",
      car: deletedCar,
    });
  })
);

export default router;
