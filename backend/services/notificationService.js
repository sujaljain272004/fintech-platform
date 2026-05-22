const Notification = require("../models/Notification");

const createNotification = async (payload, session = null) => {
  const [notification] = await Notification.create([payload], { session });
  return notification;
};

const createManyNotifications = async (payloads, session = null) =>
  Notification.insertMany(payloads, { session });

module.exports = {
  createNotification,
  createManyNotifications,
};
