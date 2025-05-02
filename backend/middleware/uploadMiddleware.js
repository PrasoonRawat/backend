// import multer from 'multer';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import cloudinary from '../config/cloudinary.js';

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'medical-documents',
//         allowed_formats: ['jpg', 'png', 'pdf']
//     }
// });

// const upload = multer({ storage });

// export default upload;
//Example

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;