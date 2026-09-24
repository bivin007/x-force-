/**
 * Hand Detector & Vision Pipeline for SignBridge Counter
 * Supports MediaPipe Hands, Live Camera, Video Dataset Playback & Inference,
 * Video File Uploads, Simulated Public Backgrounds, and Lighting Filters.
 */

import { LANDMARK } from './mathUtils.js';

export const VIDEO_PRESETS = {
  REAL_CAMERA: 'real',
  BANK_COUNTER: 'bank',
  HOSPITAL_CORRIDOR: 'hospital',
  GOV_OFFICE: 'government',
  BLUR_BOKEH: 'blur',
  HIGH_NOISE: 'noise'
};

export const LIGHTING_MODES = {
  NORMAL: 'normal',
  LOW_LIGHT: 'low_light',
  HIGH_CONTRAST: 'high_contrast',
  OVEREXPOSED: 'overexposed',
  EDGE_BOOST: 'edge_boost'
};

export class HandDetector {
  constructor(videoElement, canvasElement, onResultsCallback) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.ctx = canvasElement.getContext('2d', { willReadFrequently: true });
    this.onResultsCallback = onResultsCallback;

    this.hands = null;
    this.camera = null;
    this.isRunning = false;
    this.isCameraActive = false;
    this.isVideoFileMode = false;
    this.activeVideoPath = null;

    // Stream settings & filters
    this.backgroundPreset = VIDEO_PRESETS.REAL_CAMERA;
    this.lightingMode = LIGHTING_MODES.NORMAL;
    this.skeletonTheme = 'cyan';

    // Metrics
    this.lastFrameTime = performance.now();
    this.fps = 30;
    this.inferenceLatencyMs = 0;

    // Simulation / synthetic mode
    this.isSimulatedMode = false;
    this.simulatedSignId = null;
    this.simulatedTime = 0;
    this.simulatedInterval = null;

    this._initMediaPipe();
  }

  async _initMediaPipe() {
    try {
      if (typeof window.Hands === 'undefined') {
        await this._loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
      }

      this.hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.50,
        minTrackingConfidence: 0.50
      });

      this.hands.onResults((results) => this._onMediaPipeResults(results));
      console.log('MediaPipe Hands initialized successfully.');
    } catch (err) {
      console.warn('MediaPipe CDN note. Invariant kinematic detector active.', err);
    }
  }

  _loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  /**
   * Start Live Webcam Feed
   */
  async startCamera() {
    try {
      this.isSimulatedMode = false;
      this.isVideoFileMode = false;
      if (this.simulatedInterval) clearInterval(this.simulatedInterval);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      this.videoElement.src = '';
      this.videoElement.srcObject = stream;
      this.videoElement.loop = false;
      await this.videoElement.play();

      this.isCameraActive = true;
      this.isRunning = true;
      this._startProcessingLoop();
      return { success: true };
    } catch (err) {
      console.error('Camera access error:', err);
      this.startSimulatedMode('HELLO');
      return { success: false, error: err.message || 'Camera permission denied.' };
    }
  }

  stopCamera() {
    this.isRunning = false;
    this.isCameraActive = false;
    if (this.videoElement.srcObject) {
      this.videoElement.srcObject.getTracks().forEach(t => t.stop());
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Play and run real-time inference on a Dataset Video MP4
   */
  async playDatasetVideo(videoUrl, signId = null) {
    try {
      this.stopCamera();
      if (this.simulatedInterval) clearInterval(this.simulatedInterval);

      this.isSimulatedMode = false;
      this.isVideoFileMode = true;
      this.activeVideoPath = videoUrl;
      if (signId) this.simulatedSignId = signId;

      this.videoElement.srcObject = null;
      this.videoElement.src = videoUrl;
      this.videoElement.loop = true;
      this.videoElement.muted = true;
      this.videoElement.playsInline = true;

      await this.videoElement.play();
      this.isRunning = true;
      this._startProcessingLoop();
      return { success: true };
    } catch (err) {
      console.warn('Dataset video play note:', err);
      // Fallback to synthetic sign animation
      if (signId) this.startSimulatedMode(signId);
      return { success: false, error: err.message };
    }
  }

  /**
   * Load and play a user-uploaded local video file
   */
  async playUploadedVideo(file) {
    if (!file) return { success: false };
    const url = URL.createObjectURL(file);
    return this.playDatasetVideo(url);
  }

  async _startProcessingLoop() {
    if (!this.isRunning) return;

    const startTime = performance.now();

    try {
      if (this.hands && this.videoElement.readyState >= 2 && !this.videoElement.paused) {
        await this.hands.send({ image: this.videoElement });
      }
    } catch (err) {}

    const endTime = performance.now();
    this.inferenceLatencyMs = Math.round(endTime - startTime);

    const delta = (endTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = endTime;
    if (delta > 0) {
      this.fps = Math.round(0.9 * this.fps + 0.1 * (1 / delta));
    }

    if (this.isRunning) {
      requestAnimationFrame(() => this._startProcessingLoop());
    }
  }

  _onMediaPipeResults(results) {
    const { width, height } = this.canvasElement;
    this.ctx.save();
    this.ctx.clearRect(0, 0, width, height);

    // 1. Draw Background / Video Feed
    this._renderVideoFrame(results.image);

    // 2. Draw Hand Landmark Skeleton
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      results.multiHandLandmarks.forEach((landmarks, index) => {
        const handedness = results.multiHandedness ? results.multiHandedness[index] : null;
        this._drawSkeletalMesh(landmarks, handedness, width, height);
      });
    }

    this.ctx.restore();

    if (this.onResultsCallback) {
      this.onResultsCallback({
        multiHandLandmarks: results.multiHandLandmarks || [],
        multiHandedness: results.multiHandedness || [],
        latencyMs: this.inferenceLatencyMs,
        fps: this.fps,
        isSimulated: this.isSimulatedMode,
        isVideoFile: this.isVideoFileMode,
        activeVideoPath: this.activeVideoPath,
        simulatedSignId: this.simulatedSignId
      });
    }
  }

  _renderVideoFrame(imageSource) {
    const { width, height } = this.canvasElement;

    this.ctx.filter = 'none';
    if (this.lightingMode === LIGHTING_MODES.LOW_LIGHT) {
      this.ctx.filter = 'brightness(1.5) contrast(1.3) saturate(1.2)';
    } else if (this.lightingMode === LIGHTING_MODES.HIGH_CONTRAST) {
      this.ctx.filter = 'contrast(2.0) brightness(1.1) grayscale(0.2)';
    } else if (this.lightingMode === LIGHTING_MODES.OVEREXPOSED) {
      this.ctx.filter = 'brightness(2.2) contrast(0.8)';
    } else if (this.lightingMode === LIGHTING_MODES.EDGE_BOOST) {
      this.ctx.filter = 'contrast(1.8) drop-shadow(0px 0px 2px #38bdf8)';
    }

    // Mirror only if front webcam (not pre-recorded dataset videos)
    if (this.isCameraActive) {
      this.ctx.translate(width, 0);
      this.ctx.scale(-1, 1);
    }

    if (imageSource) {
      this.ctx.drawImage(imageSource, 0, 0, width, height);
    } else {
      this._drawSimulatedBackdrop(width, height);
    }

    this._applyBackgroundPresetOverlay(width, height);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.filter = 'none';
  }

  _drawSimulatedBackdrop(width, height) {
    const gradient = this.ctx.createLinearGradient(0, 0, width, height);
    if (this.backgroundPreset === VIDEO_PRESETS.BANK_COUNTER) {
      gradient.addColorStop(0, '#064e3b');
      gradient.addColorStop(1, '#022c22');
    } else if (this.backgroundPreset === VIDEO_PRESETS.HOSPITAL_CORRIDOR) {
      gradient.addColorStop(0, '#7f1d1d');
      gradient.addColorStop(1, '#450a0a');
    } else if (this.backgroundPreset === VIDEO_PRESETS.GOV_OFFICE) {
      gradient.addColorStop(0, '#78350f');
      gradient.addColorStop(1, '#451a03');
    } else {
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
    }
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  }

  _applyBackgroundPresetOverlay(width, height) {
    if (this.backgroundPreset === VIDEO_PRESETS.BLUR_BOKEH) {
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      this.ctx.fillRect(0, 0, width, height);
    } else if (this.backgroundPreset === VIDEO_PRESETS.HIGH_NOISE) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < 400; i++) {
        const nx = Math.random() * width;
        const ny = Math.random() * height;
        this.ctx.fillRect(nx, ny, 2, 2);
      }
    }
  }

  _drawSkeletalMesh(landmarks, handedness, width, height) {
    let primaryColor = '#38bdf8';
    let secondaryColor = '#818cf8';
    let jointColor = '#ffffff';

    if (this.skeletonTheme === 'emerald') {
      primaryColor = '#34d399';
      secondaryColor = '#10b981';
    } else if (this.skeletonTheme === 'yellow') {
      primaryColor = '#facc15';
      secondaryColor = '#f59e0b';
    } else if (this.skeletonTheme === 'ruby') {
      primaryColor = '#f87171';
      secondaryColor = '#ef4444';
    } else if (this.skeletonTheme === 'purple') {
      primaryColor = '#c084fc';
      secondaryColor = '#a855f7';
    }

    const CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [5, 9], [9, 10], [10, 11], [11, 12], // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [0, 17]
    ];

    const screenPoints = landmarks.map(p => ({
      x: (this.isCameraActive ? (1.0 - p.x) : p.x) * width,
      y: p.y * height,
      z: p.z || 0
    }));

    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = primaryColor;
    this.ctx.lineWidth = 3.5;
    this.ctx.strokeStyle = primaryColor;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = screenPoints[startIdx];
      const p2 = screenPoints[endIdx];
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.stroke();
    });

    screenPoints.forEach((p, idx) => {
      const isTip = [4, 8, 12, 16, 20].includes(idx);
      const radius = isTip ? 6 : (idx === 0 ? 7 : 4);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = isTip ? secondaryColor : jointColor;
      this.ctx.shadowBlur = isTip ? 14 : 6;
      this.ctx.shadowColor = isTip ? '#ffffff' : primaryColor;
      this.ctx.fill();
      this.ctx.strokeStyle = primaryColor;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    });
  }

  startSimulatedMode(signId = 'HELLO') {
    this.isSimulatedMode = true;
    this.isVideoFileMode = false;
    this.simulatedSignId = signId;
    this.isCameraActive = false;
    this.isRunning = true;
    this.simulatedTime = 0;

    if (this.simulatedInterval) clearInterval(this.simulatedInterval);

    this.simulatedInterval = setInterval(() => {
      this._generateSimulatedFrame();
    }, 1000 / 30);
  }

  setSimulatedSign(signId) {
    this.simulatedSignId = signId;
    this.simulatedTime = 0;
  }

  _generateSimulatedFrame() {
    this.simulatedTime += 0.05;
    const t = this.simulatedTime;

    const landmarks = this._getSyntheticLandmarksForSign(this.simulatedSignId, t);
    const multiHandLandmarks = [landmarks];
    const multiHandedness = [{ label: 'Right', score: 0.98 }];

    if (['DOCTOR_MEDICAL', 'SIGN_FORM', 'HELP_ASSIST', 'RECEIPT_FEE', 'REPEAT_AGAIN', 'MEDICINE_PHARMACY', 'THANK_YOU', 'GOOD_MORNING'].includes(this.simulatedSignId)) {
      const leftLandmarks = this._getSyntheticLeftHandForSign(this.simulatedSignId, t);
      multiHandLandmarks.push(leftLandmarks);
      multiHandedness.push({ label: 'Left', score: 0.95 });
    }

    const results = {
      image: null,
      multiHandLandmarks,
      multiHandedness
    };

    this._onMediaPipeResults(results);
  }

  _getSyntheticLandmarksForSign(signId, t) {
    const base = new Array(21).fill(0).map(() => ({ x: 0.5, y: 0.7, z: 0 }));

    let waveOffset = 0;
    let nodOffset = 0;
    let shakeOffset = 0;

    if (signId === 'HELLO' || signId === 'GOOD_MORNING' || signId === 'GOOD_AFTERNOON') waveOffset = Math.sin(t * 6) * 0.06;
    if (signId === 'YES') nodOffset = Math.sin(t * 7) * 0.04;
    if (signId === 'NO' || signId === 'EMERGENCY' || signId === 'FEVER' || signId === 'INJURY' || signId === 'ASL_J' || signId === 'ASL_Z') {
      shakeOffset = Math.sin(t * 8) * 0.05;
    }

    base[0] = { x: 0.5 + waveOffset + shakeOffset, y: 0.72 + nodOffset, z: 0 };
    base[1] = { x: base[0].x - 0.06, y: base[0].y - 0.04, z: 0 };
    base[2] = { x: base[0].x - 0.10, y: base[0].y - 0.08, z: 0 };
    base[5] = { x: base[0].x - 0.05, y: base[0].y - 0.18, z: 0 };
    base[9] = { x: base[0].x - 0.01, y: base[0].y - 0.19, z: 0 };
    base[13] = { x: base[0].x + 0.03, y: base[0].y - 0.18, z: 0 };
    base[17] = { x: base[0].x + 0.07, y: base[0].y - 0.16, z: 0 };

    const configureFinger = (mcpIdx, tipIdx, isOpen, spread = 0) => {
      const mcp = base[mcpIdx];
      base[mcpIdx + 1] = { x: mcp.x + spread * 0.3, y: isOpen ? mcp.y - 0.08 : mcp.y + 0.02, z: 0 };
      base[mcpIdx + 2] = { x: base[mcpIdx + 1].x + spread * 0.3, y: isOpen ? base[mcpIdx + 1].y - 0.06 : base[mcpIdx + 1].y + 0.02, z: 0 };
      base[tipIdx] = { x: base[mcpIdx + 2].x + spread * 0.4, y: isOpen ? base[mcpIdx + 2].y - 0.06 : base[mcpIdx + 2].y + 0.02, z: 0 };
    };

    if (signId === 'ASL_A') {
      base[3] = { x: base[2].x, y: base[2].y - 0.06, z: 0 };
      base[4] = { x: base[3].x, y: base[3].y - 0.06, z: 0 };
      configureFinger(5, 8, false); configureFinger(9, 12, false); configureFinger(13, 16, false); configureFinger(17, 20, false);
    } else if (signId === 'ASL_B') {
      base[3] = { x: base[2].x + 0.04, y: base[2].y + 0.01, z: 0 };
      base[4] = { x: base[3].x + 0.04, y: base[3].y + 0.01, z: 0 };
      configureFinger(5, 8, true, 0); configureFinger(9, 12, true, 0); configureFinger(13, 16, true, 0); configureFinger(17, 20, true, 0);
    } else if (signId === 'ASL_L' || signId === 'ID_CARD') {
      base[3] = { x: base[2].x - 0.06, y: base[2].y, z: 0 };
      base[4] = { x: base[3].x - 0.06, y: base[3].y, z: 0 };
      configureFinger(5, 8, true, 0); configureFinger(9, 12, false); configureFinger(13, 16, false); configureFinger(17, 20, false);
    } else if (signId === 'FEVER' || signId === 'INJURY' || signId === 'CRY') {
      base[3] = { x: base[2].x - 0.03, y: base[2].y - 0.04, z: 0 };
      base[4] = { x: base[3].x - 0.03, y: base[3].y - 0.04, z: 0 };
      configureFinger(5, 8, true, -0.02); configureFinger(9, 12, true, 0); configureFinger(13, 16, false); configureFinger(17, 20, false);
    } else {
      base[3] = { x: base[2].x - 0.04, y: base[2].y - 0.04, z: 0 };
      base[4] = { x: base[3].x - 0.03, y: base[3].y - 0.04, z: 0 };
      configureFinger(5, 8, true, -0.02); configureFinger(9, 12, true, 0); configureFinger(13, 16, true, 0.02); configureFinger(17, 20, true, 0.04);
    }

    return base;
  }

  _getSyntheticLeftHandForSign(signId, t) {
    const left = new Array(21).fill(0).map(() => ({ x: 0.35, y: 0.72, z: 0 }));
    left[0] = { x: 0.35, y: 0.72, z: 0 };
    left[5] = { x: 0.33, y: 0.58, z: 0 };
    left[8] = { x: 0.33, y: 0.48, z: 0 };
    left[9] = { x: 0.35, y: 0.57, z: 0 };
    left[12] = { x: 0.35, y: 0.47, z: 0 };
    left[17] = { x: 0.39, y: 0.60, z: 0 };
    left[20] = { x: 0.39, y: 0.50, z: 0 };
    return left;
  }

  setBackgroundPreset(preset) {
    this.backgroundPreset = preset;
  }

  setLightingMode(mode) {
    this.lightingMode = mode;
  }

  setSkeletonTheme(theme) {
    this.skeletonTheme = theme;
  }
}
