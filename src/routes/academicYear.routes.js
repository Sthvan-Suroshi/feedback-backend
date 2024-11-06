import { addAcademicYear } from "../controllers/academicYear.controllers.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

const router = Router();

router.use(verifyJWT);

router.route("/add-year").post(isAdmin, addAcademicYear);

export default router;
