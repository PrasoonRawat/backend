import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/Users.js';
import Doctors from '../models/Doctors.js';
import dotenv from 'dotenv';

dotenv.config();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET;

// User Registration
export const registerUser = async (req, res) => {
    const { fullname, email, phone, password, ...otherDetails } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Users({
            fullname,
            email,
            phone,
            password: hashedPassword,
            ...otherDetails
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Doctor Registration
export const registerDoctor = async (req, res) => {
    const { fullname, email, phone, password, ...otherDetails } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newDoctor = new Doctors({
            fullname,
            email,
            phone,
            password: hashedPassword,
            ...otherDetails
        });

        await newDoctor.save();
        res.status(201).json({ message: 'Doctor registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Login helper
const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "15m" }); // short-lived
};

const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" }); // long-lived
};


// User/Doctor Login
// export const login = async (req, res) => {
//     const { email, password, role } = req.body; // Role determines if User or Doctor
//     const Model = role === 'doctor' ? Doctors : Users;

//     try {
//         const user = await Model.findOne({ email });
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//         const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: '1d' });
//         res.status(200).json({ token, user });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

export const login = async (req, res) => {
  const { email, password, role } = req.body;
  const Model = role === "doctor" ? Doctors : Users;

  try {
    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user._id, role);
    const refreshToken = generateRefreshToken(user._id, role);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Also set in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.ALLOWED_ORIGINS === "https://medconnect-user.netlify.app",
      sameSite: process.env.ALLOWED_ORIGINS === "https://medconnect-user.netlify.app" ? "None" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ token: accessToken, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const { id, role } = decoded;

    const Model = role === "doctor" ? Doctors : Users;
    const user = await Model.findById(id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};