import mongoose from "mongoose";

const DoctorsSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    DOB: { type: Date, required: true },
    appointments: { type: [mongoose.Schema.Types.ObjectId], ref: 'Appointments', default: [] },
    experience: { type: Number, required: true },
    specialization: { type: [String], required: true },
    doctorate: { type: [String], required: true },
    certification: { type: [String], required: true },
    educationHistory: { type: [String], required: true },
    pdf: { type: [String], default: [] },
    fee: { type: Number, required: true },
    emergencyFee: { type: Number, required: true },
    location: { type: String, required: true },
    ratings: { type: Number, min: 0, max: 5, default: 0 },
    languagesSpoken: { type: [String], required: true },
    appointments: { type: [mongoose.Schema.Types.ObjectId], ref: 'Appointments', default: [] },
    availability: {
        type: [{
            day: { type: String, required: true },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            booked: { type: Boolean, default: false }
        }],
        default: []
    },
    sharedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }]
}, { timestamps: true });

export default mongoose.model("Doctors", DoctorsSchema);