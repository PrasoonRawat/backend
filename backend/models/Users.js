import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    DOB: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    location: { type: String, required: true },
    govid: { type: [String], default: [] },
    medicalHistory: { type: [String], default: [] },
    appointments: { type: [mongoose.Schema.Types.ObjectId], ref: 'Appointments', default: [] },
    documents: {
        type: [{
            file: { type: String, required: true },
            access: [{
                doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctors', required: true },
                accessExpiry: { type: Date, default: 10 } // Null means no expiry
            }],
            author: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctors', default: null } // Null if uploaded by the user
        }],
        default: []
    },    
    photo: { type: String, default: '' },
    refreshToken: {
        type: String,
        default: null,
      },
      
}, { timestamps: true });

export default mongoose.model("Users", UsersSchema);
