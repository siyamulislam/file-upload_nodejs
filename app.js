const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 4000;

app.use(express.json());
app.use(express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

// upload middle ware
const uploadOneMiddleware = (req, res, next) => {
    const singleUpload = multer({
        dest: 'uploads',
        limits: { fileSize: 10000000 },
        storage: multer.diskStorage({
            destination: 'uploads/profile',
            filename: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.floor(100 + Math.random() * 900);
                cb(null, uniqueSuffix + '-' + file.originalname);
            },
        },),
        fileFilter: (req, file, cb) => {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
                cb(null, true);
            } else {
                cb(new Error('Invalid mime type'));
            }
        }
    }).single('file');
    singleUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            err.status = 400
            next(err)
        } else if (err) {
            if(err.message==='Invalid mime type')
            err.status=400
            next(err)
        } else if (err) {
            const err = new Error('Server Error')
            next(err)
        }
        next()
    })
}
const uploadManyMiddleware = (req, res, next) => {
    const multipleUpload = multer({
        dest: 'uploads',
        storage: multer.diskStorage({
            destination: 'uploads/products',
            filename: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.floor(100 + Math.random() * 900);
                cb(null, uniqueSuffix + '-' + file.originalname);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
                cb(null, true);
            } else {
                cb(new Error('Invalid mime type'));
            }
        }
    }).array('files', 3);
    multipleUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            err.status = 400
            next(err)
        } else if (err) {
            if(err.message==='Invalid mime type')
            err.status=400
            next(err)
        } else if (err) {
            const err = new Error('Server Error')
            next(err)
        }
        next()
    })
}

// For single file upload
app.post('/upload', uploadOneMiddleware, (req, res) => {
    if (!req.file)
        return res.status(400).send('No file uploaded.');
    res.send('File uploaded!');
});

// For multiple file upload
app.post('/upload-multiple', uploadManyMiddleware, (req, res) => {
    if (!req.files || req.files.length === 0)
        return res.status(400).send('No files uploaded.');
    res.send(`${req.files.length} file(s) uploaded!`);
});

// delete route
app.delete('/api/delete-one/:imageId', (req, res) => {
    const imageId = req.params.imageId;
    const imagePath = `uploads/profile/${imageId}`;
  
    fs.unlink(imagePath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to delete the image' , error: err.toString()});
      }
      res.json({ message: 'Image deleted successfully' });
    });
  });
  
  app.delete('/api/delete-many', async (req, res) => {
    const imageIds = req.body.imageIds; // An array of image identifiers
  
    try {
      // Use Promise.all to asynchronously delete images and wait for all deletions to complete
      await Promise.all(
        imageIds.map((imageId) => {
          return new Promise((resolve, reject) => {
            const imagePath = `uploads/products/${imageId}`;
            fs.unlink(imagePath, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        })
      );
  
      res.json({ message: 'Images deleted successfully' });
    } catch (err) {
      // Handle errors from image deletions
      console.error(err);
      res.status(500).json({ message: 'Failed to delete images', error: err.toString() });
    }
  });
  
  




// Error-handling middleware
app.use((err, req, res, next) => {
    res.status(err.status ? err.status : 500).json({ error: err.message });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
