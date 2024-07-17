import { Router } from "express";
import {
  isInstructor,
  isStudent,
  verifyJWT,
} from "../middlewares/auth.middlewares.js";
import {
  checkFeedbackSubmission,
  createFeedback,
  getAllFeedbacksToForm,
} from "../controllers/feedback.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/response/:formId").post(isStudent, createFeedback);

router.route("/exists/:formId").get(isStudent, checkFeedbackSubmission);

router.route("/all/response/:formId").get(getAllFeedbacksToForm);

export default router;
