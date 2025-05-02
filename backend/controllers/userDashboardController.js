import User from '../models/Users.js';
import Doctor from '../models/Doctors.js';
import Appointment from "../models/Appointments.js";
import cloudinary from '../config/cloudinary.js';

// export const getUserProfile = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id).select('-password');
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//         res.status(200).json(user);
//     } catch (error) {
//         res.status(500).json({ error: 'Server error' });
//     }
// };

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('fullname DOB gender phone');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Optional: Calculate accurate age on the backend
        const today = new Date();
        const birthDate = new Date(user.DOB);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        const formattedDOB = new Date(user.DOB).toLocaleDateString('en-GB');
        res.status(200).json({
            fullname: user.fullname,
            DOB: user.DOB,
            gender: user.gender,
            phone: user.phone,
            DOB: formattedDOB,
            age,
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getUserAppointments = async (req, res) => {
  try {
    // Fetch the user with their appointment IDs
    const user = await User.findById(req.user.id).populate({
      path: 'appointments',
      populate: {
        path: 'doctor',
        select: 'fullname', // Only get doctor's name
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Map the appointments to extract relevant info
    
    const formattedAppointments = user.appointments.map((appt) => (
      {
      doctorName: appt.doctor?.fullname || 'Unknown',
      date: appt.date,
      time: `${appt.startTime} - ${appt.endTime}`,
      submissionDate: appt.createdAt,
      visitedFor: appt.visitingFor || '',
      status: appt.status || 'Not Confirmed',
    }));

    res.status(200).json({ appointments: formattedAppointments.reverse() });
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get users Documents
export const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("documents.author");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const enrichedDocuments = await Promise.all(
      user.documents.map(async (doc) => {
        const authorId = doc.author;

        let authorDetails = null;
        let fullName = "Unknown";

        // Check in User model
        authorDetails = await User.findById(authorId).select("fullname");
        if (!authorDetails) {
          // Check in Doctor model
          authorDetails = await Doctor.findById(authorId).select("fullname");
        }

        if (authorDetails) {
          fullName = authorDetails.fullname;
        }

        return {
          _id: doc._id,
          file: doc.file,
          author: {
            id: authorId,
            fullname: fullName,
          },
        };
      })
    );

    return res.status(200).json({ documents: enrichedDocuments });
  } catch (error) {
    console.error("Error in getDocuments:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

  

// Get User Documents (Accessible to Authorized Doctors or Authors)
export const getUserDocuments = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('documents');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Filter documents where the requester has access or is the author
        const authorizedDocuments = user.documents.filter(doc => 
            doc.author.toString() === req.user.id || 
            doc.access.some(access => access.doctor.toString() === req.user.id)
        );

        res.status(200).json(authorizedDocuments);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// export const uploadDocument = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: 'No file uploaded' });
//         }

//         const user = await User.findById(req.user.id);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const newDocument = {
//             file: req.file.path,  // Cloudinary URL
//             access: [],
//             author: req.user.id   // Store who uploaded it
//         };

//         user.documents.push(newDocument);
//         await user.save();

//         res.status(201).json({ message: 'Document uploaded successfully', document: newDocument });
//     } catch (error) {
//         res.status(500).json({ error: 'Server error' });
//     }
// };



export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload_stream(
            { folder: 'medical-documents', resource_type: 'auto' },
            async (error, uploadResult) => {
                if (error) return res.status(500).json({ error: 'Cloudinary upload failed' });

                const user = await User.findById(req.user.id);
                if (!user) return res.status(404).json({ error: 'User not found' });

                const newDocument = {
                    file: uploadResult.secure_url,
                    access: [],
                    author: req.user.id
                };

                user.documents.push(newDocument);
                await user.save();

                res.status(201).json({ message: 'Document uploaded successfully', document: newDocument });
            }
        );

        result.end(req.file.buffer);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


// export const grantAccessToDoctor = async (req, res) => {
//     const { documentId, doctorId, accessExpiry } = req.body;

//     try {
//         const user = await User.findById(req.user.id);
//         if (!user) return res.status(404).json({ error: 'User not found' });

//         // Find the document inside user's documents array
//         const document = user.documents.id(documentId);
//         if (!document) return res.status(404).json({ error: 'Document not found' });

//         // Grant access to the doctor
//         document.access.push({
//             doctor: doctorId,
//             accessExpiry: accessExpiry || null, // If no expiry is provided, default to null (permanent access)
//         });

//         await user.save();
//         res.status(200).json({ message: 'Access granted successfully' });

//     } catch (error) {
//         res.status(500).json({ error: 'Server error' });
//     }
// };

export const grantAccessToDoctor = async (req, res) => {
    const { documentId, doctorId, accessExpiry } = req.body;

    try {
        const user = await User.findById(req.user.id);
        const doctor = await Doctor.findById(doctorId);

        if (!user || !doctor) return res.status(404).json({ error: 'User or doctor not found' });

        // Find the document inside user's documents array
        const document = user.documents.id(documentId);
        if (!document) return res.status(404).json({ error: 'Document not found' });

        // Check if access already exists, update expiry if necessary
        const existingAccess = document.access.find(entry => entry.doctor.toString() === doctorId);
        if (existingAccess) {
            existingAccess.accessExpiry = accessExpiry || null; // Update expiry if needed
        } else {
            // Grant access to the doctor
            document.access.push({
                doctor: doctorId,
                accessExpiry: accessExpiry || null, // Default to null (permanent access)
            });
        }

        // Add document reference to doctor's `sharedDocuments` if not already present
        if (!doctor.sharedDocuments.includes(documentId)) {
            doctor.sharedDocuments.push(documentId);
            await doctor.save();
        }

        await user.save();
        res.status(200).json({ message: 'Access granted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
