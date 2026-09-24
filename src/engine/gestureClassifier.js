/**
 * Real-Time Gesture & ASL Alphabet Classifier
 * Supports:
 * 1. Full ASL Alphabet Fingerspelling (A through Z)
 * 2. Service-Counter & Public Conversational Gestures
 * 3. Dynamic Trajectory Recognizer (J, Z, Wave, Nod, Shake)
 * 4. Hysteresis Debounce & Word Composer
 */

import { VOCABULARY } from '../data/vocabulary.js';
import { LANDMARK, distance } from './mathUtils.js';

export class GestureClassifier {
  constructor(customTrainer = null) {
    this.customTrainer = customTrainer;
    this.historyBuffer = [];
    this.bufferSize = 5;
    this.lastCommittedSign = null;
    this.lastCommitTime = 0;
    this.commitCooldownMs = 900; // Time before same sign can re-trigger TTS
    this.confidenceThreshold = 0.55;
    this.recognitionMode = 'HYBRID'; // 'HYBRID' | 'ASL_ALPHABET' | 'GESTURES'
  }

  setMode(mode) {
    this.recognitionMode = mode;
  }

  /**
   * Main classification entrypoint per video frame
   */
  classify(extractedFeatures, motionData) {
    if (!extractedFeatures || extractedFeatures.handsCount === 0) {
      this._pushBuffer(null, 0);
      return {
        bestMatch: null,
        confidence: 0,
        topMatches: [],
        isStable: false,
        handCount: 0
      };
    }

    const { hands, twoHandRelation } = extractedFeatures;
    const primaryHand = hands[0];
    const secondaryHand = hands.length > 1 ? hands[1] : null;

    // Check custom trained user gestures first
    if (this.customTrainer && this.customTrainer.hasCustomGestures()) {
      const customMatch = this.customTrainer.classifyCustom(primaryHand.featureVector);
      if (customMatch && customMatch.confidence > 0.85) {
        return this._processResult(customMatch.signId, customMatch.confidence, [customMatch]);
      }
    }

    // Evaluate candidates
    const scoredCandidates = [];

    // 1. Evaluate Two-Handed Gestures (if mode allows and 2 hands present)
    if (this.recognitionMode !== 'ASL_ALPHABET' && twoHandRelation && secondaryHand) {
      const twoHandScores = this._classifyTwoHanded(primaryHand, secondaryHand, twoHandRelation, motionData);
      twoHandScores.forEach(res => scoredCandidates.push(res));
    }

    // 2. Evaluate ASL Alphabet (if mode is ASL_ALPHABET or HYBRID)
    if (this.recognitionMode !== 'GESTURES') {
      const aslScores = this._classifyASLAlphabet(primaryHand, motionData);
      aslScores.forEach(res => scoredCandidates.push(res));
    }

    // 3. Evaluate Single-Hand Service Gestures (if mode is GESTURES or HYBRID)
    if (this.recognitionMode !== 'ASL_ALPHABET') {
      const singleHandScores = this._classifySingleHand(primaryHand, motionData);
      singleHandScores.forEach(res => scoredCandidates.push(res));
    }

    // Sort by confidence descending
    scoredCandidates.sort((a, b) => b.confidence - a.confidence);

    const bestCandidate = scoredCandidates.length > 0 ? scoredCandidates[0] : null;
    const bestSignId = bestCandidate && bestCandidate.confidence >= this.confidenceThreshold ? bestCandidate.id : null;
    const bestConfidence = bestCandidate ? bestCandidate.confidence : 0;

    // Push into temporal buffer for smoothing
    const smoothed = this._pushBuffer(bestSignId, bestConfidence);

    // Get metadata for top predictions
    const topMatches = scoredCandidates.slice(0, 3).map(cand => {
      const signInfo = VOCABULARY.find(v => v.id === cand.id);
      return {
        id: cand.id,
        name: signInfo ? signInfo.name : cand.id,
        letter: signInfo ? signInfo.letter : null,
        category: signInfo ? signInfo.category : 'general',
        confidence: Math.round(cand.confidence * 100),
        reason: cand.reason
      };
    });

    const activeSignInfo = smoothed.stableSign
      ? VOCABULARY.find(v => v.id === smoothed.stableSign)
      : (bestSignId ? VOCABULARY.find(v => v.id === bestSignId) : null);

    return {
      bestMatch: activeSignInfo || null,
      confidence: Math.round(smoothed.confidence * 100),
      topMatches,
      isStable: smoothed.isStable,
      handCount: hands.length,
      primaryHandOrientation: primaryHand.orientation,
      fingerStates: primaryHand.fingerStates
    };
  }

  /**
   * Complete ASL Alphabet Classifier (A - Z)
   */
  _classifyASLAlphabet(hand, motion) {
    const results = [];
    const f = hand.fingerStates;
    const d = hand.distances;
    const a = hand.angles;
    const o = hand.orientation;
    const raw = hand.raw;

    const allFolded = f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED';
    const allOpen = f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'OPEN';

    // ASL A: All 4 folded, thumb straight up alongside index
    if (allFolded && f.thumb === 'OPEN' && raw[LANDMARK.THUMB_TIP].y < raw[LANDMARK.INDEX_MCP].y) {
      results.push({ id: 'ASL_A', confidence: 0.95, reason: 'ASL Letter A (Fist with thumb up)' });
    }

    // ASL B: 4 fingers open vertical, thumb folded across palm
    if (allOpen && f.thumb === 'FOLDED' && o.pointingUp) {
      results.push({ id: 'ASL_B', confidence: 0.96, reason: 'ASL Letter B (Flat vertical palm, thumb in)' });
    }

    // ASL C: All fingers curved in C-arc
    if (f.index === 'HALF' && f.middle === 'HALF' && f.ring === 'HALF' && f.pinky === 'HALF' && f.thumb !== 'FOLDED') {
      if (d.thumbTipToIndexTip > 0.18 && d.thumbTipToIndexTip < 0.45) {
        results.push({ id: 'ASL_C', confidence: 0.94, reason: 'ASL Letter C (Curved semi-circle hand)' });
      }
    }

    // ASL D: Index straight up, thumb touching middle/ring/pinky tips
    if (f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (d.thumbTipToMiddleTip < 0.22) {
        results.push({ id: 'ASL_D', confidence: 0.96, reason: 'ASL Letter D (Index up, circle base)' });
      }
    }

    // ASL E: All 4 curled down, thumb tucked beneath fingertips
    if (allFolded && f.thumb === 'FOLDED') {
      if (raw[LANDMARK.THUMB_TIP].y > raw[LANDMARK.INDEX_DIP].y) {
        results.push({ id: 'ASL_E', confidence: 0.93, reason: 'ASL Letter E (Curled fingertips over thumb)' });
      }
    }

    // ASL F: Thumb and Index in circle (OK shape), middle/ring/pinky open straight
    if (d.thumbTipToIndexTip < 0.16 && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'OPEN') {
      results.push({ id: 'ASL_F', confidence: 0.96, reason: 'ASL Letter F (OK circle with 3 fingers up)' });
    }

    // ASL G: Index & Thumb extended parallel horizontally
    if (f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED' && f.thumb === 'OPEN') {
      if (o.pointingSide && d.thumbTipToIndexTip < 0.35) {
        results.push({ id: 'ASL_G', confidence: 0.92, reason: 'ASL Letter G (Index & thumb horizontal pinch)' });
      }
    }

    // ASL H: Index & Middle extended horizontally together
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (o.pointingSide && a.indexMiddleSpread < 14) {
        results.push({ id: 'ASL_H', confidence: 0.93, reason: 'ASL Letter H (Two fingers pointing sideways)' });
      }
    }

    // ASL I: Only pinky extended straight up
    if (f.pinky === 'OPEN' && f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.thumb !== 'OPEN') {
      if (!motion.isWaving) {
        results.push({ id: 'ASL_I', confidence: 0.96, reason: 'ASL Letter I (Vertical pinky finger)' });
      }
    }

    // ASL J: Pinky extended with J-curve motion trajectory
    if (f.pinky === 'OPEN' && f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED') {
      if (motion.velocity.speed > 0.08 || motion.yReversals >= 1) {
        results.push({ id: 'ASL_J', confidence: 0.95, reason: 'ASL Letter J (Pinky swooping J curve)' });
      }
    }

    // ASL K: Index vertical, Middle forward at 45 deg, Thumb between
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED' && f.thumb === 'OPEN') {
      if (a.indexMiddleSpread > 15 && raw[LANDMARK.INDEX_TIP].y < raw[LANDMARK.MIDDLE_TIP].y) {
        results.push({ id: 'ASL_K', confidence: 0.93, reason: 'ASL Letter K (Index up, middle forward, thumb between)' });
      }
    }

    // ASL L: Thumb and Index at 90-degree L angle
    if (f.index === 'OPEN' && f.thumb === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (a.thumbIndexSpread > 50 && a.thumbIndexSpread < 125) {
        results.push({ id: 'ASL_L', confidence: 0.96, reason: 'ASL Letter L (Perpendicular L-shape)' });
      }
    }

    // ASL M: Thumb tucked under index, middle, ring
    if (allFolded && raw[LANDMARK.THUMB_TIP].x > raw[LANDMARK.RING_MCP].x) {
      results.push({ id: 'ASL_M', confidence: 0.88, reason: 'ASL Letter M (Three knuckles over thumb)' });
    }

    // ASL N: Thumb tucked under index and middle
    if (allFolded && raw[LANDMARK.THUMB_TIP].x > raw[LANDMARK.MIDDLE_MCP].x && raw[LANDMARK.THUMB_TIP].x <= raw[LANDMARK.RING_MCP].x) {
      results.push({ id: 'ASL_N', confidence: 0.89, reason: 'ASL Letter N (Two knuckles over thumb)' });
    }

    // ASL O: All fingertips meeting thumb in O-ring
    if (d.thumbTipToIndexTip < 0.12 && d.thumbTipToMiddleTip < 0.14 && f.ring === 'HALF' && f.pinky === 'HALF') {
      results.push({ id: 'ASL_O', confidence: 0.95, reason: 'ASL Letter O (Circular O hand)' });
    }

    // ASL P: K-shape pointing downwards
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.thumb === 'OPEN' && o.pointingDown) {
      results.push({ id: 'ASL_P', confidence: 0.93, reason: 'ASL Letter P (Downward K hand)' });
    }

    // ASL Q: G-shape pointing downwards
    if (f.index === 'OPEN' && f.thumb === 'OPEN' && f.middle === 'FOLDED' && o.pointingDown) {
      results.push({ id: 'ASL_Q', confidence: 0.92, reason: 'ASL Letter Q (Downward pinch)' });
    }

    // ASL R: Index & Middle crossed over each other
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (d.indexTipToMiddleTip < 0.08 && a.indexMiddleSpread < 10) {
        results.push({ id: 'ASL_R', confidence: 0.94, reason: 'ASL Letter R (Crossed fingers)' });
      }
    }

    // ASL S: Tight fist with thumb across front of all 4 fingers
    if (allFolded && f.thumb === 'FOLDED') {
      if (raw[LANDMARK.THUMB_TIP].x < raw[LANDMARK.MIDDLE_MCP].x) {
        results.push({ id: 'ASL_S', confidence: 0.94, reason: 'ASL Letter S (Thumb wrapped in front of fist)' });
      }
    }

    // ASL T: Thumb tucked between index and middle
    if (allFolded && raw[LANDMARK.THUMB_TIP].x >= raw[LANDMARK.INDEX_MCP].x && raw[LANDMARK.THUMB_TIP].x < raw[LANDMARK.MIDDLE_MCP].x) {
      results.push({ id: 'ASL_T', confidence: 0.91, reason: 'ASL Letter T (Thumb between index and middle)' });
    }

    // ASL U: Index and Middle straight up touching together
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED' && f.thumb === 'FOLDED') {
      if (a.indexMiddleSpread < 12 && d.indexTipToMiddleTip < 0.09) {
        results.push({ id: 'ASL_U', confidence: 0.95, reason: 'ASL Letter U (Index & middle touching parallel)' });
      }
    }

    // ASL V: Index and Middle straight up spread apart (V-shape)
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED' && f.thumb === 'FOLDED') {
      if (a.indexMiddleSpread >= 14) {
        results.push({ id: 'ASL_V', confidence: 0.96, reason: 'ASL Letter V (Peace / V-sign)' });
      }
    }

    // ASL W: Index, Middle, Ring straight up in W
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'FOLDED') {
      results.push({ id: 'ASL_W', confidence: 0.96, reason: 'ASL Letter W (Three fingers in W)' });
    }

    // ASL X: Index bent in hook shape
    if (f.index === 'HALF' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED' && f.thumb !== 'OPEN') {
      results.push({ id: 'ASL_X', confidence: 0.94, reason: 'ASL Letter X (Hooked index finger)' });
    }

    // ASL Y: Thumb and Pinky extended wide (Hang Loose)
    if (f.thumb === 'OPEN' && f.pinky === 'OPEN' && f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED') {
      results.push({ id: 'ASL_Y', confidence: 0.97, reason: 'ASL Letter Y (Thumb and pinky extended)' });
    }

    // ASL Z: Index extended tracing Z in air
    if (f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (motion.xReversals >= 2 && motion.velocity.speed > 0.06) {
        results.push({ id: 'ASL_Z', confidence: 0.96, reason: 'ASL Letter Z (Z-shaped air trajectory)' });
      }
    }

    return results;
  }

  /**
   * Classify Two-Handed Gestures
   */
  _classifyTwoHanded(hand1, hand2, rel, motion) {
    const results = [];
    const h1Fingers = hand1.fingerStates;
    const h2Fingers = hand2.fingerStates;

    // DOCTOR / MEDICAL: Index/middle tapping Left wrist pulse
    const h1IndexToH2Wrist = distance(hand1.raw[LANDMARK.INDEX_TIP], hand2.wristPosition);
    const h2IndexToH1Wrist = distance(hand2.raw[LANDMARK.INDEX_TIP], hand1.wristPosition);
    if ((h1IndexToH2Wrist < 0.22 || h2IndexToH1Wrist < 0.22)) {
      const tappingHand = h1IndexToH2Wrist < h2IndexToH1Wrist ? hand1 : hand2;
      if (tappingHand.fingerStates.index === 'OPEN' && tappingHand.fingerStates.ring === 'FOLDED') {
        results.push({ id: 'DOCTOR_MEDICAL', confidence: 0.94, reason: 'Finger tapping wrist pulse area' });
      }
    }

    // MEDICINE / PHARMACY: Middle finger grinding in open palm (mortar & pestle)
    if (rel.areHandsTouching) {
      const hasGrind = (h1Fingers.middle === 'HALF' && h2Fingers.index === 'OPEN') ||
                        (h2Fingers.middle === 'HALF' && h1Fingers.index === 'OPEN');
      if (hasGrind) {
        results.push({ id: 'MEDICINE_PHARMACY', confidence: 0.92, reason: 'Middle finger grinding in palm (Medicine)' });
      }
    }

    // SIGN_FORM: Flat non-dominant palm + dominant hand holding pen signing
    if (rel.areHandsTouching) {
      const isOneFlat = (h1Fingers.index === 'OPEN' && h1Fingers.middle === 'OPEN' && h1Fingers.pinky === 'OPEN') ||
                        (h2Fingers.index === 'OPEN' && h2Fingers.middle === 'OPEN' && h2Fingers.pinky === 'OPEN');
      const isOtherPencil = (h1Fingers.index === 'OPEN' && h1Fingers.ring === 'FOLDED') ||
                            (h2Fingers.index === 'OPEN' && h2Fingers.ring === 'FOLDED');
      if (isOneFlat && isOtherPencil) {
        results.push({ id: 'SIGN_FORM', confidence: 0.90, reason: 'Writing on open palm' });
      }
    }

    // HELP_ASSIST: Dominant fist resting on flat non-dominant palm
    if (rel.areHandsTouching) {
      const hasFist = (h1Fingers.index === 'FOLDED' && h1Fingers.middle === 'FOLDED') ||
                      (h2Fingers.index === 'FOLDED' && h2Fingers.middle === 'FOLDED');
      const hasFlat = (h1Fingers.index === 'OPEN' && h1Fingers.pinky === 'OPEN') ||
                      (h2Fingers.index === 'OPEN' && h2Fingers.pinky === 'OPEN');
      if (hasFist && hasFlat) {
        results.push({ id: 'HELP_ASSIST', confidence: 0.91, reason: 'Fist supported on flat palm' });
      }
    }

    // RECEIPT_FEE: Two flat hands sliding past each other
    if (rel.areHandsTouching && rel.palmDistance < 0.20) {
      if (h1Fingers.index === 'OPEN' && h2Fingers.index === 'OPEN' && h1Fingers.pinky !== 'OPEN') {
        results.push({ id: 'RECEIPT_FEE', confidence: 0.88, reason: 'Two hands sliding card/paper' });
      }
    }

    // REPEAT_AGAIN: Curved hand diving into flat palm
    if (rel.areHandsTouching && rel.dominantOnTop) {
      if (h1Fingers.index === 'OPEN' && h2Fingers.index === 'OPEN') {
        results.push({ id: 'REPEAT_AGAIN', confidence: 0.86, reason: 'Hand diving into flat palm' });
      }
    }

    return results;
  }

  /**
   * Classify Single Hand Gestures
   */
  _classifySingleHand(hand, motion) {
    const results = [];
    const f = hand.fingerStates;
    const d = hand.distances;
    const a = hand.angles;
    const o = hand.orientation;
    const raw = hand.raw;

    // 1. HELLO: All 5 fingers OPEN + waving or high palm
    if (f.thumb === 'OPEN' && f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'OPEN') {
      if (motion.isWaving || (motion.velocity.speed > 0.05 && o.pointingUp)) {
        results.push({ id: 'HELLO', confidence: 0.95, reason: 'Open palm with wave motion' });
      } else if (o.pointingUp && raw[LANDMARK.WRIST].y < 0.70) {
        results.push({ id: 'HELLO', confidence: 0.85, reason: 'Open high palm facing forward' });
      }
    }

    // 2. THANK YOU: Flat hand moving forward from chin
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'OPEN') {
      if (raw[LANDMARK.INDEX_TIP].y < 0.60 && !motion.isWaving) {
        results.push({ id: 'THANK_YOU', confidence: 0.90, reason: 'Open hand near chin moving outward' });
      }
    }

    // 3. PLEASE: Flat hand over chest with gentle circular motion
    if (f.thumb === 'OPEN' && f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'OPEN') {
      if (raw[LANDMARK.WRIST].y >= 0.55 && raw[LANDMARK.WRIST].y <= 0.88 && !motion.isWaving) {
        results.push({ id: 'PLEASE', confidence: 0.88, reason: 'Flat hand centered at chest' });
      }
    }

    // 4. SORRY: A-fist rubbing in gentle circular motion over chest
    if (f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED' && f.thumb === 'OPEN') {
      if (raw[LANDMARK.WRIST].y >= 0.50 && raw[LANDMARK.WRIST].y <= 0.85) {
        results.push({ id: 'SORRY', confidence: 0.89, reason: 'A-fist over chest' });
      }
    }

    // 5. YES: Closed fist nodding up and down
    if (f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (motion.isNodding) {
        results.push({ id: 'YES', confidence: 0.96, reason: 'Fist nodding up and down' });
      }
    }

    // 6. NO: Index + Middle open snapping/pinching down onto thumb
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (d.thumbTipToIndexTip < 0.26 || d.thumbTipToMiddleTip < 0.26) {
        results.push({ id: 'NO', confidence: 0.94, reason: 'Index & middle pinched to thumb (No sign)' });
      } else if (motion.isShaking) {
        results.push({ id: 'NO', confidence: 0.89, reason: 'Two-finger side shake' });
      }
    }

    // 7. GOOD / OK: Thumbs Up
    if (f.thumb === 'OPEN' && f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      const isThumbUp = raw[LANDMARK.THUMB_TIP].y < raw[LANDMARK.WRIST].y;
      if (isThumbUp) {
        results.push({ id: 'GOOD_OK', confidence: 0.96, reason: 'Thumbs up confirmed' });
      }
    }

    // 8. I AM DEAF: Pointing index to ear/mouth
    if (f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (raw[LANDMARK.INDEX_TIP].y < 0.45) {
        results.push({ id: 'DEAF_ASSIST', confidence: 0.92, reason: 'Pointing near ear/head region' });
      }
    }

    // 9. ID CARD: L-shape thumb and index
    if (f.thumb === 'OPEN' && f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (a.thumbIndexSpread > 40 && a.thumbIndexSpread < 125) {
        results.push({ id: 'ID_CARD', confidence: 0.93, reason: 'L-shape ID badge gesture' });
      }
    }

    // 10. ACCOUNT / MONEY: Thumb-index money pinch
    if (f.thumb === 'OPEN' && f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (d.thumbTipToIndexTip < 0.20 && d.thumbTipToMiddleTip < 0.22) {
        results.push({ id: 'ACCOUNT_MONEY', confidence: 0.92, reason: 'Thumb-index money pinch' });
      }
    }

    // 11. EMERGENCY: Rapid urgent hand shake
    if (motion.isShaking && motion.velocity.speed > 0.12) {
      results.push({ id: 'EMERGENCY', confidence: 0.95, reason: 'Urgent rapid hand oscillation' });
    }

    // 12. WATER / RESTROOM: W-sign
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'FOLDED' && f.thumb === 'FOLDED') {
      results.push({ id: 'WATER_RESTROOM', confidence: 0.93, reason: 'W-gesture (Water / Facility)' });
    }

    // 13. POLICE / SECURITY: C-hand over chest
    if (f.index === 'HALF' && f.middle === 'HALF' && f.ring === 'HALF' && f.pinky === 'HALF' && f.thumb === 'OPEN') {
      if (raw[LANDMARK.WRIST].y > 0.50) {
        results.push({ id: 'POLICE_SECURITY', confidence: 0.87, reason: 'C-hand over chest badge' });
      }
    }

    // 14. WAIT / STOP: Steady flat stop palm
    if (f.thumb === 'OPEN' && f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'OPEN') {
      if (motion.isStationary && o.pointingUp) {
        results.push({ id: 'WAIT_STOP', confidence: 0.89, reason: 'Steady flat stop palm' });
      }
    }

    // 15. PHONE / CALL: Y-sign (Thumb and Pinky extended)
    if (f.thumb === 'OPEN' && f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'OPEN') {
      results.push({ id: 'PHONE_CALL', confidence: 0.95, reason: 'Y-hand telephone gesture' });
    }

    // 16. ILY: Thumb, Index, Pinky extended
    if (f.thumb === 'OPEN' && f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'OPEN') {
      results.push({ id: 'SIGN_ILY', confidence: 0.96, reason: 'ILY ASL sign' });
    }

    return results;
  }

  /**
   * Hysteresis buffer to ensure temporal stability and prevent jitter
   */
  _pushBuffer(signId, confidence) {
    this.historyBuffer.push({ signId, confidence, time: performance.now() });
    if (this.historyBuffer.length > this.bufferSize) {
      this.historyBuffer.shift();
    }

    const counts = {};
    let totalConf = 0;

    this.historyBuffer.forEach(item => {
      if (item.signId) {
        counts[item.signId] = (counts[item.signId] || 0) + 1;
        totalConf += item.confidence;
      }
    });

    let majoritySign = null;
    let maxCount = 0;

    for (const [id, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        majoritySign = id;
      }
    }

    const isStable = maxCount >= 3; // At least 3 of last 5 frames agreed
    const avgConfidence = this.historyBuffer.length > 0 ? (totalConf / this.historyBuffer.length) : 0;

    return {
      stableSign: isStable ? majoritySign : null,
      confidence: avgConfidence,
      isStable
    };
  }

  /**
   * Check if a sign is ready to trigger a new TTS / transcript event
   */
  canTriggerCommit(signId) {
    if (!signId) return false;
    const now = performance.now();
    if (signId === this.lastCommittedSign && (now - this.lastCommitTime) < this.commitCooldownMs) {
      return false;
    }
    this.lastCommittedSign = signId;
    this.lastCommitTime = now;
    return true;
  }
}
