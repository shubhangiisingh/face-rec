import cv2
import numpy as np
import base64
import os

try:
    from deepface import DeepFace
    FACE_REC_AVAILABLE = True
    print("DeepFace library loaded successfully.")
except ImportError:
    FACE_REC_AVAILABLE = False
    print("WARNING: DeepFace library is not installed.")
    print("Using Mock implementation for testing the flow.")

def base64_to_image(base64_string):
    """Converts a base64 string to an OpenCV BGR image"""
    try:
        # Remove header if present (e.g. data:image/jpeg;base64,...)
        if "base64," in base64_string:
            base64_string = base64_string.split("base64,")[1]
        
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding base64 image: {e}")
        return None

def get_face_encoding(image):
    """Finds the first face in the image and returns its 512-d ArcFace encoding"""
    if not FACE_REC_AVAILABLE:
        # Return a dummy 512-dimensional array for testing purposes
        return np.random.rand(512)

    try:
        # DeepFace represent returns a list of dictionaries.
        # We use ArcFace, which outputs a 512-d embedding.
        results = DeepFace.represent(img_path=image, model_name="ArcFace", enforce_detection=True)
        if len(results) > 0:
            return np.array(results[0]["embedding"])
        return None
    except ValueError as ve:
        # Raised when no face is found
        print(f"No face detected: {ve}")
        return None
    except Exception as e:
        print(f"Error getting face encoding: {e}")
        return None

def compare_faces(known_encoding, face_encoding_to_check, tolerance=0.68):
    """Compares a known encoding against a new encoding to see if they match."""
    if not FACE_REC_AVAILABLE:
        # In mock mode, we just assume it's a match 90% of the time
        is_match = np.random.rand() > 0.1
        distance = 0.3 if is_match else 0.8
        return is_match, float(distance)

    # ArcFace typically uses Cosine distance.
    a = np.array(known_encoding)
    b = np.array(face_encoding_to_check)
    
    # Normalize vectors
    a = a / np.linalg.norm(a)
    b = b / np.linalg.norm(b)
    
    cosine_distance = 1 - np.dot(a, b)
    
    # Standard threshold for ArcFace cosine distance is ~0.68.
    # We use 0.60 for stricter MFA.
    is_match = cosine_distance < 0.60
    return bool(is_match), float(cosine_distance)
