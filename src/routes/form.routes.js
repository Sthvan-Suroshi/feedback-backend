import { Router } from "express";
import {
  isAdmin,
  isAdminOrInstructor,
  isInstructor,
  isStudent,
  verifyJWT
} from "../middlewares/auth.middlewares.js";
import {
  createForm,
  deleteForm,
  deleteQuestion,
  getAllForms,
  getAllFormsCreatedByUser,
  getFormByDept,
  getFormDetails,
  togglePublish,
  updateForm,
  updateQuestion
} from "../controllers/form.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(isInstructor, createForm);

router
  .route("/:formId")
  .get(getFormDetails)
  .patch(isAdminOrInstructor, updateForm)
  .delete(isAdminOrInstructor, deleteForm);

router
  .route("/question/:questionId")
  .patch(isAdminOrInstructor, updateQuestion)
  .delete(isAdminOrInstructor, deleteQuestion);

router.route("/user/all-forms").get(isInstructor, getAllFormsCreatedByUser);

router.route("/department/all-forms").get(isStudent, getFormByDept);
router.route("/admin/all-forms").get(isAdmin, getAllForms);
router.route("/your-forms/toggle-publish").patch(isAdminOrInstructor, togglePublish);

export default router;
