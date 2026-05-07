const Notification = require('../models/Notification.model');

const createNotification = async (userId, type, title, message, forAdmin = false) => {
  try {
    await Notification.create({ userId, type, title, message, forAdmin });
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
};

// Notify all admins
const notifyAdmins = async (type, title, message) => {
  try {
    const User = require('../models/User.model');
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await createNotification(admin._id, type, title, message, true);
    }
  } catch (err) {
    console.error('Error notifying admins:', err.message);
  }
};

module.exports = { createNotification, notifyAdmins };