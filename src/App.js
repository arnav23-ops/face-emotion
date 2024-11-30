import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // Import the custom CSS

const RealTimeEmotionDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const emotionConfig = {
    'happy': {
      color: 'emotion-happy',
      icon: '😄',
      description: 'Feeling joyful and positive'
    },
    'sad': {
      color: 'emotion-sad',
      icon: '😢',
      description: 'Experiencing sadness or melancholy'
    },
    'angry': {
      color: 'emotion-angry',
      icon: '😠',
      description: 'Feeling frustrated or irritated'
    },
    'fear': {
      color: 'emotion-fear',
      icon: '😱',
      description: 'Experiencing anxiety or nervousness'
    },
    'surprise': {
      color: 'emotion-surprise',
      icon: '😮',
      description: 'Caught off guard or amazed'
    },
    'neutral': {
      color: 'emotion-neutral',
      icon: '😐',
      description: 'Calm and composed'
    },
    'disgust': {
      color: 'emotion-disgust',
      icon: '🤢',
      description: 'Feeling repulsed or grossed out'
    }
  };

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Could not access webcam. Please check permissions.");
    }
  };

  // Capture and send frame for emotion detection
  const detectEmotion = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Set canvas dimensions to match the video feed
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height); // Draw the current video frame to the canvas

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      try {
        const response = await axios.post('http://localhost:8000/detect-emotion/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setEmotion(response.data.emotion);
        setConfidence(response.data.confidence);
        setError(null);
      } catch (err) {
        console.error("Emotion detection error:", err);
        setError("Failed to detect emotion. Please try again.");
        setEmotion('');
        setConfidence(0);
      }
    }, 'image/jpeg');
  };

  // Start continuous emotion detection
  const startDetection = () => {
    setIsDetecting(true);
    const intervalId = setInterval(() => {
      detectEmotion();
    }, 1000);

    return () => clearInterval(intervalId);
  };

  // Stop detection
  const stopDetection = () => {
    setIsDetecting(false);
    setEmotion('');
    setConfidence(0);
  };

  useEffect(() => {
    startWebcam();

    return () => {
      const stream = videoRef.current?.srcObject;
      const tracks = stream?.getTracks();
      tracks?.forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="emotion-container">
      <div className="emotion-box">
        <div className="header">
          <h1>Emotion Detector </h1>
        </div>

        <div className="video-container">
          <div className="video-wrapper">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="video-element"
            />
          </div>
          {/* <canvas> element is hidden and not displayed */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="button-container">
          {!isDetecting ? (
            <button 
              onClick={startDetection}
              className="start-btn"
            >
              Start Detection
            </button>
          ) : (
            <button 
              onClick={stopDetection}
              className="stop-btn"
            >
              Stop Detection
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            <div className="error-box">
              {error}
            </div>
          </div>
        )}

        {emotion && (
          <div className={`emotion-result ${emotionConfig[emotion].color}`}>
            <div className="emotion-icon">
              {emotionConfig[emotion].icon}
            </div>
            <h2 className="emotion-title">
              {emotion} Emotion
            </h2>
            <p className="emotion-description">
              {emotionConfig[emotion].description}
            </p>
            <div className="confidence-box">
              <p className="confidence-text">
                Confidence: {(confidence * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeEmotionDetector;
