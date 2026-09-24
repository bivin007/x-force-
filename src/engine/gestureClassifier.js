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
    const aligned = hand.aligned || hand.normalized;

    const allFolded = f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED';
    const allOpen = f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'OPEN';

    // ASL A: All 4 folded into fist, thumb standing straight upright alongside index finger
    if (allFolded && f.thumb !== 'FOLDED' && aligned[LANDMARK.THUMB_TIP].y < aligned[LANDMARK.INDEX_MCP].y && aligned[LANDMARK.THUMB_TIP].x < -0.10) {
      results.push({ id: 'ASL_A', confidence: 0.96, reason: 'ASL Letter A (Upright thumb alongside fist)' });
    }

    // ASL B: 4 fingers straight open vertical, thumb folded across palm
    if (allOpen && f.thumb === 'FOLDED' && !o.pointingDown) {
      results.push({ id: 'ASL_B', confidence: 0.97, reason: 'ASL Letter B (Vertical open palm, thumb tucked)' });
    }

    // ASL C: All 5 fingers curved in semi-circular C arc
    if (f.index === 'HALF' && f.middle === 'HALF' && f.ring === 'HALF' && f.pinky === 'HALF' && f.thumb !== 'FOLDED') {
      if (d.thumbTipToIndexTip > 0.18 && d.thumbTipToIndexTip < 0.50) {
        results.push({ id: 'ASL_C', confidence: 0.95, reason: 'ASL Letter C (Curved C arc)' });
      }
    }

    // ASL D: Index straight up, other 3 fingers curled touching thumb in circle
    if (f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (d.thumbTipToMiddleTip < 0.24 || d.thumbTipToIndexTip < 0.32) {
        results.push({ id: 'ASL_D', confidence: 0.96, reason: 'ASL Letter D (Index up, circle base)' });
      }
    }

    // ASL E: All 4 fingers curled down with fingertips resting over thumb
    if (allFolded && f.thumb === 'FOLDED') {
      if (aligned[LANDMARK.INDEX_TIP].y > aligned[LANDMARK.INDEX_PIP].y - 0.05 && aligned[LANDMARK.THUMB_TIP].y >= aligned[LANDMARK.INDEX_PIP].y - 0.05) {
        results.push({ id: 'ASL_E', confidence: 0.94, reason: 'ASL Letter E (Fingertips curled over thumb)' });
      }
    }

    // ASL F: Thumb and Index touching in OK ring, other 3 fingers straight open
    if (d.thumbTipToIndexTip < 0.18 && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'OPEN') {
      results.push({ id: 'ASL_F', confidence: 0.97, reason: 'ASL Letter F (OK circle with 3 fingers up)' });
    }

    // ASL G: Index and Thumb extended forward parallel horizontally (pinch shape)
    if (f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED' && f.thumb === 'OPEN') {
      if (o.pointingSide && d.thumbTipToIndexTip < 0.35 && !o.pointingDown) {
        results.push({ id: 'ASL_G', confidence: 0.94, reason: 'ASL Letter G (Index & thumb horizontal pinch)' });
      }
    }

    // ASL H: Index and Middle extended horizontally together
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (o.pointingSide && d.indexTipToMiddleTip < 0.13) {
        results.push({ id: 'ASL_H', confidence: 0.94, reason: 'ASL Letter H (Two fingers pointing sideways)' });
      }
    }

    // ASL I: Only Pinky extended straight up
    if (f.pinky === 'OPEN' && f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.thumb !== 'OPEN') {
      if (!motion.isWaving && motion.velocity.speed < 0.06) {
        results.push({ id: 'ASL_I', confidence: 0.96, reason: 'ASL Letter I (Vertical pinky finger)' });
      }
    }

    // ASL J: Pinky extended with J-curve motion trajectory
    if (f.pinky === 'OPEN' && f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED') {
      if (motion.velocity.speed > 0.08 || motion.yReversals >= 1) {
        results.push({ id: 'ASL_J', confidence: 0.96, reason: 'ASL Letter J (Pinky swooping J curve)' });
      }
    }

    // ASL K: Index vertical, Middle forward at 45 deg, Thumb between
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED' && f.thumb === 'OPEN') {
      if (aligned[LANDMARK.INDEX_TIP].y < aligned[LANDMARK.MIDDLE_TIP].y - 0.08) {
        results.push({ id: 'ASL_K', confidence: 0.94, reason: 'ASL Letter K (Index up, middle forward)' });
      }
    }

    // ASL L: Thumb and Index at 90-degree L angle
    if (f.index === 'OPEN' && f.thumb === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (a.thumbIndexSpread > 45 && a.thumbIndexSpread < 125) {
        results.push({ id: 'ASL_L', confidence: 0.97, reason: 'ASL Letter L (Perpendicular L-shape)' });
      }
    }

    // ASL M: 3 knuckles over thumb (thumb tucked under ring)
    if (allFolded && aligned[LANDMARK.THUMB_TIP].x >= aligned[LANDMARK.RING_MCP].x - 0.05 && aligned[LANDMARK.THUMB_TIP].x <= aligned[LANDMARK.PINKY_MCP].x + 0.05) {
      results.push({ id: 'ASL_M', confidence: 0.92, reason: 'ASL Letter M (Three knuckles over thumb)' });
    }

    // ASL N: 2 knuckles over thumb (thumb tucked under middle)
    if (allFolded && aligned[LANDMARK.THUMB_TIP].x >= aligned[LANDMARK.MIDDLE_MCP].x - 0.05 && aligned[LANDMARK.THUMB_TIP].x < aligned[LANDMARK.RING_MCP].x) {
      results.push({ id: 'ASL_N', confidence: 0.93, reason: 'ASL Letter N (Two knuckles over thumb)' });
    }

    // ASL O: All 5 fingertips meeting thumb in O-ring
    if (d.thumbTipToIndexTip < 0.14 && d.thumbTipToMiddleTip < 0.16 && f.ring !== 'OPEN' && f.pinky !== 'OPEN') {
      results.push({ id: 'ASL_O', confidence: 0.96, reason: 'ASL Letter O (Circular O hand)' });
    }

    // ASL P: K-shape pointing downwards
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.thumb === 'OPEN' && o.pointingDown) {
      results.push({ id: 'ASL_P', confidence: 0.94, reason: 'ASL Letter P (Downward K hand)' });
    }

    // ASL Q: G-shape pointing downwards
    if (f.index === 'OPEN' && f.thumb === 'OPEN' && f.middle === 'FOLDED' && o.pointingDown) {
      results.push({ id: 'ASL_Q', confidence: 0.94, reason: 'ASL Letter Q (Downward pinch)' });
    }

    // ASL R: Index & Middle crossed over each other
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (d.indexTipToMiddleTip < 0.09) {
        results.push({ id: 'ASL_R', confidence: 0.95, reason: 'ASL Letter R (Crossed fingers)' });
      }
    }

    // ASL S: Tight fist with thumb wrapped across front of all 4 fingers
    if (allFolded && f.thumb === 'FOLDED') {
      if (aligned[LANDMARK.THUMB_TIP].x >= -0.10 && aligned[LANDMARK.THUMB_TIP].x <= 0.15 && aligned[LANDMARK.THUMB_TIP].y >= aligned[LANDMARK.INDEX_PIP].y) {
        results.push({ id: 'ASL_S', confidence: 0.95, reason: 'ASL Letter S (Thumb wrapped in front of fist)' });
      }
    }

    // ASL T: Thumb tucked between index and middle
    if (allFolded && aligned[LANDMARK.THUMB_TIP].x >= aligned[LANDMARK.INDEX_MCP].x - 0.05 && aligned[LANDMARK.THUMB_TIP].x < aligned[LANDMARK.MIDDLE_MCP].x) {
      results.push({ id: 'ASL_T', confidence: 0.93, reason: 'ASL Letter T (Thumb between index and middle)' });
    }

    // ASL U: Index and Middle straight up touching together
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED' && f.thumb === 'FOLDED') {
      if (d.indexTipToMiddleTip < 0.11 && a.indexMiddleSpread < 12) {
        results.push({ id: 'ASL_U', confidence: 0.96, reason: 'ASL Letter U (Index & middle touching parallel)' });
      }
    }

    // ASL V: Index and Middle straight up spread apart (V-shape)
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED' && f.thumb === 'FOLDED') {
      if (d.indexTipToMiddleTip >= 0.13 || a.indexMiddleSpread >= 13) {
        results.push({ id: 'ASL_V', confidence: 0.97, reason: 'ASL Letter V (Peace / V-sign)' });
      }
    }

    // ASL W: Index, Middle, Ring straight up in W
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'FOLDED') {
      results.push({ id: 'ASL_W', confidence: 0.97, reason: 'ASL Letter W (Three fingers in W)' });
    }

    // ASL X: Index bent in hook shape
    if (f.index === 'HALF' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED' && f.thumb !== 'OPEN') {
      results.push({ id: 'ASL_X', confidence: 0.95, reason: 'ASL Letter X (Hooked index finger)' });
    }

    // ASL Y: Thumb and Pinky extended wide (Hang Loose)
    if (f.thumb === 'OPEN' && f.pinky === 'OPEN' && f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED') {
      results.push({ id: 'ASL_Y', confidence: 0.98, reason: 'ASL Letter Y (Thumb and pinky extended)' });
    }

    // ASL Z: Index extended tracing Z in air
    if (f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (motion.xReversals >= 2 && motion.velocity.speed > 0.06) {
        results.push({ id: 'ASL_Z', confidence: 0.96, reason: 'ASL Letter Z (Z-shaped air trajectory)' });
      }
    }

    // HAND SPACE: Distinct rightward hand swipe
    if (motion.isSwipingRight && motion.velocity.speed > 0.08 && motion.velocity.x > 0.05 && !motion.isWaving) {
      results.push({ id: 'SPACE', confidence: 0.98, reason: 'Space (Dynamic Swipe Right)' });
    }

    // HAND BACKSPACE: Distinct leftward hand swipe OR explicit sideways thumbs-left gesture
    const isSidewaysThumbsLeft = allFolded && f.thumb === 'OPEN' && Math.abs(o.roll) > 55 && o.pointingSide && motion.isStationary;
    if ((motion.isSwipingLeft && motion.velocity.speed > 0.08 && motion.velocity.x < -0.05 && !motion.isWaving) || isSidewaysThumbsLeft) {
      results.push({ id: 'BACKSPACE', confidence: 0.98, reason: 'Backspace (Dynamic Swipe Left / Thumbs-Left)' });
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
      if (motion.isWaving) {
        results.push({ id: 'HELLO', confidence: 0.96, reason: 'Open palm with wave motion' });
      } else if (o.pointingUp && raw[LANDMARK.WRIST].y < 0.70 && !motion.isSwipingRight) {
        results.push({ id: 'HELLO', confidence: 0.88, reason: 'Open high palm facing forward' });
      }
    }

    // 2. THANK YOU: Flat hand moving forward from chin
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'OPEN') {
      if (raw[LANDMARK.INDEX_TIP].y < 0.50 && !motion.isWaving && !motion.isSwipingRight) {
        results.push({ id: 'THANK_YOU', confidence: 0.91, reason: 'Open hand near chin moving outward' });
      }
    }

    // 3. PLEASE: Flat hand over chest with gentle circular motion
    if (f.thumb === 'OPEN' && f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'OPEN') {
      if (raw[LANDMARK.WRIST].y >= 0.58 && raw[LANDMARK.WRIST].y <= 0.88 && !motion.isWaving && !motion.isSwipingRight) {
        results.push({ id: 'PLEASE', confidence: 0.89, reason: 'Flat hand centered at chest' });
      }
    }

    // 4. YES: Closed fist nodding up and down
    if (f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (motion.isNodding) {
        results.push({ id: 'YES', confidence: 0.96, reason: 'Fist nodding up and down' });
      }
    }

    // 5. NO: Index + Middle open snapping/pinching down onto thumb
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (d.thumbTipToIndexTip < 0.24 || d.thumbTipToMiddleTip < 0.24) {
        results.push({ id: 'NO', confidence: 0.94, reason: 'Index & middle pinched to thumb (No sign)' });
      } else if (motion.isShaking) {
        results.push({ id: 'NO', confidence: 0.90, reason: 'Two-finger side shake' });
      }
    }

    // 6. GOOD / OK: Thumbs Up
    if (f.thumb === 'OPEN' && f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      const isThumbUp = raw[LANDMARK.THUMB_TIP].y < raw[LANDMARK.INDEX_MCP].y && Math.abs(o.roll) < 40;
      if (isThumbUp && motion.isStationary) {
        results.push({ id: 'GOOD_OK', confidence: 0.96, reason: 'Thumbs up confirmed' });
      }
    }

    // 7. I AM DEAF: Pointing index to ear/mouth
    if (f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (raw[LANDMARK.INDEX_TIP].y < 0.45) {
        results.push({ id: 'DEAF_ASSIST', confidence: 0.92, reason: 'Pointing near ear/head region' });
      }
    }

    // 8. ID CARD: L-shape thumb and index
    if (f.thumb === 'OPEN' && f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (a.thumbIndexSpread > 40 && a.thumbIndexSpread < 125) {
        results.push({ id: 'ID_CARD', confidence: 0.93, reason: 'L-shape ID badge gesture' });
      }
    }

    // 9. ACCOUNT / MONEY: Thumb-index money pinch
    if (f.thumb === 'OPEN' && f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'FOLDED' && f.pinky === 'FOLDED') {
      if (d.thumbTipToIndexTip < 0.20 && d.thumbTipToMiddleTip < 0.22) {
        results.push({ id: 'ACCOUNT_MONEY', confidence: 0.92, reason: 'Thumb-index money pinch' });
      }
    }

    // 10. EMERGENCY: Rapid urgent hand shake
    if (motion.isShaking && motion.velocity.speed > 0.12) {
      results.push({ id: 'EMERGENCY', confidence: 0.96, reason: 'Urgent rapid hand oscillation' });
    }

    // 11. WATER / RESTROOM: W-sign
    if (f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'FOLDED' && f.thumb === 'FOLDED') {
      results.push({ id: 'WATER_RESTROOM', confidence: 0.93, reason: 'W-gesture (Water / Facility)' });
    }

    // 12. POLICE / SECURITY: C-hand over chest
    if (f.index === 'HALF' && f.middle === 'HALF' && f.ring === 'HALF' && f.pinky === 'HALF' && f.thumb === 'OPEN') {
      if (raw[LANDMARK.WRIST].y > 0.50) {
        results.push({ id: 'POLICE_SECURITY', confidence: 0.87, reason: 'C-hand over chest badge' });
      }
    }

    // 13. WAIT / STOP: Steady flat stop palm
    if (f.thumb === 'OPEN' && f.index === 'OPEN' && f.middle === 'OPEN' && f.ring === 'OPEN' && f.pinky === 'OPEN') {
      if (motion.isStationary && o.pointingUp) {
        results.push({ id: 'WAIT_STOP', confidence: 0.89, reason: 'Steady flat stop palm' });
      }
    }

    // 14. PHONE / CALL: Y-sign (Thumb and Pinky extended)
    if (f.thumb === 'OPEN' && f.index === 'FOLDED' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'OPEN') {
      results.push({ id: 'PHONE_CALL', confidence: 0.95, reason: 'Y-hand telephone gesture' });
    }

    // 15. ILY: Thumb, Index, Pinky extended
    if (f.thumb === 'OPEN' && f.index === 'OPEN' && f.middle === 'FOLDED' && f.ring === 'FOLDED' && f.pinky === 'OPEN') {
      results.push({ id: 'SIGN_ILY', confidence: 0.96, reason: 'ILY ASL sign' });
    }

    // 16. HAND SPACE (Swipe Right in Gestures mode)
    if (motion.isSwipingRight && motion.velocity.speed > 0.08 && motion.velocity.x > 0.05 && !motion.isWaving) {
      results.push({ id: 'SPACE', confidence: 0.98, reason: 'Space (Swipe Right)' });
    }

    // 17. HAND BACKSPACE (Swipe Left in Gestures mode)
    if (motion.isSwipingLeft && motion.velocity.speed > 0.08 && motion.velocity.x < -0.05 && !motion.isWaving) {
      results.push({ id: 'BACKSPACE', confidence: 0.98, reason: 'Backspace (Swipe Left)' });
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

    // Fast-path for dynamic swipe gestures (SPACE, BACKSPACE, ASL_J, ASL_Z, EMERGENCY)
    if (signId === 'SPACE' || signId === 'BACKSPACE' || signId === 'ASL_J' || signId === 'ASL_Z' || signId === 'EMERGENCY') {
      if (confidence >= 0.75) {
        return {
          stableSign: signId,
          confidence,
          isStable: true
        };
      }
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
    const cooldown = (signId === 'SPACE' || signId === 'BACKSPACE') ? 550 : this.commitCooldownMs;
    if (signId === this.lastCommittedSign && (now - this.lastCommitTime) < cooldown) {
      return false;
    }
    this.lastCommittedSign = signId;
    this.lastCommitTime = now;
    return true;
  }
}
