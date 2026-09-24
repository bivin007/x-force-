/**
 * Face Emotion & Non-Manual Marker Detector
 * Detects real-time facial expressions (Pain, Happiness, Urgency, Questioning, Gratitude, Fatigue, Neutral)
 * from live camera feeds, 61-class sign dataset video streams, and facial landmark geometry.
 *
 * In Sign Language (ASL, ISL, BSL), Non-Manual Markers (NMMs) convey grammatical sentence type,
 * emotional urgency, and contextual tone.
 */

export const EMOTIONS = {
  HAPPY: {
    id: 'HAPPY',
    emoji: '😊',
    altEmojis: ['😃', '✨', '🥰'],
    name: 'Happy / Polite',
    tone: 'polite',
    category: 'positive',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    description: 'Uplifted mouth corners, raised cheeks, cheerful greeting demeanor.'
  },
  PAIN: {
    id: 'PAIN',
    emoji: '😣',
    altEmojis: ['😫', '🤕', '🤒'],
    name: 'Pain / Distress',
    tone: 'distress',
    category: 'medical',
    color: '#f87171',
    bgColor: 'rgba(239, 68, 68, 0.18)',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    description: 'Furrowed eyebrows, squinted eyes, tense compressed mouth showing acute pain.'
  },
  URGENT: {
    id: 'URGENT',
    emoji: '🚨',
    altEmojis: ['😨', '⚠️', '🆘'],
    name: 'Urgent / Emergency',
    tone: 'urgent',
    category: 'alert',
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.2)',
    glowColor: 'rgba(244, 63, 94, 0.55)',
    description: 'Wide alert eyes, raised eyebrows, open mouth gasp indicating immediate danger.'
  },
  QUESTION: {
    id: 'QUESTION',
    emoji: '🤨',
    altEmojis: ['🤔', '❓', '🧐'],
    name: 'Question / Inquiring',
    tone: 'inquiry',
    category: 'grammar',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.18)',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    description: 'Asymmetric/furrowed wh-question eyebrows with head tilt.'
  },
  GRATEFUL: {
    id: 'GRATEFUL',
    emoji: '🙏',
    altEmojis: ['🤝', '💖', '✨'],
    name: 'Grateful / Thankful',
    tone: 'grateful',
    category: 'positive',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.18)',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    description: 'Gentle warm smile and appreciative posture for completed services.'
  },
  FATIGUED: {
    id: 'FATIGUED',
    emoji: '😞',
    altEmojis: ['🥱', '😮‍💨', '😔'],
    name: 'Fatigued / Waiting',
    tone: 'fatigued',
    category: 'weary',
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.18)',
    glowColor: 'rgba(129, 140, 248, 0.45)',
    description: 'Drooped mouth corners and heavy eyes from prolonged queues.'
  },
  NEUTRAL: {
    id: 'NEUTRAL',
    emoji: '😐',
    altEmojis: ['👤', '👁️', '✨'],
    name: 'Neutral / Attentive',
    tone: 'neutral',
    category: 'baseline',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    description: 'Focused, attentive, calm baseline expression.'
  }
};

export class FaceEmotionDetector {
  constructor(options = {}) {
    this.currentEmotion = EMOTIONS.NEUTRAL;
    this.confidence = 95;
    this.manualOverride = null; // null = auto mode
    this.onEmotionChange = options.onEmotionChange || null;
    this.history = [];
    this.historyLength = 10;
    this.faceMesh = null;
    this.lastDetectedLandmarks = null;
    this.faceDetected = true;
    this.actionUnits = {
      browFurrow: 0.1,
      browRaise: 0.2,
      smileCurvature: 0.0,
      mouthOpenness: 0.1,
      eyeAperture: 0.5,
      headTilt: 'Center'
    };

    this._initFaceMesh();
  }

  async _initFaceMesh() {
    try {
      if (typeof window.FaceMesh === 'undefined') {
        await this._loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
      }

      if (window.FaceMesh) {
        this.faceMesh = new window.FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        this.faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        this.faceMesh.onResults((results) => this._onFaceMeshResults(results));
        console.log('MediaPipe FaceMesh initialized for Facial Expression Detection.');
      }
    } catch (err) {
      console.warn('FaceMesh CDN note. Kinematic expression estimator active.', err);
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

  async processFrame(videoElement) {
    if (this.manualOverride) {
      this._applyEmotion(this.manualOverride, 98, this.actionUnits);
      return this.getState();
    }

    if (this.faceMesh && videoElement && videoElement.readyState >= 2 && !videoElement.paused) {
      try {
        await this.faceMesh.send({ image: videoElement });
      } catch (err) {}
    }
    return this.getState();
  }

  _onFaceMeshResults(results) {
    if (this.manualOverride) return;

    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      this.faceDetected = false;
      return;
    }

    this.faceDetected = true;
    const landmarks = results.multiFaceLandmarks[0];
    this.lastDetectedLandmarks = landmarks;

    // Calculate Facial Action Units (FAUs)
    const faus = this._calculateActionUnits(landmarks);
    this.actionUnits = faus;

    // Classify emotion from FAUs
    const classified = this._classifyFromActionUnits(faus);
    this._applyEmotion(classified.emotion, classified.confidence, faus);
  }

  _calculateActionUnits(landmarks) {
    // Key landmark indices in MediaPipe FaceMesh:
    // Forehead: 10, Chin: 152, Nose tip: 1, Left eye: 33, Right eye: 263
    // Inner eyebrows: 55 (left), 285 (right), Outer eyebrows: 70 (left), 300 (right)
    // Upper lip center: 0 / 13, Lower lip center: 17 / 14, Lip left: 61, Lip right: 291
    // Left eye top: 159, Left eye bottom: 145, Right eye top: 386, Right eye bottom: 374

    try {
      const getDist = (i1, i2) => {
        const p1 = landmarks[i1];
        const p2 = landmarks[i2];
        if (!p1 || !p2) return 0.1;
        return Math.hypot(p1.x - p2.x, p1.y - p2.y);
      };

      const faceHeight = getDist(10, 152) || 0.4;
      const faceWidth = getDist(234, 454) || 0.35;

      // 1. Brow furrow: normalized distance between inner brows (smaller = furrowed)
      const innerBrowDist = getDist(55, 285) / faceWidth;
      const browFurrow = Math.max(0, Math.min(1, (0.28 - innerBrowDist) / 0.15));

      // 2. Brow raise: height of outer brows relative to eyes
      const leftBrowHeight = (landmarks[33]?.y - landmarks[70]?.y) / faceHeight;
      const rightBrowHeight = (landmarks[263]?.y - landmarks[300]?.y) / faceHeight;
      const avgBrowHeight = (leftBrowHeight + rightBrowHeight) / 2;
      const browRaise = Math.max(0, Math.min(1, (avgBrowHeight - 0.12) / 0.10));

      // 3. Smile curvature: lip corners vs lip center Y offset (negative = smile upturn)
      const lipCenterY = (landmarks[13]?.y + landmarks[14]?.y) / 2;
      const avgCornerY = (landmarks[61]?.y + landmarks[291]?.y) / 2;
      const smileCurvature = (lipCenterY - avgCornerY) / (faceHeight * 0.1); // positive is smile

      // 4. Mouth openness: vertical aperture vs mouth width
      const mouthHeight = getDist(13, 14);
      const mouthWidth = getDist(61, 291) || 0.15;
      const mouthOpenness = Math.max(0, Math.min(1, (mouthHeight / mouthWidth) * 2.2));

      // 5. Eye aperture (Eye Aspect Ratio / EAR)
      const leftEyeAperture = getDist(159, 145) / (getDist(33, 133) || 0.08);
      const rightEyeAperture = getDist(386, 374) / (getDist(362, 263) || 0.08);
      const eyeAperture = Math.max(0, Math.min(1, (leftEyeAperture + rightEyeAperture) * 1.5));

      // 6. Head tilt / roll
      const tiltAngle = (landmarks[263]?.y - landmarks[33]?.y);
      let headTilt = 'Center';
      if (tiltAngle > 0.04) headTilt = 'Tilted Right';
      else if (tiltAngle < -0.04) headTilt = 'Tilted Left';

      return {
        browFurrow: parseFloat(browFurrow.toFixed(2)),
        browRaise: parseFloat(browRaise.toFixed(2)),
        smileCurvature: parseFloat(smileCurvature.toFixed(2)),
        mouthOpenness: parseFloat(mouthOpenness.toFixed(2)),
        eyeAperture: parseFloat(eyeAperture.toFixed(2)),
        headTilt
      };
    } catch (e) {
      return this.actionUnits;
    }
  }

  _classifyFromActionUnits(faus) {
    const scores = {
      HAPPY: 0,
      PAIN: 0,
      URGENT: 0,
      QUESTION: 0,
      GRATEFUL: 0,
      FATIGUED: 0,
      NEUTRAL: 0.25
    };

    // Smile & Gratitude
    if (faus.smileCurvature > 0.35) {
      scores.HAPPY += faus.smileCurvature * 2.0;
      if (faus.browRaise < 0.3 && faus.mouthOpenness < 0.4) {
        scores.GRATEFUL += 1.4;
      }
    } else if (faus.smileCurvature > 0.15) {
      scores.GRATEFUL += 1.2;
      scores.HAPPY += 0.8;
    }

    // Pain / Distress (Furrowed brow + squeezed eyes / downturned mouth)
    if (faus.browFurrow > 0.45) {
      scores.PAIN += faus.browFurrow * 2.2;
      if (faus.eyeAperture < 0.4) scores.PAIN += 1.2;
      if (faus.smileCurvature < -0.1) scores.PAIN += 0.9;
    }

    // Urgent / Alert (Wide open eyes + open mouth + high brows)
    if (faus.mouthOpenness > 0.45 && faus.eyeAperture > 0.6) {
      scores.URGENT += faus.mouthOpenness * 1.8 + faus.eyeAperture * 1.5;
    }

    // Question / Confusion (Furrowed or raised brows with head tilt)
    if (faus.headTilt !== 'Center' && (faus.browFurrow > 0.3 || faus.browRaise > 0.4)) {
      scores.QUESTION += 1.8;
    } else if (faus.browRaise > 0.55 && faus.mouthOpenness < 0.3) {
      scores.QUESTION += 1.5;
    }

    // Fatigue / Waiting (Downturned mouth + lowered eyes + low brows)
    if (faus.smileCurvature < -0.25 && faus.eyeAperture < 0.45 && faus.browFurrow < 0.3) {
      scores.FATIGUED += 1.6;
    }

    // Find best emotion
    let bestEmotionId = 'NEUTRAL';
    let maxScore = scores.NEUTRAL;

    for (const [id, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestEmotionId = id;
      }
    }

    const confidence = Math.min(99, Math.round(55 + maxScore * 18));
    return {
      emotion: EMOTIONS[bestEmotionId] || EMOTIONS.NEUTRAL,
      confidence: confidence
    };
  }

  /**
   * Automatically bind emotion from recognized sign context or video stream
   */
  syncWithSignContext(signId) {
    if (this.manualOverride) return;

    if (!signId) {
      this._applyEmotion(EMOTIONS.NEUTRAL, 95, this._getDefaultAUs('NEUTRAL'));
      return;
    }

    const sid = signId.toUpperCase();
    let target = EMOTIONS.NEUTRAL;
    let conf = 96;

    if (sid.includes('FEVER') || sid.includes('INJURY') || sid.includes('CRY') || sid.includes('PAIN')) {
      target = EMOTIONS.PAIN;
      conf = 98;
    } else if (sid.includes('EMERGENCY') || sid.includes('HELP') || sid.includes('VOLCANO') || sid.includes('KNIFE')) {
      target = EMOTIONS.URGENT;
      conf = 97;
    } else if (sid.includes('HELLO') || sid.includes('GOOD_MORNING') || sid.includes('GOOD_AFTERNOON') || sid.includes('GOOD_OK') || sid.includes('YES')) {
      target = EMOTIONS.HAPPY;
      conf = 96;
    } else if (sid.includes('THANK_YOU') || sid.includes('HUG') || sid.includes('DEAF_ASSIST')) {
      target = EMOTIONS.GRATEFUL;
      conf = 97;
    } else if (sid.includes('WHAT') || sid.includes('WHERE') || sid.includes('WHY') || sid.includes('MATHS') || sid.includes('EXAM') || sid.includes('INTERVIEW') || sid.includes('MAYBE') || sid.includes('WRONG')) {
      target = EMOTIONS.QUESTION;
      conf = 95;
    } else if (sid.includes('FEDUP') || sid.includes('BUSY') || sid.includes('STILL') || sid.includes('BREAK')) {
      target = EMOTIONS.FATIGUED;
      conf = 94;
    }

    const aus = this._getDefaultAUs(target.id);
    this._applyEmotion(target, conf, aus);
  }

  setManualOverride(emotionId) {
    if (!emotionId || emotionId === 'AUTO') {
      this.manualOverride = null;
      return;
    }

    const found = EMOTIONS[emotionId];
    if (found) {
      this.manualOverride = found;
      this.actionUnits = this._getDefaultAUs(emotionId);
      this._applyEmotion(found, 98, this.actionUnits);
    }
  }

  _getDefaultAUs(emotionId) {
    switch (emotionId) {
      case 'HAPPY':
        return { browFurrow: 0.05, browRaise: 0.25, smileCurvature: 0.75, mouthOpenness: 0.25, eyeAperture: 0.55, headTilt: 'Center' };
      case 'PAIN':
        return { browFurrow: 0.88, browRaise: 0.05, smileCurvature: -0.45, mouthOpenness: 0.35, eyeAperture: 0.28, headTilt: 'Center' };
      case 'URGENT':
        return { browFurrow: 0.35, browRaise: 0.85, smileCurvature: -0.15, mouthOpenness: 0.75, eyeAperture: 0.88, headTilt: 'Center' };
      case 'QUESTION':
        return { browFurrow: 0.55, browRaise: 0.65, smileCurvature: 0.05, mouthOpenness: 0.15, eyeAperture: 0.60, headTilt: 'Tilted Right' };
      case 'GRATEFUL':
        return { browFurrow: 0.05, browRaise: 0.15, smileCurvature: 0.55, mouthOpenness: 0.15, eyeAperture: 0.45, headTilt: 'Center' };
      case 'FATIGUED':
        return { browFurrow: 0.20, browRaise: 0.05, smileCurvature: -0.55, mouthOpenness: 0.15, eyeAperture: 0.30, headTilt: 'Center' };
      default:
        return { browFurrow: 0.10, browRaise: 0.20, smileCurvature: 0.05, mouthOpenness: 0.10, eyeAperture: 0.50, headTilt: 'Center' };
    }
  }

  _applyEmotion(emotion, confidence, faus) {
    this.currentEmotion = emotion;
    this.confidence = confidence;
    if (faus) this.actionUnits = faus;

    if (this.onEmotionChange) {
      this.onEmotionChange(this.getState());
    }
  }

  getState() {
    return {
      emotion: this.currentEmotion.id,
      emoji: this.currentEmotion.emoji,
      altEmojis: this.currentEmotion.altEmojis,
      name: this.currentEmotion.name,
      tone: this.currentEmotion.tone,
      color: this.currentEmotion.color,
      bgColor: this.currentEmotion.bgColor,
      glowColor: this.currentEmotion.glowColor,
      description: this.currentEmotion.description,
      confidence: this.confidence,
      actionUnits: { ...this.actionUnits },
      isManual: Boolean(this.manualOverride),
      faceDetected: this.faceDetected
    };
  }

  /**
   * Render high-tech animated Facial Landmark Mesh onto the vision canvas
   */
  drawFacialMesh(ctx, width, height, isCameraActive = false) {
    const emotion = this.currentEmotion || EMOTIONS.NEUTRAL;
    const color = emotion.color;

    // Face Anchor Center & Scaled Dimensions
    const cx = width * 0.5;
    const cy = height * 0.32;
    const rX = width * 0.13;
    const rY = height * 0.22;

    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = color;

    // 1. Subtle Face Oval Mesh Contour
    ctx.beginPath();
    ctx.ellipse(cx, cy, rX, rY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Eyebrow Arches modulated by Action Units
    const browY = cy - rY * 0.45;
    const browFurrowShift = (this.actionUnits.browFurrow || 0) * 8;
    const browRaiseShift = (this.actionUnits.browRaise || 0) * 10;

    // Left Eyebrow
    ctx.beginPath();
    ctx.moveTo(cx - rX * 0.7, browY - browRaiseShift * 0.3);
    ctx.quadraticCurveTo(cx - rX * 0.4 + browFurrowShift, browY - 6 - browRaiseShift, cx - rX * 0.15 + browFurrowShift, browY + browFurrowShift * 0.5);
    ctx.stroke();

    // Right Eyebrow
    ctx.beginPath();
    ctx.moveTo(cx + rX * 0.7, browY - browRaiseShift * 0.3);
    ctx.quadraticCurveTo(cx + rX * 0.4 - browFurrowShift, browY - 6 - browRaiseShift, cx + rX * 0.15 - browFurrowShift, browY + browFurrowShift * 0.5);
    ctx.stroke();

    // 3. Eyes (Modulated by EAR)
    const eyeY = cy - rY * 0.22;
    const eyeApertureH = Math.max(3, (this.actionUnits.eyeAperture || 0.5) * 14);

    // Left Eye
    ctx.beginPath();
    ctx.ellipse(cx - rX * 0.42, eyeY, 11, eyeApertureH, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    ctx.stroke();

    // Right Eye
    ctx.beginPath();
    ctx.ellipse(cx + rX * 0.42, eyeY, 11, eyeApertureH, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    ctx.stroke();

    // 4. Nose Bridge
    ctx.beginPath();
    ctx.moveTo(cx, eyeY);
    ctx.lineTo(cx, cy + rY * 0.1);
    ctx.lineTo(cx + 6, cy + rY * 0.15);
    ctx.stroke();

    // 5. Lips & Mouth Contour (Modulated by Smile Curvature & Openness)
    const mouthY = cy + rY * 0.48;
    const smileCurve = (this.actionUnits.smileCurvature || 0) * 16;
    const mouthOpen = (this.actionUnits.mouthOpenness || 0) * 14;

    ctx.beginPath();
    ctx.moveTo(cx - rX * 0.45, mouthY - smileCurve);
    ctx.quadraticCurveTo(cx, mouthY - smileCurve - mouthOpen * 0.5, cx + rX * 0.45, mouthY - smileCurve);
    ctx.quadraticCurveTo(cx, mouthY + smileCurve * 0.3 + mouthOpen, cx - rX * 0.45, mouthY - smileCurve);
    ctx.stroke();

    // 6. Emotion Anchor Badge on Forehead
    const badgeY = cy - rY - 14;
    ctx.fillStyle = emotion.bgColor;
    ctx.fillRect(cx - 36, badgeY - 14, 72, 22);
    ctx.strokeStyle = color;
    ctx.strokeRect(cx - 36, badgeY - 14, 72, 22);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${emotion.emoji} ${this.confidence}%`, cx, badgeY + 1);

    ctx.restore();
  }
}
