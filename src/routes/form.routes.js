import { Router } from "express";
import { isInstructor, verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  createForm,
  deleteForm,
  editForm,
} from "../controllers/form.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(isInstructor, createForm);
router.route("/edit/:id").patch(isInstructor, editForm);
router.route("/delete/:id").delete(isInstructor, deleteForm);
export default router;
