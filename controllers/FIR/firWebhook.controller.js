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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const draftId = session?.metadata?.draftId;

    const draft = await firDraftModel.findById(draftId);

    if (!draft || draft.status === "PAID") {
      return res.json({ received: true });
    }

    await firRequestModel.create({
      userId: draft.userId,
      firNumber: draft.firNumber,
      policeStation: draft.policeStation,
      district: draft.district,
      state: draft.state,
      incidentDate: draft.incidentDate,
      complainantName: draft.complainantName,
      uploadedFirCopy: draft.uploadedFirCopy,
      idProof: draft.idProof,
      paymentId: session.payment_intent,
      invoiceNumber: `INV-${Date.now()}`,
    });

    draft.status = "PAID";
    await draft.save();
  }

  res.json({ received: true });
};
