import express from "express";
import driveController from "./DriveController.js";
const router = express.Router();

import multer from "multer";
const upload = multer({ dest: 'uploads/' });
router.post("/upload", upload.single('file'), driveController.upload); 
// router.post("/download", downloadFile);
// router.post("/delete", deleteFile);
// router.get("/list", getAllFiles);
//
router.get('/load-file', (req, res) => {
    res.sendFile('upload.html', { root: 'src/templates' });
});



export default router;