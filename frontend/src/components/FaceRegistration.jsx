import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useFaceRecognition } from '../hooks/useFaceRecognition';
import { faceAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiCamera, FiCheck, FiX, FiLoader } from 'react-icons/fi';

const FaceRegistration = ({ onSuccess, onCancel }) => {
  const webcamRef = useRef(null);
  const imageRef = useRef(null);
  const [captured, setCaptured] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const { modelsLoaded, loading: modelsLoading, detectFace } = useFaceRecognition();

  console.log('🎭 FaceRegistration Component Rendered');
  console.log('📦 Props:', { hasOnSuccess: !!onSuccess, hasOnCancel: !!onCancel });
  console.log('🔧 State:', { modelsLoaded, modelsLoading, captured, processing });

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user'
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    setCaptured(true);
  };

  const retake = () => {
    setImageSrc(null);
    setCaptured(false);
  };

  const registerFace = async () => {
    if (!imageSrc || !modelsLoaded) {
      console.error('❌ Cannot register: imageSrc or models not loaded');
      toast.error('Cannot register face. Please try again.');
      return;
    }

    setProcessing(true);
    console.log('🎭 Starting face registration...');
    console.log('📷 Image source length:', imageSrc?.length);
    console.log('🤖 Models loaded:', modelsLoaded);
    
    try {
      // Create image element
      const img = new Image();
      img.src = imageSrc;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(() => reject(new Error('Image load timeout')), 5000);
      });

      console.log('📸 Image loaded successfully, detecting face...');
      
      // Detect face and get descriptor
      const { descriptor, confidence } = await detectFace(img);

      console.log('✅ Face detected!');
      console.log('   Confidence:', confidence);
      console.log('   Descriptor length:', descriptor?.length);

      if (confidence < 0.5) {
        console.warn('⚠️ Low confidence:', confidence);
        toast.error('Face detection confidence too low. Please ensure good lighting and try again.');
        setProcessing(false);
        return;
      }

      console.log('💾 Storing face descriptor in database...');
      console.log('   Descriptor:', descriptor.slice(0, 5), '... (truncated)');
      console.log('   Descriptor length:', descriptor.length);
      console.log('   Token in localStorage:', !!localStorage.getItem('token'));
      
      // Store descriptor in database
      const response = await faceAPI.storeFaceDescriptor(descriptor);
      
      console.log('✅ Backend response:', response.data);
      console.log('   Success:', response.data.success);
      console.log('   Message:', response.data.message);
      console.log('   Data:', response.data.data);
      console.log('✅ Face descriptor stored successfully in database!');
      
      toast.success('Face registered successfully!');
      
      console.log('🎯 Calling onSuccess callback...');
      console.log('   onSuccess exists:', !!onSuccess);
      console.log('   onSuccess type:', typeof onSuccess);
      
      // Call the success callback
      if (typeof onSuccess === 'function') {
        console.log('✅ Executing onSuccess callback NOW...');
        try {
          onSuccess();
          console.log('✅ onSuccess callback executed successfully!');
        } catch (callbackError) {
          console.error('❌ Error in onSuccess callback:', callbackError);
          // Still try fallback redirect
          handleFallbackRedirect();
        }
      } else {
        console.error('❌ onSuccess is not a function!', onSuccess);
        // Fallback redirect
        handleFallbackRedirect();
      }
    } catch (error) {
      console.error('❌ Face registration error:', error);
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      toast.error(error.message || 'Face registration failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleFallbackRedirect = async () => {
    console.log('🔄 Fallback: Redirecting directly...');
    const pendingUser = sessionStorage.getItem('pendingUser');
    const pendingToken = sessionStorage.getItem('pendingToken');
    
    if (pendingUser && pendingToken) {
      try {
        const userObj = JSON.parse(pendingUser);
        localStorage.setItem('token', pendingToken);
        localStorage.setItem('user', pendingUser);
        sessionStorage.removeItem('pendingUser');
        sessionStorage.removeItem('pendingToken');
        
        console.log('✅ Credentials moved to localStorage');
        toast.success('Finding active election...');
        
        // Try to find first active election
        try {
          const { voterAPI } = await import('../services/api');
          const response = await voterAPI.getAvailableElections(1, 200);
          const elections = response.data.elections || [];
          
          const now = new Date();
          const activeElection = elections.find(election => {
            const start = new Date(election.start_date);
            const end = new Date(election.end_date);
            return election.status === 'active' && now >= start && now <= end;
          });
          
          if (activeElection) {
            console.log('🎯 Redirecting to voting page:', activeElection.id);
            toast.success(`Redirecting to vote in: ${activeElection.title}`);
            setTimeout(() => {
              window.location.href = `/elections/${activeElection.id}/vote`;
            }, 1500);
            return;
          }
        } catch (electionError) {
          console.error('❌ Error fetching elections:', electionError);
        }
        
        // Fallback to elections page
        console.log('🔄 No active election, redirecting to elections page');
        toast('Redirecting to Elections...');
        setTimeout(() => {
          window.location.href = '/elections';
        }, 1500);
      } catch (e) {
        console.error('❌ Error in fallback redirect:', e);
        toast.error('Please login again');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } else {
      console.error('❌ No pending credentials found');
      toast.error('Session expired. Please login again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  };

  if (modelsLoading) {
    console.log('⏳ Models still loading...');
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <div className="flex flex-col items-center justify-center">
            <FiLoader className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">Loading face recognition models...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Models loaded, rendering full modal');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Register Your Face
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Position your face in the center and ensure good lighting
          </p>
        </div>

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
                  <div className="w-64 h-80 border-4 border-blue-500 rounded-full opacity-50"></div>
                </div>
              </>
            ) : (
              <img 
                ref={imageRef}
                src={imageSrc} 
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
              <li>• Keep a neutral expression</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          {!captured ? (
            <>
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-smooth font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={captureImage}
                disabled={!modelsLoaded}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-smooth font-semibold disabled:opacity-50"
              >
                <FiCamera size={20} />
                Capture Photo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retake}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-smooth font-semibold disabled:opacity-50"
              >
                <FiX size={20} />
                Retake
              </button>
              <button
                onClick={registerFace}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-smooth font-semibold disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <FiLoader className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheck size={20} />
                    Register Face
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

export default FaceRegistration;
