import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FiCamera, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FaceCapture = ({ onCapture, onCancel, mode = 'register' }) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user'
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    } else {
      toast.error('Failed to capture image');
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
  };

  const confirm = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      await onCapture(blob);
    } catch (error) {
      console.error('Face capture error:', error);
      toast.error('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'register' ? 'Register Your Face' : 'Verify Your Identity'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {mode === 'register' 
              ? 'Position your face in the center and ensure good lighting'
              : 'Look directly at the camera for verification'}
          </p>
        </div>

        {/* Camera/Preview */}
        <div className="p-6">
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
            {!capturedImage ? (
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
                  <div className="w-64 h-80 border-4 border-blue-500 rounded-full opacity-50"></div>
                </div>
              </>
            ) : (
              <img 
                src={capturedImage} 
                alt="Captured face" 
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Ensure your face is clearly visible</li>
              <li>• Remove glasses if possible</li>
              <li>• Look directly at the camera</li>
              <li>• Ensure good lighting</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          {!capturedImage ? (
            <>
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-smooth font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={capture}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-smooth font-semibold"
              >
                <FiCamera size={20} />
                Capture Photo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retake}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-smooth font-semibold disabled:opacity-50"
              >
                <FiRefreshCw size={20} />
                Retake
              </button>
              <button
                onClick={confirm}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-smooth font-semibold disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheck size={20} />
                    Confirm
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceCapture;
