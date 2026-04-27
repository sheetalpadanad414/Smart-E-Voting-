import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models'; // Models will be in public/models folder

export const useFaceRecognition = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const modelsLoadedRef = useRef(false);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoadedRef.current) return;
      
      try {
        setLoading(true);
        console.log('Loading face recognition models...');
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        modelsLoadedRef.current = true;
        setModelsLoaded(true);
        console.log('✓ Face recognition models loaded');
      } catch (err) {
        console.error('Failed to load models:', err);
        setError('Failed to load face recognition models');
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  // Detect face and get descriptor
  const detectFace = async (imageElement) => {
    if (!modelsLoaded) {
      throw new Error('Models not loaded yet');
    }

    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error('No face detected. Please ensure your face is clearly visible.');
    }

    return {
      descriptor: Array.from(detection.descriptor),
      confidence: detection.detection.score
    };
  };

  // Compare two face descriptors
  const compareFaces = (descriptor1, descriptor2) => {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    const similarity = 1 - distance;
    return {
      distance,
      similarity,
      match: distance < 0.6 // Threshold for match
    };
  };

  return {
    modelsLoaded,
    loading,
    error,
    detectFace,
    compareFaces
  };
};
