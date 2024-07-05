import { Router } from "express";
import {
  createImageFeedback,
  deleteImageFeedback,
  getAllImageResponses,
  getAllUserImageResponses,
  getImageResponse,
} from "../controllers/imageResponse.controllers.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { editImageFeedback } from "../controllers/imageResponse.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/upload").post(upload.single("image"), createImageFeedback);
router.route("/edit/:id").patch(upload.single("image"), editImageFeedback);
router.route("/delete/:id").delete(deleteImageFeedback);
router.route("/:id").get(getImageResponse);
router.route("/user/image-responses").get(getAllUserImageResponses);
router.route("/all/image-responses").get(isAdmin, getAllImageResponses);

export default router;
