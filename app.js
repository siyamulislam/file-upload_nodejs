const express = require('express');
const multer = require('multer');
const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'));


// Define the custom error handling middleware
function handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ success: 0, message: err.message });
    } else if (err) {
      res.status(500).json({ success: 0, message: 'An unknown error occurred' });
    } else {
      next(); // Pass control to the next middleware if there are no errors
    }
  }
  
  // Attach the error handling middleware
  app.use(handleUploadError);


// Define storage with a custom filename function for singleUpload
const singleUpload = multer({
  dest: 'uploads',
  limits: { fileSize: 10000000 },
  storage: multer.diskStorage({
    destination: 'uploads/profile', // Only specify the relative path here
    filename: function (req, file, cb) {
      // Customize the filename here
      const uniqueSuffix = Date.now() + '-' +  Math.floor(100 + Math.random() * 900);
      cb(null, uniqueSuffix +'-'+ file.originalname);
    },
  }),
}).single('file');

// Define storage with a custom filename function for multipleUpload
const multipleUpload = multer({
  dest: 'uploads',
  storage: multer.diskStorage({
    destination: 'uploads/products', // Only specify the relative path here
    filename: function (req, file, cb) {
      // Customize the filename here
      const uniqueSuffix = Date.now() + '-' +  Math.floor(100 + Math.random() * 900);
      cb(null, uniqueSuffix +'-'+ file.originalname);
    },
  }),
}).array('files', 3);

// For single file upload
app.post('/upload', singleUpload, (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send('File uploaded!');
});

// For multiple file upload
app.post('/upload-multiple', multipleUpload, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }
  res.send(`${req.files.length} file(s) uploaded!`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
