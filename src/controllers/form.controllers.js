import { Form } from "../models/form.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import { Question } from "../models/question.models.js";
import { Feedback } from "../models/feedback.models.js";

export const createForm = asyncHandler(async (req, res) => {
  const { title, description, questions, academicYear, department } = req.body;

  if (!title || !description || academicYear || department) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const form = new Form({
      createdBy: req.user?._id,
      title,
      description,
      department,
      academicYear
    });

    const savedForm = await form.save();

    if (!savedForm) {
      throw new ApiError(500, "Something went wrong while saving the form");
    }

    const newQuestions = await Promise.all(
      questions.map(async (q) => {
        const newQuestion = new Question({
          question: q.question,
          options: q.options,
          description: q.description,
          formId: savedForm._id
        });
        return await newQuestion.save();
      })
    );

    if (!newQuestions) {
      throw new ApiError(500, "Something went wrong while saving questions");
    }

    savedForm.questions = newQuestions.map((q) => q._id);
    const updatedForm = await savedForm.save();

    if (!updatedForm) {
      throw new ApiError(500, "Something went wrong while updating the form with questions");
    }

    return res.status(200).json(new ApiResponse(200, updatedForm, "Success"));
  } catch (error) {
    console.log(error);
    throw error;
  }
});

export const getFormDetails = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  const form = await Form.findById(formId).populate({
    path: "questions",
    select: "_id formId question options description"
  });

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, form, "Form and its questions retrieved successfully"));
});

export const getAllFormsCreatedByUser = asyncHandler(async (req, res) => {
  const forms = await Form.find({ createdBy: req.user?._id }).sort({
    createdAt: -1
  });

  if (!forms) {
    throw new ApiError(404, "Forms not found");
  }

  return res.status(200).json(new ApiResponse(200, forms, "Forms retrieved successfully"));
});

export const updateForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  if (!formId || !isValidObjectId(formId)) {
    throw new ApiError(400, "Form ID is required and should be a valid ID");
  }

  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  if (form.createdBy.toString() !== req.user?._id.toString() && !req.user.isAdmin) {
    throw new ApiError(403, "You are not authorized to update this form");
  }

  const updatedForm = await Form.findByIdAndUpdate(
    formId,
    { title, description },
    { new: true, runValidators: true }
  );

  if (!updatedForm) {
    throw new ApiError(404, "Form not found");
  }

  return res.status(200).json(new ApiResponse(200, updatedForm, "Form updated successfully"));
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { question, options } = req.body;

  if (!question) {
    throw new ApiError(400, "All fields are required");
  }

  if (!questionId) {
    throw new ApiError(400, "Question ID is required");
  }

  if (!isValidObjectId(questionId)) {
    throw new ApiError(400, "Invalid question ID");
  }

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { question, options },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      throw new ApiError(404, "Question not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedQuestion, "Question updated successfully"));
  } catch (error) {
    console.log(error);
    throw error;
  }
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  console.log(questionId);

  if (!questionId) {
    throw new ApiError(400, "Question ID is required");
  }

  if (!isValidObjectId(questionId)) {
    throw new ApiError(400, "Invalid question ID");
  }

  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  const formId = question.formId;

  await Question.findByIdAndDelete(questionId);

  const updatedForm = await Form.findByIdAndUpdate(
    formId,
    {
      $pull: { questions: questionId }
    },
    {
      new: true
    }
  );

  if (!updatedForm) {
    throw new ApiError(500, "Something went wrong while updating the form");
  }

  return res.status(200).json(new ApiResponse(200, updatedForm, "Question deleted successfully"));
});

export const getFormByDept = asyncHandler(async (req, res) => {
  const { department, academicYear, userID } = req.user;
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };

  const [forms, submittedFormIDs] = await Promise.all([
    Form.find({ isPublished: true, academicYear, department })
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate({
        path: "createdBy",
        select: "fullName"
      })
      .lean(),
    Feedback.find({ userID }).distinct("formId")
  ]);

  if (!forms || forms.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No forms found"));
  }

  // Set of submitted form IDs for quick lookup
  const submittedFormSet = new Set(submittedFormIDs.map((id) => id.toString()));

  // Map to add submission status and createdBy data
  const formattedForms = forms.map((form) => ({
    ...form,
    submitted: submittedFormSet.has(form._id.toString()),
    createdBy: form.createdBy ? form.createdBy.fullName : "Unknown"
  }));

  // Count total forms that match the criteria for pagination
  const totalForms = await Form.countDocuments({ isPublished: true, academicYear, department });

  const response = {
    forms: formattedForms,
    totalForms,
    page: options.page,
    limit: options.limit
  };

  return res.status(200).json(new ApiResponse(200, response, "Success"));
});

export const togglePublish = asyncHandler(async (req, res) => {
  const { isPublished, formId } = req.body;
  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  if (!isValidObjectId(formId)) {
    throw new ApiError(400, "Invalid form ID");
  }

  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  if (form.createdBy.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to publish this form");
  }

  const updatedForm = await Form.findByIdAndUpdate(
    formId,
    { isPublished },
    { new: true, runValidators: true }
  );

  if (!updatedForm) {
    throw new ApiError(500, "Something went wrong while updating the form");
  }

  return res.status(200).json(new ApiResponse(200, updatedForm, "Form published successfully"));
});

export const deleteForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  const form = await Form.findById(formId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  const deleteQuestions = await Question.deleteMany({ formId: form._id });

  const deleteResponses = await Feedback.deleteMany({ formId: form._id });

  if (!deleteQuestions || !deleteResponses) {
    throw new ApiError(500, "Something went wrong while deleting questions and responses");
  }

  const deleteForm = await form.deleteOne();

  if (!deleteForm) {
    throw new ApiError(500, "Something went wrong while deleting form");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { deleted: true }, "Form and related questions deleted successfully")
    );
});

export const getAllForms = asyncHandler(async (req, res) => {
  const { academicYear, page = 1, limit = 10 } = req.query;

  if (academicYear && !isValidObjectId(academicYear)) {
    throw new ApiError(400, "Invalid academic year ID");
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };

  let aggregation = [{ $sort: { createdAt: -1 } }]; // Default aggregation for sorting

  // If academicYear is provided, add a match stage to filter by academicYear
  if (academicYear) {
    aggregation.unshift({ $match: { academicYear } });
  }

  const paginatedForms = await Form.aggregatePaginate(aggregation, options);

  if (!paginatedForms || paginatedForms.docs.length === 0) {
    throw new ApiError(404, "Forms not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        forms: paginatedForms.docs,
        totalForms: paginatedForms.totalDocs, // Total number of forms available
        page: paginatedForms.page, // Current page
        limit: paginatedForms.limit // Items per page
      },
      academicYear
        ? `All forms of ${academicYear} academic year retrieved successfully`
        : "All forms retrieved successfully"
    )
  );
});
