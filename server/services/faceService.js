const axios = require('axios');

// Using axios to communicate with the Flask Python microservice
const registerFace = async (images) => {
  const FLASK_URL = process.env.FLASK_SERVICE_URL || 'https://face-rec-1zxv.onrender.com';
  console.log(`Sending face registration to FLASK_URL: ${FLASK_URL}`);
  try {
    const response = await axios.post(
      `${FLASK_URL}/register_face`,
      { images },
      {
        headers: {
          'X-API-Key': process.env.INTERNAL_API_KEY || 'dev_secret_key',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in faceService.registerFace:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to register face via microservice');
  }
};

const verifyFace = async (faceEmbedding, image) => {
  const FLASK_URL = process.env.FLASK_SERVICE_URL || 'https://face-rec-1zxv.onrender.com';
  try {
    const response = await axios.post(
      `${FLASK_URL}/verify_face`,
      {
        knownEmbedding: faceEmbedding,
        image,
      },
      {
        headers: {
          'X-API-Key': process.env.INTERNAL_API_KEY || 'dev_secret_key',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in faceService.verifyFace:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to verify face via microservice');
  }
};

module.exports = { registerFace, verifyFace };
