import Appointment from '../models/Appointments.js';
import Doctor from '../models/Doctors.js';
import User from '../models/Users.js';
import { generateTimeSlots } from '../utils/slotGenerator.js';

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

    const selectedDay = new Date(date).toLocaleString("en-US", { weekday: "long" });

    const availabilityForDay = doctor.availability.find(a => a.day === selectedDay);
    if (!availabilityForDay) return res.json({ slots: [] });

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $in: ['pending', 'approved'] }
    });

    const bookedTimes = bookedAppointments.map(a => a.time);

    let availableSlots = [];

    for (let range of availabilityForDay.timeRanges) {
      const generated = generateTimeSlots(range.startTime, range.endTime, availabilityForDay.slotInterval);
      const free = generated.filter(slot => !bookedTimes.includes(slot));
      availableSlots.push(...free);
    }

    res.json({ slots: availableSlots });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const requestAppointment = async (req, res) => {
  try {
    const { doctorId, userId, date, startTime } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Get availability for selected day
    const selectedDay = new Date(date).toLocaleString("en-US", { weekday: "long" });
    const availabilityForDay = doctor.availability.find(d => d.day === selectedDay);
    if (!availabilityForDay) return res.status(400).json({ message: "Doctor not available on this day" });
    
    // calculate endTime
    const endTime = addMinutesToTime(startTime, availabilityForDay.slotInterval);

    
    // Get all booked slots for that day
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $in: ['pending', 'approved'] }
    });

    const bookedTimes = existingAppointments.map(a => a.startTime);

    if (bookedTimes.includes(startTime)) {
      return res.status(400).json({ message: "Time slot already booked" });
    }

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
    console.error(err);
    res.status(500).json({ message: "Server error" });
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