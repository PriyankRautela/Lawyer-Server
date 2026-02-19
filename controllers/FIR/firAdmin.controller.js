import firMessageModel from "../../models/FIR/firMessag.model.js";
import firRequestModel from "../../models/FIR/firRequest.model.js";


export const updateFirStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const update = { status };

    if (status === "REJECTED") {
      update.rejectionReason = rejectionReason;
    }

    if (status === "DELIVERED") {
      update.deliveredFile = req?.file?.path;
    }

    const updated = await firRequestModel.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    res.json({ success: true, updated });
  } catch (err) {
    next(err);
  }
};

export const adminSendFirMessage = async (req, res, next) => {
  try {
    const adminId = req?.user?.id;
    const { requestId } = req?.params;
    const { message } = req?.body||{};

    const fir = await firRequestModel.findById(requestId);

    if (!fir) {
      return res.status(404).json({ message: "FIR not found" });
    }

    const newMessage = await firMessageModel.create({
      firRequestId: requestId,
      senderType: "ADMIN",
      senderId: adminId,
      message,
      attachment: req?.file?.path,
    });

    // Optional: Update status automatically
    if (fir.status === "SUBMITTED") {
      fir.status = "UNDER_REVIEW";
      await fir.save();
    }

    res.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const userSendFirMessage = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    const { requestId } = req.params;
    const { message } = req.body;

    const newMessage = await firMessageModel.create({
      firRequestId: requestId,
      senderType: "USER",
      senderId: userId,
      message,
      attachment: req?.file?.path,
    });

    res.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};
export const getFirMessages = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const messages = await firMessageModel
      .find({ firRequestId: requestId })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};
