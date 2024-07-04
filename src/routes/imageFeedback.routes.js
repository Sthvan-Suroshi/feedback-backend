import { Router } from "express";
import {
  createImageFeedback,
  deleteImageFeedback,
} from "../controllers/imageResponse.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { editImageFeedback } from "../controllers/imageResponse.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/upload").post(upload.single("image"), createImageFeedback);
router.route("/edit/:id").patch(upload.single("image"), editImageFeedback);

router.route("/delete/:id").delete(deleteImageFeedback);

export default router;
