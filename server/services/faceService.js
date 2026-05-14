const axios = require('axios');

// Using axios to communicate with the Flask Python microservice
const registerFace = async (userId, images) => {
  const FLASK_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:5000';
  console.log(`Sending face registration to FLASK_URL: ${FLASK_URL}`);
  try {
    const response = await axios.post(`${FLASK_URL}/register_face`, {
      userId,
      images
    });
    return response.data;
  } catch (error) {
    console.error('Error in faceService.registerFace:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to register face via microservice');
  }
};

const verifyFace = async (userId, image) => {
  const FLASK_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:5000';
  try {
    const response = await axios.post(`${FLASK_URL}/verify_face`, {
      userId,
      image
    });
    return response.data;
  } catch (error) {
    console.error('Error in faceService.verifyFace:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to verify face via microservice');
  }
};

module.exports = { registerFace, verifyFace };
