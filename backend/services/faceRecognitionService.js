const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { pool } = require('../config/database');

// Patch face-api.js to work with Node.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

class FaceRecognitionService {
  constructor() {
    this.modelsLoaded = false;
    this.modelPath = path.join(__dirname, '../models/face-recognition');
    this.uploadPath = path.join(__dirname, '../uploads/faces');
    this.similarityThreshold = parseFloat(process.env.FACE_SIMILARITY_THRESHOLD) || 0.6;
  }

  /**
   * Load face-api models (call once at server startup)
   */
  async loadModels() {
    if (this.modelsLoaded) return;

    try {
      console.log('Loading face recognition models...');
      
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(this.modelPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(this.modelPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(this.modelPath);
      
      this.modelsLoaded = true;
      console.log('✓ Face recognition models loaded successfully');
    } catch (error) {
      console.error('Failed to load face recognition models:', error);
      throw new Error('Face recognition models not available');
    }
  }

  /**
   * Ensure upload directory exists
   */
  async ensureUploadDir() {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Detect face and extract descriptors from image
   */
  async detectFace(imageBuffer) {
    if (!this.modelsLoaded) {
      await this.loadModels();
    }

    // Load image
    const img = await canvas.loadImage(imageBuffer);
    
    // Detect face with landmarks and descriptor
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error('No face detected in image');
    }

    return {
      descriptor: Array.from(detection.descriptor),
      box: detection.detection.box,
      landmarks: detection.landmarks,
      confidence: detection.detection.score
    };
  }

  /**
   * Calculate similarity between two face descriptors
   */
  calculateSimilarity(descriptor1, descriptor2) {
    const euclideanDistance = faceapi.euclideanDistance(descriptor1, descriptor2);
    // Convert distance to similarity score (0-1, higher is more similar)
    const similarity = 1 - Math.min(euclideanDistance, 1);
    return similarity;
  }

  /**
   * Register face for a user
   */
  async registerFace(userId, imageBuffer) {
    await this.ensureUploadDir();

    // Optimize image
    const optimizedImage = await sharp(imageBuffer)
      .resize(640, 480, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Detect face and extract descriptor
    const faceData = await this.detectFace(optimizedImage);

    if (faceData.confidence < 0.5) {
      throw new Error('Face detection confidence too low. Please ensure good lighting and face the camera directly.');
    }

    // Save image
    const filename = `user_${userId}_${Date.now()}.jpg`;
    const filepath = path.join(this.uploadPath, filename);
    await fs.writeFile(filepath, optimizedImage);

    // Store descriptor in database
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `UPDATE users 
         SET face_descriptor = ?, 
             face_image_path = ?, 
             face_verified = TRUE,
             face_registered_at = NOW()
         WHERE id = ?`,
        [JSON.stringify(faceData.descriptor), filename, userId]
      );

      // Log registration
      await connection.query(
        `INSERT INTO face_verification_logs 
         (user_id, verification_type, similarity_score, verified, image_path) 
         VALUES (?, 'registration', ?, TRUE, ?)`,
        [userId, faceData.confidence, filename]
      );

      return {
        success: true,
        confidence: faceData.confidence,
        imagePath: filename
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Verify face against stored descriptor
   */
  async verifyFace(userId, imageBuffer) {
    // Get stored face descriptor
    const connection = await pool.getConnection();
    let storedDescriptor;
    
    try {
      const [users] = await connection.query(
        'SELECT face_descriptor, face_verified FROM users WHERE id = ?',
        [userId]
      );

      if (!users.length || !users[0].face_descriptor) {
        throw new Error('No face registered for this user');
      }

      if (!users[0].face_verified) {
        throw new Error('Face not verified for this user');
      }

      storedDescriptor = JSON.parse(users[0].face_descriptor);
    } finally {
      connection.release();
    }

    // Detect face in provided image
    const faceData = await this.detectFace(imageBuffer);

    // Calculate similarity
    const similarity = this.calculateSimilarity(storedDescriptor, faceData.descriptor);
    const verified = similarity >= this.similarityThreshold;

    // Save verification image temporarily
    await this.ensureUploadDir();
    const filename = `verify_${userId}_${Date.now()}.jpg`;
    const filepath = path.join(this.uploadPath, filename);
    
    const optimizedImage = await sharp(imageBuffer)
      .resize(640, 480, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    await fs.writeFile(filepath, optimizedImage);

    // Log verification attempt
    const conn = await pool.getConnection();
    try {
      await conn.query(
        `INSERT INTO face_verification_logs 
         (user_id, verification_type, similarity_score, verified, image_path) 
         VALUES (?, 'voting', ?, ?, ?)`,
        [userId, similarity, verified, filename]
      );
    } finally {
      conn.release();
    }

    return {
      verified,
      similarity,
      confidence: faceData.confidence,
      threshold: this.similarityThreshold,
      message: verified 
        ? 'Face verified successfully' 
        : `Face verification failed. Similarity: ${(similarity * 100).toFixed(1)}%, Required: ${(this.similarityThreshold * 100).toFixed(1)}%`
    };
  }

  /**
   * Check if user has registered face
   */
  async hasFaceRegistered(userId) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT face_verified FROM users WHERE id = ?',
        [userId]
      );
      return users.length > 0 && users[0].face_verified === 1;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete face data for user
   */
  async deleteFaceData(userId) {
    const connection = await pool.getConnection();
    try {
      // Get image path
      const [users] = await connection.query(
        'SELECT face_image_path FROM users WHERE id = ?',
        [userId]
      );

      if (users.length && users[0].face_image_path) {
        const filepath = path.join(this.uploadPath, users[0].face_image_path);
        try {
          await fs.unlink(filepath);
        } catch (err) {
          console.error('Failed to delete face image:', err);
        }
      }

      // Clear database
      await connection.query(
        `UPDATE users 
         SET face_descriptor = NULL, 
             face_image_path = NULL, 
             face_verified = FALSE,
             face_registered_at = NULL
         WHERE id = ?`,
        [userId]
      );

      return { success: true };
    } finally {
      connection.release();
    }
  }

  /**
   * Get verification logs
   */
  async getVerificationLogs(userId, limit = 10) {
    const connection = await pool.getConnection();
    try {
      const [logs] = await connection.query(
        `SELECT * FROM face_verification_logs 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );
      return logs;
    } finally {
      connection.release();
    }
  }
}

module.exports = new FaceRecognitionService();
