import fs from 'fs';
import express from 'express';
import multer from 'multer';
import { google } from 'googleapis';
import apikeys from './api-ggdrive-key.json' assert { type: 'json' };

// Initialize the app
const app = express();
const port = 3000;

// Configure multer for file upload handling
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads'); // Ensure the 'uploads' directory exists
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });
const SCOPE = ['https://www.googleapis.com/auth/drive'];

// Load the OAuth2 client credentials
async function authorize() {
    const jwtClient = new google.auth.JWT(
        apikeys.client_email,
        null,
        apikeys.private_key,
        SCOPE
    );

    await jwtClient.authorize();

    return jwtClient;
}
app.use('/uploads', express.static('uploads'));

// Endpoint for uploading the file
app.get('/upload', (req, res) => {
    res.sendFile('upload.html', { root: '.' });
});

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Upload the file to Google Drive
    const drive = google.drive({ version: 'v3', auth: await authorize() });
    const fileMetadata = {
        name: req.file.originalname,
        parents: ['1G_L37x30iRW3Pl3f9B9nG7YthH_bKmtt'] // Replace with your folder ID
    };
    const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path)
    };

    try {
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });

        // Extract the file ID from the webViewLink
        const fileId = file.data.id;

        //Read file on Google Drive
          // Extract the file ID from the webViewLink
      
        const imageUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
        console.log(file.data.webDataLink);
        console.log(imageUrl);
          // Send the HTML response with the image
        res.send(`
            <p>File uploaded successfully: <a href="${file.data.webViewLink}" target="_blank">View File</a></p>
            <img src="${imageUrl}" alt="Uploaded Image" />
        `);
        //Download the file from Google Drive
        // const dest = fs.createWriteStream(`uploads/${req.file.originalname}`);
        // await drive.files.get(
        //     { fileId: fileId, alt: 'media' },
        //     { responseType: 'stream' },
        //     (err, { data }) => {
        //         if (err) {
        //             console.error('Error downloading file:', err);
        //             return res.status(500).send('Error downloading file');
        //         }
        //         data.pipe(dest);
        //         dest.on('finish', () => {
        //             // Send the HTML response with the image
        //             res.send(`
        //                 <p>File uploaded successfully: <a href="${file.data.webViewLink}" target="_blank">View File</a></p>
        //                 <img src="/uploads/${req.file.originalname}" alt="Uploaded Image" />
        //             `);
        //         });
        //         dest.on('error', (err) => {
        //             console.error('Error writing file:', err);
        //             return res.status(500).send('Error writing file');
        //         });
        //     }
        // );
    } catch (error) {
        res.status(500).send('Error uploading file: ' + error.message);
    } finally {
        // Clean up the uploaded file from the server
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });
    }
});
app.get('/list-files', async (req, res) => {
    try {
        const drive = google.drive({ version: 'v3', auth: await authorize() });

        const response = await drive.files.list({
            pageSize: 10,  // Lấy tối đa 10 tệp tin
            fields: 'nextPageToken, files(id, name, mimeType)',
        });

        const files = response.data.files;
        if (files.length) {
            res.send(`
                <h3>Files in Google Drive:</h3>
                <ul>
                    ${files.map(file => `<li>${file.name} (ID: ${file.id}, Type: ${file.mimeType})</li>`).join('')}
                </ul>
            `);
        } else {
            res.send('No files found.');
        }
    } catch (error) {
        res.status(500).send('Error fetching files: ' + error.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});