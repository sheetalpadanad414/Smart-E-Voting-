import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useFaceRecognition } from '../hooks/useFaceRecognition';
import { faceAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiCamera, FiCheck, FiX, FiLoader, FiAlertCircle } from 'react-icons/fi';

const FaceVerification = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [captured, setCaptured] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [storedDescriptor, setStoredDescriptor] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  
  const { modelsLoaded, loading: modelsLoading, detectFace, compareFaces } = useFaceRecognition();

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user'
  };

  // Load stored face descriptor
  useEffect(() => {
    const loadStoredDescriptor = async () => {
      try {
        const response = await faceAPI.getFaceDescriptor();
        setStoredDescriptor(response.data.data.descriptor);
      } catch (error) {
        console.error('Failed to load stored descriptor:', error);
        toast.error('No face registered. Please register your face first.');
        setTimeout(() => navigate('/register'), 2000);
      }
    };

    if (modelsLoaded) {
      loadStoredDescriptor();
    }
  }, [modelsLoaded, navigate]);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    setCaptured(true);
  };

  const retake = () => {
    setImageSrc(null);
    setCaptured(false);
    setVerificationResult(null);
  };

  const verifyFace = async () => {
    if (!imageSrc || !modelsLoaded || !storedDescriptor) return;

    setProcessing(true);
    try {
      // Create image element
      const img = new Image();
      img.src = imageSrc;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Detect face and get descriptor
      const { descriptor, confidence } = await detectFace(img);

      if (confidence < 0.5) {
        toast.error('Face detection confidence too low. Please ensure good lighting.');
        setProcessing(false);
        return;
      }

      // Compare with stored descriptor
      const comparison = compareFaces(storedDescriptor, descriptor);

      // Log verification attempt
      await faceAPI.logVerification(comparison.match, comparison.similarity);

      setVerificationResult(comparison);

      if (comparison.match) {
        toast.success('Face verified successfully!');
        setTimeout(() => {
          navigate('/elections'); // Redirect to elections page
        }, 2000);
      } else {
        toast.error(`Face verification failed. Similarity: ${(comparison.similarity * 100).toFixed(1)}%`);
      }
    } catch (error) {
      console.error('Face verification error:', error);
      toast.error(error.message || 'Face verification failed');
    } finally {
      setProcessing(false);
    }
  };

  const useFallback = () => {
    toast.info('Redirecting to OTP verification...');
    navigate('/verify-otp');
  };

  if (modelsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
        <FiLoader className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-gray-600 dark:text-gray-400">Loading face recognition models...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Face Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verify your identity to proceed with voting
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Camera/Preview */}
          <div className="p-6">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              {!captured ? (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-full h-full object-cover"
                    mirrored={true}
                  />
                  {/* Face guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-80 border-4 border-green-500 rounded-full opacity-50"></div>
                  </div>
                </>
              ) : (
                <img 
                  src={imageSrc} 
                  alt="Captured face" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Verification Result */}
            {verificationResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                verificationResult.match 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-3">
                  {verificationResult.match ? (
                    <FiCheck className="text-green-600 dark:text-green-400" size={24} />
                  ) : (
                    <FiAlertCircle className="text-red-600 dark:text-red-400" size={24} />
                  )}
                  <div>
                    <p className={`font-semibold ${
                      verificationResult.match 
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {verificationResult.match ? 'Verification Successful!' : 'Verification Failed'}
                    </p>
                    <p className={`text-sm ${
                      verificationResult.match 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Similarity: {(verificationResult.similarity * 100).toFixed(1)}% 
                      (Threshold: 40%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Look directly at the camera</li>
                <li>• Ensure your face is well-lit</li>
                <li>• Remove glasses if possible</li>
                <li>• Keep a neutral expression</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {!captured ? (
              <div className="flex gap-3">
                <button
                  onClick={useFallback}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-smooth font-semibold"
                >
                  Use OTP Instead
                </button>
                <button
                  onClick={captureImage}
                  disabled={!modelsLoaded || !storedDescriptor}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-smooth font-semibold disabled:opacity-50"
                >
                  <FiCamera size={20} />
                  Capture & Verify
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={retake}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-smooth font-semibold disabled:opacity-50"
                >
                  <FiX size={20} />
                  Retake
                </button>
                {!verificationResult && (
                  <button
                    onClick={verifyFace}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-smooth font-semibold disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <FiLoader className="animate-spin" size={20} />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiCheck size={20} />
                        Verify Face
                      </>
                    )}
                  </button>
                )}
                {verificationResult && !verificationResult.match && (
                  <button
                    onClick={useFallback}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-smooth font-semibold"
                  >
                    Use OTP Instead
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceVerification;
