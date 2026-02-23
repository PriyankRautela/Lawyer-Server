import mongoose from "mongoose";
import stripe from "../../config/Payment/stripe.js";
import firDraftModel from "../../models/FIR/firDraftSchema.model.js";
import firRequestModel from "../../models/FIR/firRequest.model.js";

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type !== "checkout.session.completed") {
    return res.json({ received: true });
  }

  const session = event.data.object;
  const draftId = session?.metadata?.draftId;
  const paymentIntentId = session.payment_intent;
  const stripeEventId = event.id;

  if (!draftId) {
    return res.json({ received: true });
  }

  const mongoSession = await mongoose.startSession();

  try {
    await mongoSession.withTransaction(async () => {
      const existingRequest = await firRequestModel.findOne({
        paymentId: paymentIntentId,
      });

      if (existingRequest) {
        return;
      }

      const draft = await firDraftModel
        .findById(draftId)
        .session(mongoSession);

      if (!draft || draft.status === "PAID") {
        return;
      }

      const invoiceNumber = `INV-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      await firRequestModel.create(
        [
          {
            userId: draft.userId,
            firNumber: draft.firNumber,
            policeStation: draft.policeStation,
            district: draft.district,
            state: draft.state,
            incidentDate: draft.incidentDate,
            complainantName: draft.complainantName,
            uploadedFirCopy: draft.uploadedFirCopy,
            idProof: draft.idProof,

            amount: 999,
            paymentId: paymentIntentId,
            invoiceNumber,
            status: "SUBMITTED",
          },
        ],
        { session: mongoSession }
      );

      draft.status = "PAID";
      await draft.save({ session: mongoSession });
    });

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook failed:", error);
    res.status(500).send("Webhook processing failed");
  } finally {
    mongoSession.endSession();
  }
};