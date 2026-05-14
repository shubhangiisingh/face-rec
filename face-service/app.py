import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from face_utils import base64_to_image, get_face_encoding, compare_faces

app = Flask(__name__)
# Allow CORS for all domains for development purposes
CORS(app)

ENCODINGS_DIR = "encodings"
os.makedirs(ENCODINGS_DIR, exist_ok=True)

@app.route('/register_face', methods=['POST'])
def register_face():
    """
    Endpoint to register a user's face. 
    Expects JSON: { "userId": "...", "images": ["base64_str1", "base64_str2", ...] }
    """
    try:
        data = request.json
        user_id = data.get('userId')
        images_base64 = data.get('images', [])

        if not user_id or not images_base64:
            return jsonify({"error": "Missing userId or images"}), 400

        encodings = []
        for idx, b64_img in enumerate(images_base64):
            img = base64_to_image(b64_img)
            if img is None:
                continue
            
            encoding = get_face_encoding(img)
            if encoding is not None:
                encodings.append(encoding)

        if not encodings:
            return jsonify({"error": "No faces found in the provided images"}), 400

        # Average the encodings for a more robust profile
        avg_encoding = np.mean(encodings, axis=0)
        
        # Save encoding to disk as a numpy array
        filepath = os.path.join(ENCODINGS_DIR, f"{user_id}.npy")
        np.save(filepath, avg_encoding)

        return jsonify({"message": "Face registered successfully", "status": "success"}), 200

    except Exception as e:
        print(f"Error in register_face: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/verify_face', methods=['POST'])
def verify_face():
    """
    Endpoint to verify a user's face for login.
    Expects JSON: { "userId": "...", "image": "base64_str" }
    """
    try:
        data = request.json
        user_id = data.get('userId')
        image_base64 = data.get('image')

        if not user_id or not image_base64:
            return jsonify({"error": "Missing userId or image"}), 400

        filepath = os.path.join(ENCODINGS_DIR, f"{user_id}.npy")
        if not os.path.exists(filepath):
            return jsonify({"error": "Face not registered for this user"}), 404

        # Load stored encoding
        known_encoding = np.load(filepath)

        # Process new image
        img = base64_to_image(image_base64)
        if img is None:
            return jsonify({"error": "Invalid image"}), 400

        face_encoding = get_face_encoding(img)
        if face_encoding is None:
            return jsonify({"error": "No face found in image", "match": False}), 400

        # Compare using strict tolerance for MFA
        is_match, distance = compare_faces(known_encoding, face_encoding, tolerance=0.5)

        return jsonify({
            "match": is_match,
            "distance": distance,
            "status": "success"
        }), 200

    except Exception as e:
        print(f"Error in verify_face: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    # Run the Flask app
    app.run(host='0.0.0.0', port=5005, debug=True)
