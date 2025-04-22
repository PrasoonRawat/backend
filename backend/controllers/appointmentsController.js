import Appointment from '../models/Appointments.js';
import Doctor from '../models/Doctors.js';
import User from '../models/Users.js';
import { generateTimeSlots } from '../utils/slotGenerator.js';
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

function addMinutesToTime(timeStr, minutesToAdd) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes + minutesToAdd, 0);
  return date.toTimeString().substring(0, 5); // "HH:MM"
}

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ⛔ Block past dates
    if (selectedDate < today) {
      return res.json({ slots: [] });
    }

    const selectedDay = selectedDate.toLocaleString("en-US", { weekday: "long" });
    const availabilityForDay = doctor.availability.find(a => a.day === selectedDay);
    if (!availabilityForDay) return res.json({ slots: [] });
    

    const bookedAppointments = await Appointment.find({
      doctor: new mongoose.Types.ObjectId(doctorId),
      date,
      status: "accepted"
    }); 


    const bookedTimes = bookedAppointments.map(a => {
      const [hour, minute] = a.startTime.split(":").map(Number);
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    });
    


    let availableSlots = [];

    for (let range of availabilityForDay.timeRanges) {
      const generated = generateTimeSlots(range.startTime, range.endTime, availabilityForDay.slotInterval);
      
      for (let startTime of generated) {
        const isBooked = bookedTimes.includes(startTime);
        availableSlots.push({
          startTime,
          status: isBooked ? "booked" : "available"
        });
      }
    }

    
    
    res.json({ slots: availableSlots });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



// export const requestAppointment = async (req, res) => {
//   try {
//     const { doctorId, userId, date, startTime } = req.body;

//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) return res.status(404).json({ message: "Doctor not found" });

//     // checking for the past date
//   const requestedDate = new Date(date);
//   requestedDate.setHours(0, 0, 0, 0);

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   if (requestedDate < today) {
//     return res.status(400).json({ message: "You Cannot book appointments for past dates." });
//   }


//     // Get availability for selected day
//     const selectedDay = new Date(date).toLocaleString("en-US", { weekday: "long" });
//     const availabilityForDay = doctor.availability.find(d => d.day === selectedDay);
//     if (!availabilityForDay) return res.status(400).json({ message: "Doctor not available on this day" });
    
//     // calculate endTime
//     const endTime = addMinutesToTime(startTime, availabilityForDay.slotInterval);

    
//     // Get all booked slots for that day
//     const existingAppointments = await Appointment.find({
//       doctor: doctorId,
//       date,
//       status: { $in: ['pending', 'approved'] }
//     });

//     const bookedTimes = existingAppointments.map(a => a.startTime);

//     if (bookedTimes.includes(startTime)) {
//       return res.status(400).json({ message: "Time slot already booked" });
//     }

//     const newAppointment = new Appointment({
//       doctor: doctorId,
//       user: userId,
//       date,
//       startTime,
//       endTime, 
//       status: "pending"
//     });

//     await newAppointment.save();

//     res.status(201).json({ message: "Appointment requested successfully", appointment: newAppointment });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
  

export const requestAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime } = req.body;
    const userId = req.userId; // ✅ extracted from token

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Check for past dates
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({ message: "You cannot book appointments for past dates." });
    }

    // Check doctor's availability
    const selectedDay = new Date(date).toLocaleString("en-US", { weekday: "long" });
    const availabilityForDay = doctor.availability.find(d => d.day === selectedDay);
    if (!availabilityForDay) return res.status(400).json({ message: "Doctor not available on this day." });

    // Calculate endTime
    const endTime = addMinutesToTime(startTime, availabilityForDay.slotInterval);

    // Check for already booked slots
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $in: ['pending', 'accepted'] }
    });

    const setAppointment = await Appointment.findOne({
      doctor: doctorId,
      user: userId,
      date, 
      startTime,
      endTime,
      status: 'pending'
    });

    if (setAppointment) {
      return res.status(400).json({ message: "You already have a pending appointment for this time." });
    }
    const bookedTimes = existingAppointments.map(a => a.startTime);

    if (bookedTimes.includes(startTime)) {
      return res.status(400).json({ message: "Time slot already booked." });
    }

    // Create appointment
    const newAppointment = new Appointment({
      doctor: doctorId,
      user: userId,
      date,
      startTime,
      endTime,
      status: "pending"
    });

    await newAppointment.save();

    res.status(201).json({ message: "Appointment requested successfully", appointment: newAppointment });

  } catch (err) {
    console.error("Appointment Request Error:", err);
    res.status(500).json({ message: "Server error while requesting appointment." });
  }
};

export const respondToAppointment = async (req, res) => {
  try {
    const { appointmentId, status, reason } = req.body;
    const doctorId = req.user.id;
    // Validate Appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.doctor.toString() !== doctorId) return res.status(403).json({ message: 'Unauthorized' });
    if (appointment.status !== 'pending') return res.status(400).json({ message: 'Appointment already processed' });
    if (status === 'accepted') {
      appointment.status = 'accepted';
      // Mark slot as booked in doctor's availability
      await Doctor.updateOne(
        { _id: doctorId, 'availability.startTime': appointment.startTime, 'availability.endTime': appointment.endTime },
        { $set: { 'availability.$.booked': true } }
      );
    } else if (status === 'denied') {
      appointment.status = 'denied';
      appointment.reason = reason;
    } else {
      return res.status(400).json({ message: 'Invalid status' });
    }
    await appointment.save();
    res.json({ message: `Appointment ${status}`, appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
  
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await Appointment.find({ doctor: doctorId }).populate('user', 'fullname email');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await Appointment.find({ user: userId }).populate('doctor', 'fullname specialization');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};