import dotenv from 'dotenv';
dotenv.config();

const createUrl = (fileId) =>{
    const apiKey = process.env.GOOGLE_API_KEY;
   const result = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    //  console.log('Result:', result);
   return result;
}
export default createUrl;