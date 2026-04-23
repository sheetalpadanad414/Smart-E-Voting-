@echo off
echo ========================================
echo Face Recognition Models Downloader
echo ========================================
echo.

cd frontend\public\models

echo Downloading model files...
echo.

echo [1/8] tiny_face_detector_model-weights_manifest.json
curl -L -o tiny_face_detector_model-weights_manifest.json https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json

echo [2/8] tiny_face_detector_model-shard1
curl -L -o tiny_face_detector_model-shard1 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1

echo [3/8] face_landmark_68_model-weights_manifest.json
curl -L -o face_landmark_68_model-weights_manifest.json https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json

echo [4/8] face_landmark_68_model-shard1
curl -L -o face_landmark_68_model-shard1 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1

echo [5/8] face_recognition_model-weights_manifest.json
curl -L -o face_recognition_model-weights_manifest.json https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json

echo [6/8] face_recognition_model-shard1
curl -L -o face_recognition_model-shard1 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1

echo [7/8] face_expression_model-weights_manifest.json
curl -L -o face_expression_model-weights_manifest.json https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json

echo [8/8] face_expression_model-shard1
curl -L -o face_expression_model-shard1 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1

echo.
echo ========================================
echo Download Complete!
echo ========================================
echo.
echo Models saved to: frontend\public\models\
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& npm start
echo 2. Start frontend: cd frontend ^&^& npm start
echo 3. Test at: http://localhost:3000/register
echo.
pause
