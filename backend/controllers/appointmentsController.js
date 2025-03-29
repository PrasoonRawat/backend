import Appointment from '../models/Appointments.js';
import Doctor from '../models/Doctors.js';
import User from '../models/Users.js';

export const requestAppointment = async (req, res) => {
    try {
      const { doctorId, date, startTime, endTime } = req.body;
      const userId = req.user.id;
  
      // Validate Doctor
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  
      // Extract day from the date (e.g., "Monday", "Tuesday")
      const appointmentDay = new Date(date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();  // Convert to lowercase
  
      console.log("Requested appointment day: ", appointmentDay);  // Log the requested appointment day
  
      // Check if the day exists in the doctor's availability
      const isAvailable = doctor.availability.some(slot => {
        const appointmentDate = new Date(date);
        const appointmentDay = appointmentDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase(); // Convert to lowercase
        const doctorDay = slot.day.toLowerCase(); // Convert to lowercase
    
        console.log("Requested appointment day:", appointmentDay);  // "monday"
        console.log("Doctor's availability day:", doctorDay);  // "monday"
        console.log("Requested start time:", startTime);
        console.log("Requested end time:", endTime);
        console.log("Doctor's availability start time:", slot.startTime);
        console.log("Doctor's availability end time:", slot.endTime);
    
        return doctorDay === appointmentDay &&
               slot.startTime === startTime &&
               slot.endTime === endTime &&
               !slot.booked;
    });
    
    
    
    
    function getDayOfWeek(day) {
        const daysMap = {
            "Sunday": 0,
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6
        };
        return daysMap[day];
    }
    
  
      if (!isAvailable) return res.status(400).json({ message: 'Selected time slot is not available' });
  
      // Create Appointment
      const newAppointment = new Appointment({ user: userId, doctor: doctorId, date, startTime, endTime });
      await newAppointment.save();
  
      // Update User & Doctor
      await User.findByIdAndUpdate(userId, { $push: { appointments: newAppointment._id } });
      await Doctor.findByIdAndUpdate(doctorId, { $push: { appointments: newAppointment._id } });
  
      res.status(201).json({ message: 'Appointment requested successfully sent', appointment: newAppointment });
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error });
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