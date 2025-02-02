import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import crypto from 'crypto';  // To generate the signature

cloudinary.config({
  cloud_name: "pranav1109",
  api_key: "695862193852954",
  api_secret: "kYlBW9ZAzF4E2EmT9iD5nheJeG4",
});

const generateSignature = (timestamp) => {
  const hash = crypto.createHash('sha1');
  const api_secret = cloudinary.config().api_secret;
  const signature_string = `timestamp=${timestamp}${api_secret}`;
  return hash.update(signature_string).digest('hex');
};

const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) {
      return null;
    }

    const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
    const signature = generateSignature(timestamp);  // Generate a signature

    const result = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
      timestamp: timestamp,  // Add explicit timestamp
      signature: signature,  // Include the generated signature
      api_key: cloudinary.config().api_key  // Pass the API key explicitly
    });

    // Delete the local file after successful upload
    fs.unlinkSync(localfilepath);
    return result.url;

  } catch (error) {
    // Delete the local file on error
    // fs.unlinkSync(localfilepath);
    console.error('Upload error:', error);
    return null;
  }
};

export default uploadOnCloudinary;
