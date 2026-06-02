import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from face_utils import base64_to_image, get_face_encoding, compare_faces
from functools import wraps

app = Flask(__name__)
# Allow CORS for all domains for development purposes
CORS(app)

INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY", "dev_secret_key")

def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get("X-API-Key")
        if not api_key or api_key != INTERNAL_API_KEY:
            return jsonify({"error": "Unauthorized: Invalid or missing API key"}), 401
        return f(*args, **kwargs)
    return decorated


@app.route('/register_face', methods=['POST'])
@require_api_key
def register_face():
    """
    Endpoint to register a user's face. 
    Expects JSON: { "images": ["base64_str1", "base64_str2", ...] }
    Returns JSON: { "embedding": [...], "status": "success" }
    """
    try:
        data = request.json
        images_base64 = data.get('images', [])

        if not images_base64:
            return jsonify({"error": "Missing images"}), 400

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

        # Return embedding array as a standard JSON list
        return jsonify({
            "embedding": avg_encoding.tolist(),
            "status": "success"
        }), 200

    except Exception as e:
        print(f"Error in register_face: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/verify_face', methods=['POST'])
@require_api_key
def verify_face():
    """
    Endpoint to verify a user's face for login.
    Expects JSON: { "knownEmbedding": [...], "image": "base64_str" }
    """
    try:
        data = request.json
        known_encoding_list = data.get('knownEmbedding')
        image_base64 = data.get('image')

        if not known_encoding_list or not image_base64:
            return jsonify({"error": "Missing knownEmbedding or image"}), 400

        # Convert list back to numpy array
        known_encoding = np.array(known_encoding_list)

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
