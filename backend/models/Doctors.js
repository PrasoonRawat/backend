import mongoose from "mongoose";

const DoctorsSchema = new mongoose.Schema({
    fullname: { type: String, required: true }, //need this
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    DOB: { type: Date, required: true },
    description: { type: String, required: true }, //need this
    appointments: { type: [mongoose.Schema.Types.ObjectId], ref: 'Appointments', default: [] },
    experience: { type: Number, required: true }, //need this
    specialization: { type: [String], required: true }, //need this
    doctorate: { type: [String], required: true }, //need this
    certification: { type: [String], required: true }, //need this
    educationHistory: { type: [String], required: true },
    pdf: { type: [String], default: [] },
    fee: { type: Number, required: true },
    emergencyFee: { type: Number, required: true },
    location: { type: String, required: true }, //need this
    ratings: { type: Number, min: 0, max: 5, default: 0 }, //need this
    languagesSpoken: { type: [String], required: true }, //need this
    appointments: { type: [mongoose.Schema.Types.ObjectId], ref: 'Appointments', default: [] },
    stories: {type: [mongoose.Schema.Types.ObjectId],ref: 'Stories', default: []},      
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