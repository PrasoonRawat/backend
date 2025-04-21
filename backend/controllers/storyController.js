import Stories from "../models/Stories.js";
import Doctors from "../models/Doctors.js";
import moment from "moment";
import Appointment from "../models/Appointments.js";

// Add a new story
// export const addStory = async (req, res) => {
//   console.log("REQ.USER:", req.user);
//   console.log("REQ.BODY:", req.body);

//   try {
//     const { visitedFor, recommended, story, doctorId } = req.body;

//     // Validate required fields
//     if (!visitedFor || typeof recommended === "undefined" || !story || !doctorId) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     // Create the story
//     const newStory = new Stories({
//       doctor: doctorId,
//       user: req.user.id,
//       visitedFor,
//       recommended,
//       story,
//     });

//     const savedStory = await newStory.save();

//     // Update Doctor's stories array
//     await Doctors.findByIdAndUpdate(doctorId, {
//       $push: { stories: savedStory._id },
//     });

//     res.status(201).json({ message: "Story added successfully", story: savedStory });
//   } catch (error) {
//     console.error("Add Story Error:", error);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

const now = new Date();
const todayDateOnly = now.toISOString().split("T")[0];
const currentTime = now.toTimeString().slice(0, 5);

export const submitStory = async (req, res) => {
  try {
    const userId = req.userId;
    const { doctorId, visitedFor, recommend, story } = req.body;
    
    // Check for approved & past appointment
    const pastAppointment = await Appointment.findOne({
      user: userId,
      doctor: doctorId,
      status: 'accepted',
      // date: { $lt: new Date().toISOString().split('T')[0] }
      $or: [
        { date: { $lt: todayDateOnly } },
        {
          date: todayDateOnly,
          endTime: { $lt: currentTime }
        }
      ]
    });

    if (!pastAppointment) {
      return res.status(400).json({ message: 'No past approved appointment found with this doctor.' });
    }

    // Check if user already submitted a story for this doctor
    const existingStory = await Stories.findOne({ user: userId, doctor: doctorId });
    if (existingStory) {
      return res.status(400).json({ message: 'You have already submitted a story for this doctor.' });
    }

    const newStory = new Stories({
      doctor: doctorId,
      user: userId,
      visitedFor,
      recommend,
      story,
      submittedAt: new Date()
    });

    await newStory.save();

    // Push to doctor's `stories` array
    await Doctors.findByIdAndUpdate(doctorId, {
      $push: { stories: newStory._id }
    });

    res.status(201).json({ message: 'Story submitted successfully!', story: newStory });
  } catch (error) {
    console.error('Submit Story Error:', error);
    res.status(500).json({ message: 'Something went wrong while submitting the story.' });
  }
};



// Get stories by doctor
export const getStoriesByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const stories = await Stories.find({ doctor: doctorId })
      .populate("user", "fullname") // Get user's name
      .sort({ submittedAt: -1 }); // Newest first

    // Format the time as "1 week ago", etc.
    const formattedStories = stories.map((s) => ({
      ...s._doc,
      timeAgo: moment(s.submittedAt).fromNow(),
    }));
    
    res.status(200).json(formattedStories);
  } catch (error) {
    console.error("Fetch Stories Error:", error);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
};