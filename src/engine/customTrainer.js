/**
 * Custom Gesture Trainer & Calibrator
 * Allows users and counter personnel to train custom sign variations
 * and calibrate sensitivity thresholds directly in-browser.
 */

import { cosineSimilarity } from './mathUtils.js';

const STORAGE_KEY = 'signbridge_custom_gestures_v1';

export class CustomTrainer {
  constructor() {
    this.customGestures = this._loadFromStorage();
    this.recordingSession = null;
  }

  _loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not load custom gestures from localStorage', e);
      return [];
    }
  }

  _saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.customGestures));
    } catch (e) {
      console.error('Failed to save custom gestures', e);
    }
  }

  hasCustomGestures() {
    return this.customGestures.length > 0;
  }

  getGestures() {
    return [...this.customGestures];
  }

  /**
   * Start recording a new custom gesture (samples multiple frames for stability)
   */
  startRecording(signId, name, spokenText, category = 'custom') {
    this.recordingSession = {
      signId,
      name,
      spokenText,
      category,
      samples: [],
      startTime: performance.now(),
      targetSampleCount: 20
    };
    return this.recordingSession;
  }

  /**
   * Feed a frame feature vector to active recording session
   */
  addSample(featureVector) {
    if (!this.recordingSession || !featureVector) return null;

    this.recordingSession.samples.push(featureVector);
    const progress = Math.min(100, Math.round((this.recordingSession.samples.length / this.recordingSession.targetSampleCount) * 100));

    if (this.recordingSession.samples.length >= this.recordingSession.targetSampleCount) {
      return this.finalizeRecording();
    }

    return { progress, isComplete: false };
  }

  /**
   * Finalize recording by computing mean centroid vector
   */
  finalizeRecording() {
    if (!this.recordingSession || this.recordingSession.samples.length === 0) return null;

    const { signId, name, spokenText, category, samples } = this.recordingSession;
    const vectorLength = samples[0].length;
    const centroidVector = new Array(vectorLength).fill(0);

    // Compute mean vector
    for (const sample of samples) {
      for (let i = 0; i < vectorLength; i++) {
        centroidVector[i] += sample[i];
      }
    }
    for (let i = 0; i < vectorLength; i++) {
      centroidVector[i] /= samples.length;
    }

    const newGesture = {
      id: signId || `CUSTOM_${Date.now()}`,
      name: name || 'Custom Gesture',
      spokenText: spokenText || name,
      category,
      featureVector: centroidVector,
      sampleCount: samples.length,
      createdAt: new Date().toISOString()
    };

    // Remove existing if matching ID, then add
    this.customGestures = this.customGestures.filter(g => g.id !== newGesture.id);
    this.customGestures.push(newGesture);
    this._saveToStorage();

    this.recordingSession = null;
    return { progress: 100, isComplete: true, gesture: newGesture };
  }

  cancelRecording() {
    this.recordingSession = null;
  }

  /**
   * Delete a custom gesture
   */
  deleteGesture(id) {
    this.customGestures = this.customGestures.filter(g => g.id !== id);
    this._saveToStorage();
  }

  /**
   * Classify feature vector against custom trained gestures
   */
  classifyCustom(featureVector) {
    if (!featureVector || this.customGestures.length === 0) return null;

    let bestMatch = null;
    let highestSim = 0;

    for (const gesture of this.customGestures) {
      const sim = cosineSimilarity(featureVector, gesture.featureVector);
      if (sim > highestSim) {
        highestSim = sim;
        bestMatch = {
          signId: gesture.id,
          name: gesture.name,
          spokenText: gesture.spokenText,
          category: gesture.category,
          confidence: sim,
          isCustom: true
        };
      }
    }

    return bestMatch;
  }
}
