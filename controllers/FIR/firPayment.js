import stripe from "../../config/Payment/stripe.js";
import firDraftModel from "../../models/FIR/firDraftSchema.model.js";

export const createFirPaymentSession = async (req, res, next) => {
  try {
    const { draftId } = req.body;

    const draft = await firDraftModel.findById(draftId);

    if (!draft || draft.status !== "PAYMENT_PENDING") {
      return res.status(400).json({ message: "Invalid draft" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "FIR Verification Service",
            },
            unit_amount: 999,
          },
          quantity: 1,
        },
      ],
      metadata: {
        draftId: draft._id.toString(),
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
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
