/**
 * Feature Extractor for Invariant Sign Language Analysis
 * Robust to hand scale, 3D rotation/orientation, background variance, and lighting.
 */

import {
  LANDMARK,
  distance,
  distance2D,
  angleBetweenPoints,
  normalizeLandmarks,
  alignHandOrientation
} from './mathUtils.js';

export class FeatureExtractor {
  constructor() {
    this.motionHistory = {
      leftHand: [],
      rightHand: []
    };
    this.maxHistoryLength = 30; // ~0.5 - 1.0s at 30-60 FPS
  }

  /**
   * Reset motion history on stream break
   */
  resetHistory() {
    this.motionHistory.leftHand = [];
    this.motionHistory.rightHand = [];
  }

  /**
   * Extract complete geometric and kinematic features for detected hand(s)
   */
  extractFeatures(multiHandLandmarks = [], handedness = []) {
    if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
      return {
        handsCount: 0,
        hands: [],
        twoHandRelation: null,
        globalMotion: null
      };
    }

    const processedHands = multiHandLandmarks.map((rawLandmarks, index) => {
      const label = handedness[index]?.label || (index === 0 ? 'Right' : 'Left');
      return this._extractSingleHand(rawLandmarks, label);
    });

    // Update temporal motion tracking
    this._updateMotionHistory(processedHands);

    // Compute two-hand spatial relation if 2 hands are present
    const twoHandRelation = processedHands.length >= 2
      ? this._extractTwoHandRelation(processedHands[0], processedHands[1])
      : null;

    return {
      handsCount: processedHands.length,
      hands: processedHands,
      twoHandRelation,
      timestamp: performance.now()
    };
  }

  /**
   * Process individual hand landmarks
   */
  _extractSingleHand(rawLandmarks, handLabel) {
    const normalized = normalizeLandmarks(rawLandmarks);
    const aligned = alignHandOrientation(normalized);
    const fingerStates = this._classifyFingers(rawLandmarks, normalized);
    const angles = this._computeJointAngles(rawLandmarks);
    const distances = this._computeKeyDistances(normalized);
    const orientation = this._computeHandOrientation(rawLandmarks);
    const featureVector = this._buildFeatureVector(aligned, angles, distances);

    return {
      label: handLabel,
      raw: rawLandmarks,
      normalized,
      aligned,
      fingerStates,
      angles,
      distances,
      orientation,
      featureVector,
      wristPosition: { x: rawLandmarks[0].x, y: rawLandmarks[0].y, z: rawLandmarks[0].z || 0 },
      palmCenter: {
        x: (rawLandmarks[0].x + rawLandmarks[5].x + rawLandmarks[17].x) / 3,
        y: (rawLandmarks[0].y + rawLandmarks[5].y + rawLandmarks[17].y) / 3
      }
    };
  }

  /**
   * Classify each finger into OPEN, HALF, or FOLDED state
   */
  _classifyFingers(raw, norm) {
    const wrist = raw[0];

    // Helper to evaluate finger flexion
    const evaluateFinger = (mcpIdx, pipIdx, dipIdx, tipIdx) => {
      const pipAngle = angleBetweenPoints(raw[mcpIdx], raw[pipIdx], raw[dipIdx]);
      const dipAngle = angleBetweenPoints(raw[pipIdx], raw[dipIdx], raw[tipIdx]);
      const tipDistToWrist = distance(raw[tipIdx], wrist);
      const pipDistToWrist = distance(raw[pipIdx], wrist);
      const mcpDistToWrist = distance(raw[mcpIdx], wrist);

      const isStraight = pipAngle > 145 && dipAngle > 140;
      const isExtended = tipDistToWrist > pipDistToWrist * 1.08;

      if (isStraight && isExtended) return 'OPEN';
      if (tipDistToWrist < mcpDistToWrist * 1.15 || pipAngle < 100) return 'FOLDED';
      return 'HALF';
    };

    // Thumb evaluation (Thumb is unique due to lateral rotation)
    const thumbIpAngle = angleBetweenPoints(raw[LANDMARK.THUMB_MCP], raw[LANDMARK.THUMB_IP], raw[LANDMARK.THUMB_TIP]);
    const thumbTipDistToPinkyMcp = distance(raw[LANDMARK.THUMB_TIP], raw[LANDMARK.PINKY_MCP]);
    const thumbMcpDistToPinkyMcp = distance(raw[LANDMARK.THUMB_MCP], raw[LANDMARK.PINKY_MCP]);

    let thumbState = 'FOLDED';
    if (thumbIpAngle > 140 && thumbTipDistToPinkyMcp > thumbMcpDistToPinkyMcp * 1.15) {
      thumbState = 'OPEN';
    } else if (thumbTipDistToPinkyMcp > thumbMcpDistToPinkyMcp * 0.85) {
      thumbState = 'HALF';
    }

    return {
      thumb: thumbState,
      index: evaluateFinger(LANDMARK.INDEX_MCP, LANDMARK.INDEX_PIP, LANDMARK.INDEX_DIP, LANDMARK.INDEX_TIP),
      middle: evaluateFinger(LANDMARK.MIDDLE_MCP, LANDMARK.MIDDLE_PIP, LANDMARK.MIDDLE_DIP, LANDMARK.MIDDLE_TIP),
      ring: evaluateFinger(LANDMARK.RING_MCP, LANDMARK.RING_PIP, LANDMARK.RING_DIP, LANDMARK.RING_TIP),
      pinky: evaluateFinger(LANDMARK.PINKY_MCP, LANDMARK.PINKY_PIP, LANDMARK.PINKY_DIP, LANDMARK.PINKY_TIP)
    };
  }

  /**
   * Compute joint angles for fine gesture discrimination
   */
  _computeJointAngles(raw) {
    return {
      indexPip: angleBetweenPoints(raw[LANDMARK.INDEX_MCP], raw[LANDMARK.INDEX_PIP], raw[LANDMARK.INDEX_DIP]),
      middlePip: angleBetweenPoints(raw[LANDMARK.MIDDLE_MCP], raw[LANDMARK.MIDDLE_PIP], raw[LANDMARK.MIDDLE_DIP]),
      ringPip: angleBetweenPoints(raw[LANDMARK.RING_MCP], raw[LANDMARK.RING_PIP], raw[LANDMARK.RING_DIP]),
      pinkyPip: angleBetweenPoints(raw[LANDMARK.PINKY_MCP], raw[LANDMARK.PINKY_PIP], raw[LANDMARK.PINKY_DIP]),
      thumbIndexSpread: angleBetweenPoints(raw[LANDMARK.INDEX_MCP], raw[LANDMARK.WRIST], raw[LANDMARK.THUMB_TIP]),
      indexMiddleSpread: angleBetweenPoints(raw[LANDMARK.INDEX_TIP], raw[LANDMARK.INDEX_MCP], raw[LANDMARK.MIDDLE_TIP])
    };
  }

  /**
   * Compute normalized key pairwise distances
   */
  _computeKeyDistances(norm) {
    return {
      thumbTipToIndexTip: distance(norm[LANDMARK.THUMB_TIP], norm[LANDMARK.INDEX_TIP]),
      thumbTipToMiddleTip: distance(norm[LANDMARK.THUMB_TIP], norm[LANDMARK.MIDDLE_TIP]),
      thumbTipToRingTip: distance(norm[LANDMARK.THUMB_TIP], norm[LANDMARK.RING_TIP]),
      thumbTipToPinkyTip: distance(norm[LANDMARK.THUMB_TIP], norm[LANDMARK.PINKY_TIP]),
      indexTipToMiddleTip: distance(norm[LANDMARK.INDEX_TIP], norm[LANDMARK.MIDDLE_TIP]),
      middleTipToRingTip: distance(norm[LANDMARK.MIDDLE_TIP], norm[LANDMARK.RING_TIP]),
      ringTipToPinkyTip: distance(norm[LANDMARK.RING_TIP], norm[LANDMARK.PINKY_TIP]),
      indexTipToWrist: distance(norm[LANDMARK.INDEX_TIP], norm[LANDMARK.WRIST]),
      thumbTipToWrist: distance(norm[LANDMARK.THUMB_TIP], norm[LANDMARK.WRIST])
    };
  }

  /**
   * Estimate Hand Orientation (Pitch, Roll, Direction)
   */
  _computeHandOrientation(raw) {
    const wrist = raw[0];
    const middleMcp = raw[LANDMARK.MIDDLE_MCP];
    const indexMcp = raw[LANDMARK.INDEX_MCP];
    const pinkyMcp = raw[LANDMARK.PINKY_MCP];

    // Roll angle in degrees (-180 to 180)
    const roll = Math.atan2(middleMcp.x - wrist.x, -(middleMcp.y - wrist.y)) * (180 / Math.PI);

    // Palm normal vector estimate (cross product of wrist->middleMcp and wrist->indexMcp)
    const v1 = { x: middleMcp.x - wrist.x, y: middleMcp.y - wrist.y, z: (middleMcp.z || 0) - (wrist.z || 0) };
    const v2 = { x: pinkyMcp.x - indexMcp.x, y: pinkyMcp.y - indexMcp.y, z: (pinkyMcp.z || 0) - (indexMcp.z || 0) };
    const normalZ = v1.x * v2.y - v1.y * v2.x;

    return {
      roll,
      facingForward: normalZ < 0,
      pointingUp: middleMcp.y < wrist.y,
      pointingDown: middleMcp.y > wrist.y,
      pointingSide: Math.abs(middleMcp.x - wrist.x) > Math.abs(middleMcp.y - wrist.y)
    };
  }

  /**
   * Combine normalized aligned 3D points + angles into flat feature vector for KNN / Cosine Matching
   */
  _buildFeatureVector(alignedPoints, angles, distances) {
    const vector = [];

    // Add aligned 3D coordinates (21 * 3 = 63 features)
    for (let i = 0; i < alignedPoints.length; i++) {
      vector.push(alignedPoints[i].x);
      vector.push(alignedPoints[i].y);
      vector.push(alignedPoints[i].z || 0);
    }

    // Add normalized distance ratios
    Object.values(distances).forEach(dist => vector.push(dist));

    // Add scaled joint angles (0.0 to 1.0)
    Object.values(angles).forEach(ang => vector.push(ang / 180));

    return vector;
  }

  /**
   * Track temporal hand motion across frames (for wave, nod, rapid shake)
   */
  _updateMotionHistory(processedHands) {
    const now = performance.now();

    processedHands.forEach(hand => {
      const key = hand.label === 'Left' ? 'leftHand' : 'rightHand';
      const history = this.motionHistory[key];

      history.push({
        time: now,
        palmCenter: hand.palmCenter,
        wrist: hand.wristPosition,
        fingerStates: hand.fingerStates
      });

      if (history.length > this.maxHistoryLength) {
        history.shift();
      }
    });
  }

  /**
   * Analyze kinematic motion from history (velocity, direction, oscillations)
   */
  analyzeMotion(handLabel = 'Right') {
    const key = handLabel === 'Left' ? 'leftHand' : 'rightHand';
    const history = this.motionHistory[key];

    if (!history || history.length < 5) {
      return {
        velocity: { x: 0, y: 0, speed: 0 },
        isWaving: false,
        isNodding: false,
        isShaking: false,
        isStationary: true,
        motionTrajectory: []
      };
    }

    const first = history[0];
    const last = history[history.length - 1];
    const dt = Math.max(1, (last.time - first.time) / 1000);

    const totalDx = last.palmCenter.x - first.palmCenter.x;
    const totalDy = last.palmCenter.y - first.palmCenter.y;
    const speed = Math.sqrt(totalDx * totalDx + totalDy * totalDy) / dt;

    // Count directional reversals (for wave and shake detection)
    let xReversals = 0;
    let yReversals = 0;
    let prevDx = 0;
    let prevDy = 0;

    for (let i = 1; i < history.length; i++) {
      const cdx = history[i].palmCenter.x - history[i - 1].palmCenter.x;
      const cdy = history[i].palmCenter.y - history[i - 1].palmCenter.y;

      if (Math.abs(cdx) > 0.004 && prevDx !== 0 && (cdx * prevDx < 0)) xReversals++;
      if (Math.abs(cdy) > 0.004 && prevDy !== 0 && (cdy * prevDy < 0)) yReversals++;

      if (Math.abs(cdx) > 0.003) prevDx = cdx;
      if (Math.abs(cdy) > 0.003) prevDy = cdy;
    }

    const isWaving = xReversals >= 2 && speed > 0.08;
    const isShaking = xReversals >= 3;
    const isNodding = yReversals >= 2;
    const isStationary = speed < 0.04 && xReversals < 2 && yReversals < 2;

    // Horizontal swipe gesture kinematics (Space: Rightward swipe, Backspace: Leftward swipe)
    const isSwipingRight = totalDx > 0.035 && Math.abs(totalDx) > Math.abs(totalDy) * 1.2 && xReversals <= 1 && speed > 0.05;
    const isSwipingLeft = totalDx < -0.035 && Math.abs(totalDx) > Math.abs(totalDy) * 1.2 && xReversals <= 1 && speed > 0.05;

    return {
      velocity: { x: totalDx / dt, y: totalDy / dt, speed },
      isWaving,
      isNodding,
      isShaking,
      isStationary,
      isSwipingRight,
      isSwipingLeft,
      xReversals,
      yReversals,
      motionTrajectory: history.map(h => ({ x: h.palmCenter.x, y: h.palmCenter.y }))
    };
  }

  /**
   * Spatial relationship between two hands
   */
  _extractTwoHandRelation(handA, handB) {
    const wristDist = distance(handA.wristPosition, handB.wristPosition);
    const indexTipDist = distance(handA.raw[LANDMARK.INDEX_TIP], handB.raw[LANDMARK.INDEX_TIP]);
    const palmDist = distance(handA.palmCenter, handB.palmCenter);

    const areHandsTouching = palmDist < 0.18 || indexTipDist < 0.12;
    const areHandsStacked = Math.abs(handA.palmCenter.x - handB.palmCenter.x) < 0.12 &&
      Math.abs(handA.palmCenter.y - handB.palmCenter.y) > 0.08;

    return {
      wristDistance: wristDist,
      palmDistance: palmDist,
      indexTipDistance: indexTipDist,
      areHandsTouching,
      areHandsStacked,
      dominantOnTop: handA.palmCenter.y < handB.palmCenter.y
    };
  }
}
