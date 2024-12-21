import fs from 'fs';
import { Dropbox } from 'dropbox';
import fetch from 'node-fetch'; // Required by Dropbox SDK for Node.js

// Replace with your access token
const ACCESS_TOKEN = 'sl.CApISmjG-LzjQ2TI29nR7Njzg8W7jHOCEXbw3CXkcU8krnc-QWrd_ZsOk_EQMQEOhxekbrJvNEjyBzKriWFuCFct8bMTXLKokWEDsAVCfN5BRi45aNjbg00bwNZZcHIwTXOZceqE4D1NTvhBAwbz';

const dbx = new Dropbox({ accessToken: ACCESS_TOKEN, fetch: fetch });

async function uploadImageToDropbox(filePath, dropboxPath) {
  try {
    // Read the file as a binary buffer
    const fileContent = fs.readFileSync(filePath);
    console.log('File read successfully:', fileContent);
    // Upload to Dropbox
    const response = await dbx.filesUpload({
      path: dropboxPath,
      contents: fileContent,
    });
    
    console.log('File uploaded successfully:', response);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

// Usage: Set the local path to the file and the desired Dropbox path
uploadImageToDropbox('./jennie-1-1834.jpg', '/image01.jpg');
