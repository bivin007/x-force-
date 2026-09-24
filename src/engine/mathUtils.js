/**
 * Mathematical utilities for scale-invariant, orientation-invariant
 * hand landmark geometry and spatial kinematics.
 */

// Landmark Indices according to MediaPipe Hands model (21 points)
export const LANDMARK = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20
};

/**
 * Computes Euclidean distance between two 2D or 3D points.
 */
export function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 2D Euclidean distance (in screen space)
 */
export function distance2D(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates vector angle in radians/degrees between three joint points: A -> B -> C
 * Joint B is the vertex.
 */
export function angleBetweenPoints(pA, pB, pC) {
  const v1 = { x: pA.x - pB.x, y: pA.y - pB.y, z: (pA.z || 0) - (pB.z || 0) };
  const v2 = { x: pC.x - pB.x, y: pC.y - pB.y, z: (pC.z || 0) - (pB.z || 0) };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (mag1 === 0 || mag2 === 0) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.acos(cosTheta) * (180 / Math.PI); // Returns degrees 0 - 180
}

/**
 * Normalize landmarks:
 * 1. Translation invariance: center at Wrist (index 0 = 0,0,0)
 * 2. Scale invariance: normalize by palm size (distance between wrist and middle finger MCP 9)
 */
export function normalizeLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 21) return [];

  const wrist = landmarks[0];
  const middleMcp = landmarks[LANDMARK.MIDDLE_MCP];
  const palmScale = distance(wrist, middleMcp) || 1.0;

  return landmarks.map(lm => ({
    x: (lm.x - wrist.x) / palmScale,
    y: (lm.y - wrist.y) / palmScale,
    z: ((lm.z || 0) - (wrist.z || 0)) / palmScale
  }));
}

/**
 * Orientation-invariant alignment:
 * Calculates hand rotation angles (roll, pitch, yaw) and rotates
 * the normalized landmarks so the palm always faces canonical front orientation.
 */
export function alignHandOrientation(normalizedLandmarks, handLabel = 'Right') {
  if (!normalizedLandmarks || normalizedLandmarks.length < 21) return normalizedLandmarks;

  const middleMcp = normalizedLandmarks[LANDMARK.MIDDLE_MCP];

  // Primary axis: Wrist to Middle MCP (Y direction in canonical frame)
  const angleY = Math.atan2(middleMcp.x, -middleMcp.y); // Rotation around Z axis (Roll)
  const cosZ = Math.cos(-angleY);
  const sinZ = Math.sin(-angleY);

  // Apply 2D roll compensation
  const aligned = normalizedLandmarks.map(lm => ({
    x: lm.x * cosZ - lm.y * sinZ,
    y: lm.x * sinZ + lm.y * cosZ,
    z: lm.z || 0
  }));

  // Canonicalize handedness so Thumb is always on the -X side and Pinky on the +X side
  const isLeft = handLabel === 'Left' || (aligned[LANDMARK.INDEX_MCP].x > aligned[LANDMARK.PINKY_MCP].x);
  if (isLeft) {
    aligned.forEach(lm => {
      lm.x = -lm.x;
    });
  }

  return aligned;
}

/**
 * Computes Cosine Similarity between two feature vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Exponential Moving Average for real-time temporal smoothing
 */
export class TemporalSmoother {
  constructor(alpha = 0.35) {
    this.alpha = alpha;
    this.prev = null;
  }

  smooth(currentValues) {
    if (!this.prev || this.prev.length !== currentValues.length) {
      this.prev = [...currentValues];
      return currentValues;
    }

    const smoothed = currentValues.map((val, i) => {
      return this.alpha * val + (1 - this.alpha) * this.prev[i];
    });

    this.prev = [...smoothed];
    return smoothed;
  }

  reset() {
    this.prev = null;
  }
}
