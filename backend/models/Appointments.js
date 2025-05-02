// import mongoose from "mongoose";

// const AppointmentsSchema = new mongoose.Schema({
//     doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctors', required: true },
//     patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
//     date: { type: Date, required: true },
//     timeSlot: { type: String, required: true }, // e.g., "10:00 AM - 11:00 AM"
//     status: { type: String, enum: ['pending', 'accepted', 'denied', 'completed'], default: 'pending' },
//     reason: { type: String, default: '' } // Used if the appointment is denied
// }, { timestamps: true });

// export default mongoose.model("Appointments", AppointmentsSchema);

import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctors', required: true },
  visitingFor: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'denied', 'completed'], default: 'pending' },
  reason: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Appointments', appointmentSchema);
