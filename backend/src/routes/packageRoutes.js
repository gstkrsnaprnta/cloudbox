import { Router } from "express";
import { prisma } from "../config/prisma.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" }
    });

    res.json({ packages });
  } catch (error) {
    next(error);
  }
});

export default router;
