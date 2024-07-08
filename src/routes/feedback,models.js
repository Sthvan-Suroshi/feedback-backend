import { Router } from "express";
import {
  isInstructor,
  isStudent,
  verifyJWT,
} from "../middlewares/auth.middlewares.js";
import {
  checkFeedbackSubmission,
  createFeedback,
} from "../controllers/feedback.controller";

const router = Router();
router.use(verifyJWT);

router.route("/response/:formId").post(isStudent, createFeedback);

router.route("/exists/:formId").get(isStudent, checkFeedbackSubmission);

router
  .route("/all/feedback/:formId")
  .get(isInstructor, checkFeedbackSubmission);

export default router;
