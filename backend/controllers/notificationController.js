const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const getNotifications = asyncHandler(async (req, res) => {
  if (!req.appUser) {
    throw new AppError("Wallet profile not found.", 404);
  }

  const notifications = await Notification.find({ user: req.appUser._id }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    data: notifications,
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  if (!req.appUser) {
    throw new AppError("Wallet profile not found.", 404);
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.appUser._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError("Notification not found.", 404);
  }

  res.json({
    success: true,
    data: notification,
  });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  if (!req.appUser) {
    throw new AppError("Wallet profile not found.", 404);
  }

  await Notification.updateMany({ user: req.appUser._id, read: false }, { read: true });

  res.json({
    success: true,
    message: "All notifications marked as read.",
  });
});

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
