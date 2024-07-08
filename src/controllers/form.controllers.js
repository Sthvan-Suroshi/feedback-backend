import { Form } from "../models/form.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import { Question } from "../models/question.models.js";
import { Feedback } from "../models/feedback.models.js";

export const createForm = asyncHandler(async (req, res) => {
  const { title, description, questions } = req.body;

  if (!title || !description || !questions) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const form = new Form({
      createdBy: req.user?._id,
      title,
      description,
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
          formId: savedForm._id,
        });
        return await newQuestion.save();
      }),
    );
    console.log(newQuestions);

    if (!newQuestions) {
      throw new ApiError(500, "Something went wrong while saving questions");
    }

    savedForm.questions = newQuestions.map((q) => q._id);
    const updatedForm = await savedForm.save();

    if (!updatedForm) {
      throw new ApiError(
        500,
        "Something went wrong while updating the form with questions",
      );
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

  try {
    const form = await Form.findById(formId).populate({
      path: "questions",
      select: "_id formId question options",
    });

    if (!form) {
      throw new ApiError(404, "Form not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          form,
          "Form and its questions retrieved successfully",
        ),
      );
  } catch (error) {
    console.log(error);
    throw error;
  }
});

export const updateForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

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
    throw new ApiError(403, "You are not authorized to update this form");
  }

  const updatedForm = await Form.findByIdAndUpdate(
    formId,
    { title, description },
    { new: true, runValidators: true },
  );

  if (!updatedForm) {
    throw new ApiError(404, "Form not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedForm, "Form updated successfully"));
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
    throw new ApiError(
      500,
      "Something went wrong while deleting questions and responses",
    );
  }

  const deleteForm = await form.deleteOne();

  if (!deleteForm) {
    throw new ApiError(500, "Something went wrong while deleting form");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deleted: true },
        "Form and related questions deleted successfully",
      ),
    );
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { question, options } = req.body;

  if (!question || !options) {
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
      { new: true, runValidators: true },
    );

    if (!updatedQuestion) {
      throw new ApiError(404, "Question not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedQuestion, "Question updated successfully"),
      );
  } catch (error) {
    console.log(error);
    throw error;
  }
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  if (!questionId) {
    throw new ApiError(400, "Question ID is required");
  }

  if (!isValidObjectId(questionId)) {
    throw new ApiError(400, "Invalid question ID");
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new ApiError(404, "Question not found");
    }

    const formId = question.formId;

    await Question.findByIdAndDelete(questionId);

    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      {
        $pull: { questions: questionId },
      },
      {
        new: true,
      },
    );

    if (!updatedForm) {
      throw new ApiError(500, "Something went wrong while updating the form");
    }

    console.log("deleted question");

    return res
      .status(200)
      .json(new ApiResponse(200, updatedForm, "Question deleted successfully"));
  } catch (error) {
    console.log(error);
    throw error;
  }
});
