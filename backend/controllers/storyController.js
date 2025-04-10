// import Doctor from '../models/Doctors';
// import stories from '../models/Stories';

// exports.addStory = async (req, res) => {
//   try {
//     const { doctorId, userId, visitedFor, recommend, storyText } = req.body;

//     if (!doctorId || !userId || !visitedFor || !storyText) {
//       return res.status(400).json({ message: "All required fields must be filled" });
//     }

//     const newStory = new stories({
//       doctor: doctorId,
//       user: userId,
//       visitedFor,
//       recommend,
//       storyText,
//     });

//     const savedStory = await newStory.save();

//     await Doctor.findByIdAndUpdate(doctorId, {
//       $push: { stories: savedStory._id }
//     });

//     res.status(201).json({ message: "Story submitted successfully", story: savedStory });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getDoctorStories = async (req, res) => {
//   try {
//     const { doctorId } = req.params;
//     const stories = await stories.find({ doctor: doctorId }).populate("user", "fullname");

//     res.status(200).json(stories);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


import Stories from "../models/Stories.js";
import Doctors from "../models/Doctors.js";
import moment from "moment";

// Add a new story
export const addStory = async (req, res) => {
  console.log("REQ.USER:", req.user);
  console.log("REQ.BODY:", req.body);

  try {
    const { visitedFor, recommended, story, doctorId } = req.body;

    // Validate required fields
    if (!visitedFor || typeof recommended === "undefined" || !story || !doctorId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create the story
    const newStory = new Stories({
      doctor: doctorId,
      user: req.user.id,
      visitedFor,
      recommended,
      story,
    });

    const savedStory = await newStory.save();

    // Update Doctor's stories array
    await Doctors.findByIdAndUpdate(doctorId, {
      $push: { stories: savedStory._id },
    });

    res.status(201).json({ message: "Story added successfully", story: savedStory });
  } catch (error) {
    console.error("Add Story Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get stories by doctor
export const getStoriesByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const stories = await Stories.find({ doctor: doctorId })
      .populate("user", "fullname") // Get user's name
      .sort({ createdAt: -1 }); // Newest first

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