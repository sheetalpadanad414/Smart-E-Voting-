import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import toast from 'react-hot-toast';

const FaceCapture = ({ onCapture, onSkip }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    loadModels();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const loadModels = async () => {
    try {
      console.log('📦 Loading face recognition models...');
      const MODEL_URL = '/models';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      
      console.log('✅ Models loaded successfully');
      setModelsLoaded(true);
      startVideo();
    } catch (error) {
      console.error('❌ Error loading models:', error);
      toast.error('Failed to load face recognition models. Please check if model files exist in /public/models/');
    }
  };

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      toast.error('Please allow camera access to register your face');
    }
  };

  const captureFace = async () => {
    if (!modelsLoaded || !videoRef.current) {
      toast.error('Models not loaded or camera not ready');
      return;
    }

    setCapturing(true);
    
    try {
      console.log('📸 Detecting face...');
      
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        toast.error('No face detected. Please position your face in the frame.');
        setCapturing(false);
        return;
      }

      console.log('✅ Face detected successfully');
      console.log('📊 Descriptor length:', detections.descriptor.length);

      // Draw detection on canvas
      if (canvasRef.current) {
        const displaySize = { 
          width: videoRef.current.videoWidth, 
          height: videoRef.current.videoHeight 
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
      }

      // Convert descriptor to array
      const descriptor = Array.from(detections.descriptor);
      
      // Stop video stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Call parent callback
      onCapture(descriptor);
      
    } catch (error) {
      console.error('❌ Error capturing face:', error);
      toast.error('Failed to capture face. Please try again.');
      setCapturing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Face Registration</h3>
        <p className="text-gray-600 mb-4">
          Position your face in the frame and click capture
        </p>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-auto"
          onLoadedMetadata={() => {
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        
        {!modelsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
              <p>Loading models...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={captureFace}
          disabled={!modelsLoaded || capturing}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
        >
          {capturing ? 'Capturing...' : '📸 Capture Face'}
        </button>
        
        <button
          onClick={onSkip}
          type="button"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Skip for Now
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        💡 Face registration is optional but recommended for enhanced security
      </p>
    </div>
  );
};

export default FaceCapture;
