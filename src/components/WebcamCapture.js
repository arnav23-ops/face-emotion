import React, { useRef, useState } from "react";
import axios from "axios";

function WebcamCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState("");

  const startWebcam = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  const captureImage = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to Blob
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      try {
        const response = await axios.post("http://127.0.0.1:8000/predict", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEmotion(response.data.emotion);
      } catch (error) {
        console.error("Error predicting emotion:", error.response?.data || error.message);
        setEmotion("Error detecting emotion.");
      }
    }, "image/jpeg");
  };

  return (
    <div>
      <h1>Emotion Detector</h1>
      <video ref={videoRef} autoPlay style={{ width: "400px" }}></video>
      <canvas ref={canvasRef} width="400" height="300" style={{ display: "none" }}></canvas>
      <div>
        <button onClick={startWebcam}>Start Webcam</button>
        <button onClick={captureImage}>Capture & Detect Emotion</button>
      </div>
      {emotion && <h2>Detected Emotion: {emotion}</h2>}
    </div>
  );
}

export default WebcamCapture;
