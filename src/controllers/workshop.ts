const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  try {
    const { timeslots, experience, message } = req.body;

    if (!timeslots || !experience) {
      return res.status(400).json({ success: false, message: "Timeslots and experience are required" });
    }

    const booking = new Booking({
      userId: req.user.id,
      timeslots,
      experience,
      message,
    });

    await booking.save();

    res.status(201).json({ success: true, message: "Booking created", data: booking });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
