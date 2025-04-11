// import mongoose from "mongoose";

// const DoctorsSchema = new mongoose.Schema({
//     fullname: { type: String, required: true }, //need this
//     email: { type: String, required: true, unique: true },
//     phone: { type: Number, required: true },
//     password: { type: String, required: true },
    
//     gender: { type: String, require: true },
//     DOB: { type: Date, required: true },
//     age: { type: Number, required: true },
    
//     description: { type: String, required: true }, //need this
    
//     experience: { type: Number, required: true }, //need this
    
//     specialization: { type: [String], required: true }, //need this
//     subspecialization: { type: [String], required: true }, //need this
    
//     doctorate: { type: [String], required: true }, //need this
//     certification: { type: [String], required: true }, //need this
//     educationHistory: { type: [String], required: true },
    
//     pdf: { type: [String], default: [] },
    
//     fee: { type: Number, required: true },
//     emergencyFee: { type: Number, required: true },
    
//     location: { type: String, required: true }, //need this
    
//     ratings: { type: Number, min: 0, max: 5, default: 0 }, //need this
    
//     languagesSpoken: { type: [String], required: true }, //need this
    
//     stories: {type: [mongoose.Schema.Types.ObjectId],ref: 'Stories', default: []},      
    
//     availability: {
//         type: [{
//             day: { type: String, required: true },
//             startTime: { type: String, required: true },
//             endTime: { type: String, required: true },
//             booked: { type: Boolean, default: false }
//         }],
//         default: []
//     },
//     appointments: { type: [mongoose.Schema.Types.ObjectId], ref: 'Appointments', default: [] },
//     sharedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }]
// }, { timestamps: true });

// export default mongoose.model("Doctors", DoctorsSchema);



import mongoose from "mongoose";

const DoctorsSchema = new mongoose.Schema({
    fullname: { type: String, required: true }, //need this
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    DOB: { type: Date, required: true },
    age: { type: Number, required: true },
    experience: { type: Number, required: true }, //need this
    description: { type: String, required: true }, //need this
    specialization: { type: [String], required: true }, //need this
    subspecialization: [{ type: [String], required: true }], //need this
    degrees: { type: [String], required: true }, //need this
    certification: { type: [String], required: true }, //need this
    educationHistory: { type: [String], required: true },
    pdf: { type: [String], default: [] },
    fee: { type: Number, required: true },
    emergencyFee: { type: Number, required: true },
    location: { type: String, required: true }, //need this
    city: { type: String, required: true }, //need this
    ratings: { type: Number, min: 0, max: 5, default: 0 }, //need this
    languagesSpoken: { type: [String], required: true }, //need this
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
    appointments: { type: [mongoose.Schema.Types.ObjectId], ref: 'Appointments', default: [] },
    sharedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
}, { timestamps: true });

export default mongoose.model("Doctors", DoctorsSchema);