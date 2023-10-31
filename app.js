const express = require('express');
const multer = require('multer');
const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'));

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
        }),
    }).single('file');
    singleUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            err.status = 400
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
    }).array('files', 3);
    multipleUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            err.status = 400
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

// Error-handling middleware
app.use((err, req, res, next) => {
    res.status(err.status ? err.status : 500).json({ error: err });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
