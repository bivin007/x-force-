/**
 * SignBridge Counter - Main Application Entrypoint
 * Orchestrates 4-Stage AI Pipeline: Sign Recognition ➔ Sentence Formation AI ➔ Multilingual Translation ➔ Voice TTS,
 * along with ASL Alphabet Fingerspelling, Dataset Video Stream Evaluator, Scenarios, and Transcripts.
 */

import './style.css';
import { renderAppLayout } from './ui/appUI.js';
import { HandDetector, VIDEO_PRESETS, LIGHTING_MODES } from './engine/handDetector.js';
import { FeatureExtractor } from './engine/featureExtractor.js';
import { GestureClassifier } from './engine/gestureClassifier.js';
import { SentenceFormer } from './engine/sentenceFormer.js';
import { TranslatorEngine, SUPPORTED_LANGUAGES } from './engine/translatorEngine.js';
import { CustomTrainer } from './engine/customTrainer.js';
import { TTSEngine } from './audio/ttsEngine.js';
import { STTEngine } from './audio/sttEngine.js';
import { AudioVisualizer } from './audio/audioVisualizer.js';
import { SignVisualizer } from './avatar/signVisualizer.js';
import { ScenarioManager } from './scenarios/scenarioManager.js';
import { DictionaryView } from './dictionary/dictionaryView.js';
import { TranscriptManager } from './transcript/transcriptManager.js';
import { StressTestLab } from './lab/stressTestLab.js';
import { VOCABULARY } from './data/vocabulary.js';

class App {
  constructor() {
    this.root = document.getElementById('app');
    renderAppLayout(this.root);

    // Core AI & Pipeline Instances
    this.customTrainer = new CustomTrainer();
    this.featureExtractor = new FeatureExtractor();
    this.gestureClassifier = new GestureClassifier(this.customTrainer);
    this.sentenceFormer = new SentenceFormer();
    this.translator = new TranslatorEngine();
    this.tts = new TTSEngine();

    // DOM Elements
    this.videoEl = document.getElementById('webcam-video');
    this.canvasEl = document.getElementById('landmark-canvas');
    this.prompterContainer = document.getElementById('prompter-section');
    this.transcriptContainer = document.getElementById('transcript-container');
    this.dictModalBody = document.getElementById('dict-view-wrapper');
    this.waveformCanvas = document.getElementById('tts-audio-waveform');
    this.spelledTextEl = document.getElementById('composer-spelled-text');

    // Visualizers & Sub-Managers
    this.audioVis = new AudioVisualizer(this.waveformCanvas);
    this.signVis = new SignVisualizer(this.prompterContainer);
    this.transcript = new TranscriptManager(this.transcriptContainer);

    this.scenarioManager = new ScenarioManager(
      (scenario) => this.onScenarioChanged(scenario),
      (simStep) => this.onSimulationStep(simStep)
    );

    this.dictionaryView = new DictionaryView(
      this.dictModalBody,
      (signId) => this.onPracticeSignRequested(signId),
      (videoPath, signId) => this.onStreamVideoRequested(videoPath, signId)
    );

    this.handDetector = new HandDetector(
      this.videoEl,
      this.canvasEl,
      (results) => this.onVisionResults(results)
    );

    this.stressLab = new StressTestLab(
      this.handDetector,
      (benchmarkSummary) => this.onBenchmarkFinished(benchmarkSummary)
    );

    this.stt = new STTEngine(
      (transcriptData) => this.onStaffSpeechHeard(transcriptData),
      (matchedSign) => this.onStaffSignMatched(matchedSign)
    );

    // State Tracking
    this.composedWord = '';
    this.lastSpelledLetter = null;
    this.lastLetterTimestamp = 0;
    this.lastSpokenText = '';
    this.lastFormedSentence = 'I have a fever and need a medical checkup.';
    this.lastTranslatedResult = null;
    this.isRecordingCustom = false;

    this.init();
  }

  init() {
    this.signVis.clear();
    this.dictionaryView.render();
    this.updateQuickReplies();
    this.bindEvents();

    // Wire Stage 2 & 3 Pipeline Engine Callbacks
    this.sentenceFormer.onTokensUpdated = (tokens) => {
      this.renderTokenChips(tokens);
      this.highlightPipelineStage(1);
    };

    this.sentenceFormer.onSentenceFormed = (result) => {
      this.handleSentenceFormed(result);
    };

    // Initial default translation sync
    this.updateTranslationUI(this.lastFormedSentence, false);

    this.tts.onStateChange = ({ isSpeaking }) => {
      if (isSpeaking) {
        this.audioVis.start('#38bdf8');
      } else {
        this.audioVis.stop();
      }
    };

    setTimeout(() => {
      this.handDetector.startSimulatedMode('HELLO');
      this.updateHudMetrics(18, 30, 1);
    }, 400);
  }

  /**
   * Main vision results callback triggered every frame (~30-60 FPS)
   */
  onVisionResults(results) {
    const { multiHandLandmarks, multiHandedness, latencyMs, fps, isCameraActive } = results;

    this.updateHudMetrics(latencyMs, fps, multiHandLandmarks.length);

    if (multiHandLandmarks.length === 0) {
      this.featureExtractor.resetHistory();
      this.lastSpelledLetter = null;
      this.updateRecognitionCard(null, 0, [], { thumb: 'FOLDED', index: 'FOLDED', middle: 'FOLDED', ring: 'FOLDED', pinky: 'FOLDED' });
      return;
    }

    const extracted = this.featureExtractor.extractFeatures(multiHandLandmarks, multiHandedness);
    const motion = this.featureExtractor.analyzeMotion(extracted.hands[0]?.label || 'Right', isCameraActive);

    if (this.isRecordingCustom && extracted.hands.length > 0) {
      const recResult = this.customTrainer.addSample(extracted.hands[0].featureVector);
      this.updateCustomTrainerProgress(recResult);
    }

    const classification = this.gestureClassifier.classify(extracted, motion);

    this.updateRecognitionCard(
      classification.bestMatch,
      classification.confidence,
      classification.topMatches,
      classification.fingerStates,
      classification.isStable
    );

    // If stable and confident
    if (classification.isStable && classification.bestMatch && classification.confidence >= 50) {
      const sign = classification.bestMatch;

      // Handle Real-Time Hand Space & Backspace Gestures
      if (sign.id === 'SPACE') {
        if (this.gestureClassifier.canTriggerCommit('SPACE')) {
          this.triggerHandSpace();
        }
        return;
      }

      if (sign.id === 'BACKSPACE') {
        if (this.gestureClassifier.canTriggerCommit('BACKSPACE')) {
          this.triggerHandBackspace();
        }
        return;
      }

      const isLetter = sign.category === 'asl_alphabet' || Boolean(sign.letter);

      if (isLetter) {
        // ASL Letter fingerspelling handling
        const now = performance.now();
        if (sign.letter !== this.lastSpelledLetter || (now - this.lastLetterTimestamp) > 650) {
          this.appendSpelledLetter(sign.letter || sign.spokenText);
          this.lastSpelledLetter = sign.letter;
          this.lastLetterTimestamp = now;

          if (this.practicingSignId === sign.id) {
            this.dictionaryView.triggerSuccessCelebration();
            this.practicingSignId = null;
          }
        }
      } else {
        // Conversational phrase gesture handling
        if (this.gestureClassifier.canTriggerCommit(sign.id)) {
          this.lastSpokenText = sign.spokenText;
          
          // STAGE 1: Feed recognized sign concept to SentenceFormer buffer
          this.sentenceFormer.addToken(sign.id, sign.name);

          if (this.practicingSignId === sign.id) {
            this.dictionaryView.triggerSuccessCelebration();
            this.practicingSignId = null;
          }
        }
      }
    }
  }

  triggerHandSpace() {
    this.composedWord += ' ';
    this.lastSpelledLetter = null;
    this.updateComposerDisplay();
    this.flashComposerButton('btn-composer-space');
    this.showGestureToast('␣ Space Added with Hand', '#38bdf8');
  }

  triggerHandBackspace() {
    if (this.composedWord.length > 0) {
      this.composedWord = this.composedWord.slice(0, -1);
      this.updateComposerDisplay();
    } else if (this.sentenceFormer.tokens && this.sentenceFormer.tokens.length > 0) {
      this.sentenceFormer.removeToken(this.sentenceFormer.tokens.length - 1);
    }
    this.lastSpelledLetter = null;
    this.flashComposerButton('btn-composer-backspace');
    this.showGestureToast('⌫ Backspace with Hand', '#f43f5e');
  }

  flashComposerButton(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.remove('gesture-active-flash');
    void btn.offsetWidth; // Force DOM reflow
    btn.classList.add('gesture-active-flash');
    setTimeout(() => {
      btn.classList.remove('gesture-active-flash');
    }, 450);
  }

  showGestureToast(text, color = '#38bdf8') {
    let toast = document.getElementById('hud-gesture-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'hud-gesture-toast';
      toast.className = 'hud-gesture-toast';
      const container = document.getElementById('video-container') || document.body;
      container.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.borderColor = color;
    toast.classList.remove('hidden', 'fade-out');
    toast.classList.add('visible');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.classList.remove('visible', 'fade-out'), 300);
    }, 1200);
  }

  appendSpelledLetter(letter) {
    if (!letter) return;
    this.composedWord += letter;
    this.updateComposerDisplay();
  }

  updateComposerDisplay() {
    if (!this.spelledTextEl) return;
    if (this.composedWord.length > 0) {
      this.spelledTextEl.textContent = this.composedWord;
      this.spelledTextEl.classList.remove('spelled-text-placeholder');
    } else {
      this.spelledTextEl.textContent = 'Fingerspell letters (A-Z) to build words here...';
      this.spelledTextEl.classList.add('spelled-text-placeholder');
    }
  }

  updateHudMetrics(latency, fps, handCount) {
    const latEl = document.getElementById('hud-latency');
    const fpsEl = document.getElementById('hud-fps');
    const handEl = document.getElementById('hud-hands');

    if (latEl) latEl.textContent = `${latency} ms`;
    if (fpsEl) fpsEl.textContent = `${fps} FPS`;
    if (handEl) handEl.textContent = `${handCount}`;
  }

  updateRecognitionCard(bestMatch, confidence, topMatches, fingerStates, isStable) {
    const nameEl = document.getElementById('active-sign-name');
    const spokenEl = document.getElementById('active-spoken-text');
    const confValEl = document.getElementById('confidence-val');
    const confBarEl = document.getElementById('confidence-bar');
    const topListEl = document.getElementById('top-predictions-list');
    const fingerDots = document.getElementById('finger-indicators');

    if (bestMatch && confidence > 35) {
      const isLetter = bestMatch.category === 'asl_alphabet' || Boolean(bestMatch.letter);
      if (nameEl) nameEl.textContent = isLetter ? `ASL Letter "${bestMatch.letter || bestMatch.spokenText}"` : `${bestMatch.name} (${bestMatch.category.toUpperCase()})`;
      if (spokenEl) spokenEl.textContent = `"${bestMatch.spokenText}"`;
      if (confValEl) confValEl.textContent = `${confidence}%`;
      if (confBarEl) confBarEl.style.width = `${confidence}%`;
    } else {
      if (nameEl) nameEl.textContent = 'Scanning for Gestures or ASL Letters...';
      if (spokenEl) spokenEl.textContent = '"Hold your hand in camera view to sign phrases or fingerspell."';
      if (confValEl) confValEl.textContent = '0%';
      if (confBarEl) confBarEl.style.width = '0%';
    }

    if (topListEl) {
      if (topMatches && topMatches.length > 0) {
        topListEl.innerHTML = topMatches.map(m => `
          <span class="pred-item">${m.letter || m.name.split('/')[0]}: <strong>${m.confidence}%</strong></span>
        `).join('');
      } else {
        topListEl.innerHTML = '<span class="pred-item muted">Standby</span>';
      }
    }

    if (fingerDots && fingerStates) {
      const dots = fingerDots.querySelectorAll('.finger-dot');
      const states = [fingerStates.thumb, fingerStates.index, fingerStates.middle, fingerStates.ring, fingerStates.pinky];
      dots.forEach((d, i) => {
        if (states[i] === 'OPEN') {
          d.classList.add('active');
        } else {
          d.classList.remove('active');
        }
      });
    }
  }

  onStaffSpeechHeard({ text, isFinal }) {
    const input = document.getElementById('staff-text-input');
    if (input) input.value = text;

    if (isFinal && text.trim().length > 0) {
      this.transcript.addEntry({
        speaker: 'Staff',
        text: text
      });
      document.getElementById('transcript-count').textContent = `${this.transcript.getEntries().length} turns`;
    }
  }

  onStaffSignMatched(sign) {
    this.signVis.displaySignPrompt(sign);
  }

  updateQuickReplies() {
    const container = document.getElementById('quick-replies-pills');
    const nameEl = document.getElementById('quick-scenario-name');
    const scenario = this.scenarioManager.getActiveScenario();

    if (nameEl) nameEl.textContent = scenario.name.split(' ')[0];
    if (!container) return;

    const replies = this.scenarioManager.getQuickReplies();
    container.innerHTML = replies.map(r => `
      <button class="quick-pill-btn" data-sign-id="${r.signId}" data-text="${r.text}">
        ${r.text.length > 35 ? r.text.substring(0, 35) + '...' : r.text}
      </button>
    `).join('');
  }

  onScenarioChanged(scenario) {
    const btns = document.querySelectorAll('.scenario-btn');
    btns.forEach(b => {
      b.classList.toggle('active', b.dataset.scenario === scenario.id);
    });

    this.updateQuickReplies();
    this.signVis.clear();
  }

  onSimulationStep(step) {
    if (step.sender === 'customer') {
      this.handDetector.setSimulatedSign(step.signId);
      const signInfo = VOCABULARY.find(v => v.id === step.signId);

      this.tts.speak(step.text, true);

      this.transcript.addEntry({
        speaker: 'Customer',
        text: step.text,
        signId: signInfo ? signInfo.name : step.signId,
        confidence: 96
      });
    } else {
      this.transcript.addEntry({
        speaker: 'Staff',
        text: step.text
      });

      if (step.signId) {
        this.signVis.displaySignPrompt(step.signId, step.text);
      }
    }

    document.getElementById('transcript-count').textContent = `${this.transcript.getEntries().length} turns`;
  }

  onPracticeSignRequested(signId) {
    this.practicingSignId = signId;
    this.handDetector.setSimulatedSign(signId);
    document.getElementById('modal-dictionary')?.classList.add('hidden');
  }

  async onStreamVideoRequested(videoPath, signId = null) {
    document.getElementById('modal-dictionary')?.classList.add('hidden');

    const sign = VOCABULARY.find(v => v.id === signId || v.videoPath === videoPath);
    const targetSignId = sign ? sign.id : (signId || 'HELLO');
    this.activeStreamSignId = targetSignId;

    const select = document.getElementById('select-dataset-video');
    if (select && videoPath) {
      select.value = videoPath;
    }

    const camBtn = document.getElementById('btn-camera-toggle');
    const camText = document.getElementById('camera-btn-text');
    if (camBtn) camBtn.classList.add('active');
    if (camText) camText.textContent = 'Stop Stream';

    const modeBadge = document.getElementById('recog-mode-badge');
    if (modeBadge) {
      modeBadge.textContent = `DATASET STREAM: ${sign ? sign.name : targetSignId}`;
    }

    // Show Dataset Stream Controls Ribbon
    const streamControls = document.getElementById('dataset-stream-controls');
    const streamTitle = document.getElementById('stream-playing-title');
    const streamSub = document.getElementById('stream-playing-sub');
    if (streamControls) streamControls.style.display = 'flex';
    if (streamTitle) streamTitle.textContent = `Playing: ${sign ? sign.name : targetSignId}`;
    if (streamSub) streamSub.textContent = `${sign ? sign.category.toUpperCase() : 'DATASET'} • 61-Class Video Dataset Stream`;

    await this.handDetector.playDatasetVideo(videoPath, targetSignId);

    if (sign) {
      this.transcript.addEntry({
        speaker: 'System',
        text: `🎬 Started 61-Class Dataset Video Stream: "${sign.name}" (${sign.category.toUpperCase()}). Inference pipeline active.`
      });
      document.getElementById('transcript-count').textContent = `${this.transcript.getEntries().length} turns`;
    }
  }

  bindEvents() {
    // 61-Class Dataset Video Stream Evaluator
    document.getElementById('btn-play-dataset-video')?.addEventListener('click', async () => {
      const select = document.getElementById('select-dataset-video');
      if (!select) return;
      const videoPath = select.value;
      const selectedOption = select.options[select.selectedIndex];
      const signId = selectedOption?.dataset?.signId;
      await this.onStreamVideoRequested(videoPath, signId);
    });

    document.getElementById('select-dataset-video')?.addEventListener('change', async (e) => {
      const videoPath = e.target.value;
      const selectedOption = e.target.options[e.target.selectedIndex];
      const signId = selectedOption?.dataset?.signId;
      await this.onStreamVideoRequested(videoPath, signId);
    });

    // Dataset Details Inspector Button (from subheader)
    document.getElementById('btn-view-dataset-info')?.addEventListener('click', () => {
      const select = document.getElementById('select-dataset-video');
      const selectedOption = select?.options[select?.selectedIndex];
      const signId = selectedOption?.dataset?.signId || this.activeStreamSignId || 'HELLO';
      document.getElementById('modal-dictionary')?.classList.remove('hidden');
      this.dictionaryView.openSignDetail(signId);
    });

    // Dataset Details Button (from stream ribbon)
    document.getElementById('btn-stream-details-quick')?.addEventListener('click', () => {
      const signId = this.activeStreamSignId || 'HELLO';
      document.getElementById('modal-dictionary')?.classList.remove('hidden');
      this.dictionaryView.openSignDetail(signId);
    });

    // Stream Ribbon Previous / Next Video
    document.getElementById('btn-stream-prev')?.addEventListener('click', () => {
      const select = document.getElementById('select-dataset-video');
      if (!select) return;
      const newIndex = (select.selectedIndex - 1 + select.options.length) % select.options.length;
      select.selectedIndex = newIndex;
      const option = select.options[newIndex];
      this.onStreamVideoRequested(option.value, option.dataset.signId);
    });

    document.getElementById('btn-stream-next')?.addEventListener('click', () => {
      const select = document.getElementById('select-dataset-video');
      if (!select) return;
      const newIndex = (select.selectedIndex + 1) % select.options.length;
      select.selectedIndex = newIndex;
      const option = select.options[newIndex];
      this.onStreamVideoRequested(option.value, option.dataset.signId);
    });

    // Stream Ribbon Pause / Resume
    const pauseBtn = document.getElementById('btn-stream-pause');
    pauseBtn?.addEventListener('click', () => {
      if (this.videoEl.paused) {
        this.videoEl.play();
        pauseBtn.textContent = '⏸ Pause';
      } else {
        this.videoEl.pause();
        pauseBtn.textContent = '▶ Play';
      }
    });

    // Stream Ribbon Speed Pills
    document.querySelectorAll('.btn-stream-spd').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-stream-spd').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const spd = parseFloat(e.currentTarget.dataset.spd);
        this.videoEl.playbackRate = spd;
      });
    });

    // Custom Video File Upload (Video_Dataset test clips)
    document.getElementById('input-custom-video-file')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const camBtn = document.getElementById('btn-camera-toggle');
      const camText = document.getElementById('camera-btn-text');
      if (camBtn) camBtn.classList.add('active');
      if (camText) camText.textContent = 'Stop Stream';

      const modeBadge = document.getElementById('recog-mode-badge');
      if (modeBadge) {
        modeBadge.textContent = `CUSTOM VIDEO: ${file.name.substring(0, 24)}`;
      }

      const streamControls = document.getElementById('dataset-stream-controls');
      const streamTitle = document.getElementById('stream-playing-title');
      const streamSub = document.getElementById('stream-playing-sub');
      if (streamControls) streamControls.style.display = 'flex';
      if (streamTitle) streamTitle.textContent = `Playing: ${file.name}`;
      if (streamSub) streamSub.textContent = `User Uploaded MP4 (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

      this.transcript.addEntry({
        speaker: 'System',
        text: `📁 Loaded Video File: "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB). Running real-time inference...`
      });
      document.getElementById('transcript-count').textContent = `${this.transcript.getEntries().length} turns`;

      await this.handDetector.playUploadedVideo(file);
    });

    // Mode toggles (Unified / ASL Alphabet / Gestures)
    const modeBtns = document.querySelectorAll('.mode-btn');
    const modeBadge = document.getElementById('recog-mode-badge');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        modeBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const mode = e.currentTarget.dataset.mode;
        this.gestureClassifier.setMode(mode);

        if (modeBadge) {
          if (mode === 'ASL_ALPHABET') modeBadge.textContent = 'LIVE ASL FINGERSPELLING (A-Z)';
          else if (mode === 'GESTURES') modeBadge.textContent = 'LIVE SERVICE GESTURES ONLY';
          else modeBadge.textContent = 'LIVE ASL & GESTURE INFERENCE';
        }
      });
    });

    // ASL Word Composer Actions
    document.getElementById('btn-composer-space')?.addEventListener('click', () => {
      this.composedWord += ' ';
      this.updateComposerDisplay();
    });

    document.getElementById('btn-composer-backspace')?.addEventListener('click', () => {
      this.composedWord = this.composedWord.slice(0, -1);
      this.updateComposerDisplay();
    });

    document.getElementById('btn-composer-clear')?.addEventListener('click', () => {
      this.composedWord = '';
      this.updateComposerDisplay();
    });

    document.getElementById('btn-composer-speak')?.addEventListener('click', () => {
      if (this.composedWord.trim().length > 0) {
        this.tts.speak(this.composedWord, true);
        this.transcript.addEntry({
          speaker: 'Customer',
          text: `[Fingerspelled] ${this.composedWord}`,
          signId: 'ASL Fingerspelling',
          confidence: 98
        });
        document.getElementById('transcript-count').textContent = `${this.transcript.getEntries().length} turns`;
      }
    });

    // Camera toggle
    const camBtn = document.getElementById('btn-camera-toggle');
    const camText = document.getElementById('camera-btn-text');
    if (camBtn) {
      camBtn.addEventListener('click', async () => {
        if (this.handDetector.isCameraActive) {
          this.handDetector.stopCamera();
          camBtn.classList.remove('active');
          camText.textContent = 'Start Camera';
          this.handDetector.startSimulatedMode('HELLO');
        } else {
          const res = await this.handDetector.startCamera();
          if (res.success) {
            camBtn.classList.add('active');
            camText.textContent = 'Stop Camera';
          }
        }
      });
    }

    // Virtual Sign cycle button
    const simBtn = document.getElementById('btn-synthetic-toggle');
    if (simBtn) {
      let simIndex = 0;
      simBtn.addEventListener('click', () => {
        simIndex = (simIndex + 1) % VOCABULARY.length;
        const targetSign = VOCABULARY[simIndex];
        this.handDetector.setSimulatedSign(targetSign.id);
      });
    }

    // Environment, Lighting & Facial Emotion Selectors
    document.getElementById('select-bg-preset')?.addEventListener('change', (e) => {
      this.handDetector.setBackgroundPreset(e.target.value);
    });

    document.getElementById('select-light-preset')?.addEventListener('change', (e) => {
      this.handDetector.setLightingMode(e.target.value);
    });

    // Scenario buttons
    document.querySelectorAll('.scenario-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sid = e.currentTarget.dataset.scenario;
        this.scenarioManager.setScenario(sid);
      });
    });

    // Run Simulation
    document.getElementById('btn-run-simulation')?.addEventListener('click', () => {
      this.scenarioManager.startSimulation();
    });

    // TTS Toggle
    const audioBtn = document.getElementById('btn-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const next = !this.tts.autoSpeak;
        this.tts.toggleAutoSpeak(next);
        audioBtn.classList.toggle('active', next);
        audioBtn.querySelector('span').textContent = next ? 'Auto-Speak (TTS Active)' : 'TTS Muted';
      });
    }

    // Replay Voice
    document.getElementById('btn-replay-tts')?.addEventListener('click', () => {
      if (this.lastSpokenText) {
        this.tts.speak(this.lastSpokenText, true);
      }
    });

    // Staff Mic STT
    const micBtn = document.getElementById('btn-staff-mic');
    const micStatus = document.getElementById('stt-status-indicator');
    const micLabel = document.getElementById('mic-btn-label');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        const isNowListening = this.stt.toggleListening();
        micBtn.classList.toggle('listening', isNowListening);
        if (micLabel) micLabel.textContent = isNowListening ? 'Listening...' : 'Speak (STT)';
        if (micStatus) {
          micStatus.textContent = isNowListening ? 'Mic Active' : 'Mic Ready';
          micStatus.className = isNowListening ? 'stt-listening-badge' : 'stt-idle-badge';
        }
        if (isNowListening) {
          this.audioVis.start('#10b981');
        } else {
          this.audioVis.stop();
        }
      });
    }

    // Staff Text Input
    const staffInput = document.getElementById('staff-text-input');
    const sendBtn = document.getElementById('btn-send-staff-text');
    const handleSendStaffText = () => {
      const text = staffInput.value.trim();
      if (!text) return;
      this.stt.processManualStaffInput(text);
      staffInput.value = '';
    };

    if (sendBtn) sendBtn.addEventListener('click', handleSendStaffText);
    if (staffInput) {
      staffInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSendStaffText();
      });
    }

    // Quick Replies Click
    document.getElementById('quick-replies-pills')?.addEventListener('click', (e) => {
      const pill = e.target.closest('.quick-pill-btn');
      if (pill) {
        const text = pill.dataset.text;
        const signId = pill.dataset.signId;
        this.transcript.addEntry({ speaker: 'Staff', text });
        document.getElementById('transcript-count').textContent = `${this.transcript.getEntries().length} turns`;
        if (signId) {
          this.signVis.displaySignPrompt(signId, text);
        }
      }
    });

    // Transcript Exports
    document.getElementById('btn-export-receipt')?.addEventListener('click', () => {
      this.transcript.printReceipt(this.scenarioManager.getActiveScenario().name);
    });

    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      this.transcript.exportJSON();
    });

    document.getElementById('btn-clear-transcript')?.addEventListener('click', () => {
      this.transcript.clear();
      document.getElementById('transcript-count').textContent = '0 turns';
    });

    // Modals open / close
    document.getElementById('btn-open-dict')?.addEventListener('click', () => {
      document.getElementById('modal-dictionary')?.classList.remove('hidden');
    });

    document.getElementById('btn-open-lab')?.addEventListener('click', () => {
      document.getElementById('modal-lab')?.classList.remove('hidden');
    });

    document.getElementById('btn-open-trainer')?.addEventListener('click', () => {
      document.getElementById('modal-custom-trainer')?.classList.remove('hidden');
    });

    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.dataset.close;
        document.getElementById(targetId)?.classList.add('hidden');
      });
    });

    // Benchmark Run
    document.getElementById('btn-start-benchmark')?.addEventListener('click', async () => {
      const progBox = document.getElementById('benchmark-progress-box');
      const resBox = document.getElementById('benchmark-results-box');
      const stageTitle = document.getElementById('bench-stage-title');
      const barFill = document.getElementById('bench-bar-fill');
      const percentEl = document.getElementById('bench-percent');

      progBox.classList.remove('hidden');
      resBox.classList.add('hidden');

      await this.stressLab.runAutomatedBenchmark((progress) => {
        if (stageTitle) stageTitle.textContent = `Stage ${progress.step}/${progress.total}: ${progress.name}`;
        if (barFill) barFill.style.width = `${progress.percent}%`;
        if (percentEl) percentEl.textContent = `${progress.percent}%`;
      });
    });

    // Theme Toggle
    document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
      document.body.classList.toggle('theme-high-contrast');
    });

    // Custom Trainer Record button
    document.getElementById('btn-record-custom-gesture')?.addEventListener('click', () => {
      const name = document.getElementById('custom-sign-name')?.value || 'Custom Sign';
      const text = document.getElementById('custom-sign-text')?.value || name;
      const feedback = document.getElementById('custom-record-feedback');

      if (feedback) {
        feedback.classList.remove('hidden');
        feedback.textContent = 'Sampling 20 frames... Hold hand steady!';
      }

      this.customTrainer.startRecording(`CUSTOM_${Date.now()}`, name, text);
      this.isRecordingCustom = true;
    });

    // 4-Stage AI Pipeline Controls
    document.getElementById('btn-clear-tokens')?.addEventListener('click', () => {
      this.sentenceFormer.clear();
    });

    document.getElementById('btn-generate-sentence')?.addEventListener('click', () => {
      this.sentenceFormer.forceCommit();
    });

    document.getElementById('toggle-auto-sentence')?.addEventListener('change', (e) => {
      this.sentenceFormer.setAutoCommit(e.target.checked);
    });

    // Quick Concept Tokens
    document.querySelectorAll('.btn-quick-token').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const token = e.currentTarget.dataset.token;
        if (token) {
          this.sentenceFormer.addToken(token);
        }
      });
    });

    // Multilingual Target Language Pills
    document.querySelectorAll('.lang-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const lang = e.currentTarget.dataset.lang;
        document.querySelectorAll('.lang-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.translator.setTargetLanguage(lang);
        if (this.lastFormedSentence) {
          this.updateTranslationUI(this.lastFormedSentence, false);
        }
      });
    });

    // Speak Translated Sentence (Stage 4 CTA)
    document.getElementById('btn-speak-translation')?.addEventListener('click', () => {
      this.speakTranslatedSentence();
    });

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        document.getElementById('btn-camera-toggle')?.click();
      } else if (e.key === 'm' || e.key === 'M') {
        document.getElementById('btn-staff-mic')?.click();
      } else if (e.key === 'd' || e.key === 'D') {
        document.getElementById('btn-run-simulation')?.click();
      }
    });
  }

  /* ==========================================================================
     4-STAGE PIPELINE UI & EXECUTION METHODS
     ========================================================================== */

  highlightPipelineStage(stageNum) {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`pipe-step-${i}`);
      if (el) {
        if (i === stageNum) {
          el.classList.add('active');
          el.classList.add('processing');
          setTimeout(() => el?.classList.remove('processing'), 1200);
        } else if (i < stageNum) {
          el.classList.add('active');
          el.classList.remove('processing');
        } else {
          el.classList.remove('active');
          el.classList.remove('processing');
        }
      }
    }
  }

  renderTokenChips(tokens) {
    const container = document.getElementById('token-chips-container');
    if (!container) return;

    if (!tokens || tokens.length === 0) {
      container.innerHTML = '<span class="token-chip-placeholder">Recognized gesture signs will buffer here (e.g. [I] + [FEVER])...</span>';
      return;
    }

    container.innerHTML = tokens.map((t, idx) => `
      <span class="token-chip ${idx === tokens.length - 1 ? 'newly-added' : ''}">
        <span class="token-chip-text">${t.label || t.id}</span>
        <button class="token-chip-delete" data-token-idx="${idx}" title="Remove token">&times;</button>
      </span>
    `).join('');

    // Bind delete clicks
    container.querySelectorAll('.token-chip-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset.tokenIdx, 10);
        this.sentenceFormer.removeToken(index);
      });
    });
  }

  handleSentenceFormed(result) {
    const { sentence, confidence, category } = result;
    this.lastFormedSentence = sentence;

    this.highlightPipelineStage(2);

    const sentenceEl = document.getElementById('formed-sentence-text');
    const badgeEl = document.getElementById('grammar-confidence-badge');
    if (sentenceEl) sentenceEl.textContent = `"${sentence}"`;
    if (badgeEl) {
      badgeEl.textContent = `${Math.round(confidence)}% Match (${category ? category.toUpperCase() : 'GRAMMAR'})`;
    }

    // Pass formed English sentence to Stage 3 Multilingual Translation
    this.updateTranslationUI(sentence, true);
  }

  updateTranslationUI(englishSentence, shouldAutoSpeak = false) {
    if (!englishSentence) return;
    this.highlightPipelineStage(3);

    const targetLang = this.translator.getCurrentLanguage();
    const translated = this.translator.translate(englishSentence);
    this.lastTranslatedResult = translated;

    const targetLangLabel = document.getElementById('target-lang-label');
    const translatedTextEl = document.getElementById('translated-output-text');
    const speakLangName = document.getElementById('btn-speak-lang-name');

    if (targetLangLabel) {
      targetLangLabel.textContent = `${targetLang.name} (${targetLang.native} • ${targetLang.langTag}):`;
    }
    if (translatedTextEl) {
      translatedTextEl.textContent = `"${translated.translatedText}"`;
      translatedTextEl.setAttribute('lang', targetLang.code);
    }
    if (speakLangName) {
      speakLangName.textContent = targetLang.name;
    }

    // STAGE 4: Localized Voice Speech Output
    if (shouldAutoSpeak && this.tts.autoSpeak && translated.translatedText) {
      this.speakTranslatedSentence();
    }

    // Log to Dialogue Transcript
    this.transcript.addEntry({
      speaker: 'Customer',
      text: translated.translatedText,
      originalText: englishSentence,
      langName: targetLang.name,
      langNative: targetLang.native,
      signId: '4-Stage Pipeline',
      confidence: 96
    });
    const countEl = document.getElementById('transcript-count');
    if (countEl) countEl.textContent = `${this.transcript.getEntries().length} turns`;
  }

  speakTranslatedSentence() {
    if (!this.lastTranslatedResult) {
      if (this.lastFormedSentence) {
        this.lastTranslatedResult = this.translator.translate(this.lastFormedSentence);
      }
    }
    if (!this.lastTranslatedResult || !this.lastTranslatedResult.translatedText) return;

    this.highlightPipelineStage(4);
    const { translatedText, langTag } = this.lastTranslatedResult;
    this.tts.speak(translatedText, true, langTag);
  }

  updateCustomTrainerProgress(res) {
    if (!res) return;
    const feedback = document.getElementById('custom-record-feedback');
    if (!feedback) return;

    if (res.isComplete) {
      this.isRecordingCustom = false;
      feedback.textContent = `Successfully saved custom sign "${res.gesture.name}"! It is now active in recognition.`;
      setTimeout(() => {
        document.getElementById('modal-custom-trainer')?.classList.add('hidden');
      }, 1800);
    } else {
      feedback.textContent = `Recording... ${res.progress}%`;
    }
  }

  onBenchmarkFinished(summary) {
    const progBox = document.getElementById('benchmark-progress-box');
    const resBox = document.getElementById('benchmark-results-box');
    if (progBox) progBox.classList.add('hidden');
    if (!resBox) return;

    resBox.innerHTML = `
      <div class="benchmark-summary-card animate-fade-in">
        <h4 style="color: var(--accent-emerald); font-size: 1.1rem; margin-bottom: 8px;">
          ✓ Automated Robustness Benchmark Passed (Overall Score: ${summary.overallRobustnessScore})
        </h4>
        <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 12px;">
          Average Latency: <strong>${summary.averageLatencyMs} ms</strong> | Average FPS: <strong>${summary.averageFps} FPS</strong>
        </p>

        <table class="benchmark-table">
          <thead>
            <tr>
              <th>Condition</th>
              <th>Latency</th>
              <th>Stability</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${summary.results.map(r => `
              <tr>
                <td>${r.condition}</td>
                <td>${r.latencyMs} ms</td>
                <td>${r.landmarkStability}</td>
                <td><span class="pass-badge">${r.passStatus}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    resBox.classList.remove('hidden');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
