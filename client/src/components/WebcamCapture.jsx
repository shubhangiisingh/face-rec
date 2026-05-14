import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, CheckCircle } from 'lucide-react';

const WebcamCapture = ({ onCapture, maxImages = 1, buttonText = "Capture Face" }) => {
  const webcamRef = useRef(null);
  const [images, setImages] = useState([]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const newImages = [...images, imageSrc];
      setImages(newImages);
      if (maxImages === 1) {
        onCapture(imageSrc);
      } else {
        onCapture(newImages);
      }
    }
  }, [webcamRef, images, maxImages, onCapture]);

  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user"
  };

  return (
    <div className="webcam-container">
      <div className="webcam-wrapper">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          mirrored={true}
        />
      </div>

      {images.length < maxImages ? (
        <div style={{ textAlign: 'center' }}>
          <button type="button" className="capture-btn" onClick={capture} title={buttonText}>
            <Camera size={24} color="white" style={{ margin: 'auto' }} />
          </button>
          {maxImages > 1 && (
            <p className="subtitle" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              Captured {images.length} / {maxImages} images
            </p>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--success)' }}>
          <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
          <p>All required images captured!</p>
        </div>
      )}

      {maxImages > 1 && images.length > 0 && (
        <div className="face-grid">
          {images.map((img, idx) => (
            <img key={idx} src={img} alt={`Capture ${idx}`} className="face-thumb" />
          ))}
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
