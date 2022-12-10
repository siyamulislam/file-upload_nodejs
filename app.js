const express = require('express');
const app = express();
const multer = require("multer");
const path = require("path");

// storage engine 

const storage = multer.diskStorage({
    destination: './upload/files',
    filename: (req, file, cb) => { 
        // return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
        return cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10000000 //10 MB max
    }
})
app.use('/file', express.static('upload/files'));
app.post("/upload", upload.single('file'), (req, res) => {

    res.json({
        success: 1,
        profile_url: `http://localhost:4000/file/${req.file.filename}`
    })
})

function errHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        res.json({
            success: 0,
            message: err.message
        })
    }
}
app.use(errHandler);
app.listen(4000, () => {
    console.log("server running ~ hit at "+'http://localhost:4000/upload/');
})