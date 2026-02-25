import faqModel from "../../models/UI/FAQ.model.js";
import { ValidationError, NotFoundError } from  "../../util/errorHandler/customError.js";

export const createFaq = async (req, res, next) => {
  try {
    const adminId = req?.user?.id;
    const { question, answer } = req?.body||{};

    if (!question || !answer) {
      throw new ValidationError("Question and answer are required");
    }

    const faq = await faqModel.create({
      question,
      answer,
      createdBy: adminId,
    });

    res.status(201).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (req, res, next) => {
  try {
    const adminId = req?.user?.id;
    const { id } = req.params;
    const { question, answer } = req.body;

    const faq = await faqModel.findById(id);

    if (!faq) {
      throw new NotFoundError("FAQ not found");
    }

    if (question) faq.question = question;
    if (answer) faq.answer = answer;

    faq.updatedBy = adminId;

    await faq.save();

    res.status(200).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await faqModel.findByIdAndDelete(id);

    if (!faq) {
      throw new NotFoundError("FAQ not found");
    }

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFaqs = async (req, res, next) => {
  try {
    const faqs = await faqModel
      .find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleFaq = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await faqModel.findById(id);

    if (!faq) {
      throw new NotFoundError("FAQ not found");
    }

    res.status(200).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};