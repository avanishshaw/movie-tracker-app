import multer from 'multer';

const storage = multer.memoryStorage(); // Stores file in memory
const upload = multer({ storage: storage });

export default upload;