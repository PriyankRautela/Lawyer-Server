import stripe from "../../config/Payment/stripe.js";
import firDraftModel from "../../models/FIR/firDraftSchema.model.js";
import { ValidationError } from "../../util/errorHandler/customError.js";

export const createFirPaymentSession = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    const userEmail = req?.user?.email;
    const { draftId } = req.body;

    if (!draftId) {
      throw new ValidationError("Draft ID is required");
    }
    const draft = await firDraftModel.findOne({
      _id: draftId,
      userId,
    });

    if (!draft || draft.status !== "PAYMENT_PENDING") {
      throw new ValidationError("Invalid or already paid draft");
    }
    if (draft.paymentSessionId) {
      return res.json({
        success: true,
        message: "Payment session already created",
      });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: userEmail,

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "FIR Verification Service",
            },
            unit_amount: 99900,
          },
          quantity: 1,
        },
      ],

      metadata: {
        draftId: draft._id.toString(),
      },

      success_url: `${process.env.FRONTEND_URL}`,
      cancel_url: `${process.env.FRONTEND_URL}`,
    });

    draft.paymentSessionId = session.id;
    await draft.save();

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};