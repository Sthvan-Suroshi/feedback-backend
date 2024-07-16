import { Router } from "express";
import {
  isInstructor,
  isStudent,
  verifyJWT,
} from "../middlewares/auth.middlewares.js";
import {
  createForm,
  deleteForm,
  deleteQuestion,
  getAllFormsCreatedByUser,
  getFormByDept,
  getFormDetails,
  updateForm,
  updateQuestion,
} from "../controllers/form.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(isInstructor, createForm);

router
  .route("/:formId")
  .get(getFormDetails)
  .patch(isInstructor, updateForm)
  .delete(isInstructor, deleteForm); //needs testing

router
  .route("/question/:questionId")
  .patch(isInstructor, updateQuestion)
  .delete(isInstructor, deleteQuestion);

router.route("/user/all-forms").get(isInstructor, getAllFormsCreatedByUser);

router.route("/department/all-forms").get(isStudent, getFormByDept);
export default router;
