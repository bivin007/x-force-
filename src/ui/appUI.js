/**
 * SignBridge Counter - Main User Interface Generator
 * Builds the modular, accessible, state-of-the-art dual-screen interface
 * supporting Live Camera, 61-Video Dataset Stream Evaluator, ASL Alphabet,
 * and Public Service Sign Language.
 */

import { SIGN_CATEGORIES, VOCABULARY, SERVICE_SCENARIOS } from '../data/vocabulary.js';
import { VIDEO_DATASET_REGISTRY, DATASET_CATEGORIES } from '../data/videoDataset.js';

export function renderAppLayout(rootElement) {
  rootElement.innerHTML = `
    <div class="app-layout" id="app-layout">
      <!-- TOP NAVIGATION BAR -->
      <header class="app-header">
        <div class="header-brand">
          <div class="brand-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="logo-icon">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path>
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
            </svg>
          </div>
          <div>
            <div class="brand-title-row">
              <h1 class="brand-title">SignBridge Counter</h1>
              <span class="badge-version">61-Class Video Dataset</span>
            </div>
            <p class="brand-sub">Real-Time Sign Language Bridge & Dataset Video Stream Inference Engine</p>
          </div>
        </div>

        <!-- VIEW SWITCHER: DUAL-COUNTER DESK VS GESTURE-TO-SENTENCE STUDIO -->
        <div class="header-view-toggle">
          <div class="view-pill-group">
            <button class="view-tab-btn active" id="tab-btn-counter" data-view="counter" title="Public Service Counter Desk Dual-Screen Interface">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span>Service Counter Desk</span>
            </button>
            <button class="view-tab-btn" id="tab-btn-studio" data-view="studio" title="Interactive Gesture-to-Sentence Builder & AI Studio">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>Gesture-to-Sentence Studio</span>
              <span class="studio-tab-badge">STUDIO</span>
            </button>
          </div>
        </div>

        <!-- RECOGNITION MODE SELECTOR -->
        <div class="header-mode-toggle">
          <span class="mode-label">Mode:</span>
          <div class="mode-pill-group">
            <button class="mode-btn active" data-mode="HYBRID" title="Recognize both ASL Alphabet and Service Gestures">
              Unified (ASL + Gestures)
            </button>
            <button class="mode-btn" data-mode="ASL_ALPHABET" title="ASL Fingerspelling A-Z Word Composer">
              ASL Alphabet (A-Z)
            </button>
            <button class="mode-btn" data-mode="GESTURES" title="Public Service Gestures Only">
              Service Gestures
            </button>
          </div>
        </div>

        <!-- CONTROLS & THEME TOGGLE -->
        <div class="header-actions">
          <!-- Judge Demo Cheat Sheet & Gesture Guide -->
          <button id="btn-open-demo-guide" class="btn-action-guide" title="Open Gesture-to-Word Guide & Scripted Judge Demo Sequences">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>🎯 Demo Guide & Cheat Sheet</span>
            <span class="guide-badge-pulse">JUDGE DEMO</span>
          </button>

          <!-- Simulation / Demo Button -->
          <button id="btn-run-simulation" class="btn-action-highlight">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Live Demo Simulation</span>
          </button>

          <!-- Stress Test Lab Button -->
          <button id="btn-open-lab" class="btn-action-ghost" title="Robustness & Lighting Stress Test">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>
            <span>Stress Test Lab</span>
          </button>

          <!-- Dictionary & Video Dataset Button -->
          <button id="btn-open-dict" class="btn-action-ghost" title="Open ASL & Sign Video Dataset">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>Dictionary & Video Dataset (${VIDEO_DATASET_REGISTRY.length})</span>
          </button>

          <!-- Accessibility High Contrast Toggle -->
          <button id="btn-theme-toggle" class="btn-icon" title="Toggle High Contrast / Theme" aria-label="Toggle High Contrast Theme">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0 0 20z"></path></svg>
          </button>
        </div>
      </header>

      <!-- SUB-HEADER BAR: DATASET STREAM EVALUATOR & SCENARIOS -->
      <div class="sub-header-bar" id="sub-header-bar">
        <div class="dataset-stream-selector-wrap">
          <span class="stream-label">🎬 Dataset Video Stream Evaluator:</span>
          <select id="select-dataset-video" class="dataset-dropdown" aria-label="Select sample video from 61-class dataset">
            <optgroup label="Greetings & Social (Sample Videos)">
              ${VIDEO_DATASET_REGISTRY.filter(v => v.category === 'greetings').map(v => `<option value="${v.videoPath}" data-sign-id="${v.id}">${v.label}</option>`).join('')}
            </optgroup>
            <optgroup label="Health & Medical">
              ${VIDEO_DATASET_REGISTRY.filter(v => v.category === 'health').map(v => `<option value="${v.videoPath}" data-sign-id="${v.id}">${v.label}</option>`).join('')}
            </optgroup>
            <optgroup label="Public Desk & Daily Life">
              ${VIDEO_DATASET_REGISTRY.filter(v => v.category === 'services').map(v => `<option value="${v.videoPath}" data-sign-id="${v.id}">${v.label}</option>`).join('')}
            </optgroup>
            <optgroup label="Action Verbs">
              ${VIDEO_DATASET_REGISTRY.filter(v => v.category === 'actions').map(v => `<option value="${v.videoPath}" data-sign-id="${v.id}">${v.label}</option>`).join('')}
            </optgroup>
            <optgroup label="Food & Essentials">
              ${VIDEO_DATASET_REGISTRY.filter(v => v.category === 'food').map(v => `<option value="${v.videoPath}" data-sign-id="${v.id}">${v.label}</option>`).join('')}
            </optgroup>
            <optgroup label="Animals & Nature">
              ${VIDEO_DATASET_REGISTRY.filter(v => v.category === 'animals').map(v => `<option value="${v.videoPath}" data-sign-id="${v.id}">${v.label}</option>`).join('')}
            </optgroup>
          </select>

          <button id="btn-play-dataset-video" class="btn-dataset-play" title="Play and run real-time inference on this video clip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Play Video Stream
          </button>

          <button id="btn-view-dataset-info" class="btn-dataset-info" title="Inspect translation details, keywords, and joint kinematics for this video">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Dataset Info
          </button>

          <!-- Upload File Button -->
          <label class="btn-dataset-upload" title="Upload custom video from Video_Dataset folder">
            <input type="file" id="input-custom-video-file" accept="video/mp4,video/webm" style="display: none;" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Upload MP4
          </label>
        </div>

        <div class="scenario-bar-inner">
          <span class="scenario-bar-label">Public Desk:</span>
          <div class="scenario-pill-group">
            <button class="scenario-btn active" data-scenario="bank">Bank Teller</button>
            <button class="scenario-btn" data-scenario="hospital">Hospital Triage</button>
            <button class="scenario-btn" data-scenario="government">Civic Desk</button>
          </div>
        </div>
      </div>

      <!-- 4-STAGE PIPELINE FLOW VISUALIZER BANNER -->
      <div class="pipeline-flow-banner" id="pipeline-flow-banner">
        <div class="pipeline-step-item active" id="pipe-step-1" data-stage="1">
          <div class="step-num">1</div>
          <div class="step-content">
            <span class="step-title">Stage 1: Gesture Vision</span>
            <span class="step-sub">Sign Tokens & Concepts</span>
          </div>
        </div>
        <div class="pipeline-arrow">➔</div>
        <div class="pipeline-step-item" id="pipe-step-2" data-stage="2">
          <div class="step-num">2</div>
          <div class="step-content">
            <span class="step-title">Stage 2: Sentence AI</span>
            <span class="step-sub">Grammar Formation</span>
          </div>
        </div>
        <div class="pipeline-arrow">➔</div>
        <div class="pipeline-step-item" id="pipe-step-3" data-stage="3">
          <div class="step-num">3</div>
          <div class="step-content">
            <span class="step-title">Stage 3: Multilingual</span>
            <span class="step-sub">Tamil, Hindi, Telugu, KN, ML, EN</span>
          </div>
        </div>
        <div class="pipeline-arrow">➔</div>
        <div class="pipeline-step-item" id="pipe-step-4" data-stage="4">
          <div class="step-num">4</div>
          <div class="step-content">
            <span class="step-title">Stage 4: Voice Speech</span>
            <span class="step-sub">Indic / English TTS</span>
          </div>
        </div>
      </div>

      <!-- VIEW 1: DUAL-COUNTER SERVICE DESK WORKSPACE -->
      <div class="workspace-view active" id="view-counter-desk">
        <main class="main-bridge-grid" id="main-bridge-grid">
          
          <!-- LEFT COLUMN: VISITOR SIGN LANGUAGE RECOGNITION (GESTURE-TO-TEXT/SPEECH) -->
          <section class="counter-panel visitor-panel" aria-label="Deaf Visitor Sign Language Camera Feed">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-badge-visitor">DEAF VISITOR INTERFACE</span>
                <h2 class="panel-title">Real-Time Gesture Vision Engine</h2>
              </div>
              
              <div class="camera-actions">
                <button id="btn-camera-toggle" class="btn-camera-toggle" aria-label="Start Camera">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  <span id="camera-btn-text">Start Camera</span>
                </button>
                <button id="btn-synthetic-toggle" class="btn-sim-toggle" title="Cycle synthetic sign">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path></svg>
                  <span>Cycle Sign</span>
                </button>
              </div>
            </div>

            <!-- VIDEO FEED CONTAINER -->
            <div class="video-container" id="video-container">
              <video id="webcam-video" class="hidden-video" playsinline muted></video>
              <canvas id="landmark-canvas" width="640" height="420" class="vision-canvas"></canvas>

              <!-- Video Overlay HUD -->
              <div class="vision-hud-overlay">
                <div class="hud-top-row">
                  <div class="hud-metric">
                    <span class="hud-label">LATENCY</span>
                    <span class="hud-val" id="hud-latency">0 ms</span>
                  </div>
                  <div class="hud-metric">
                    <span class="hud-label">FRAME RATE</span>
                    <span class="hud-val" id="hud-fps">30 FPS</span>
                  </div>
                  <div class="hud-metric">
                    <span class="hud-label">HANDS</span>
                    <span class="hud-val" id="hud-hands">0</span>
                  </div>
                  <div class="hud-metric" id="hud-video-badge" style="display: none;">
                    <span class="hud-label">INPUT STREAM</span>
                    <span class="hud-val" style="color: #ec4899;">DATASET MP4</span>
                  </div>
                </div>

                <!-- Quick Background & Lighting Bar -->
                <div class="hud-bottom-bar">
                  <div class="filter-pill-selector">
                    <span class="filter-title">Environment:</span>
                    <select id="select-bg-preset" class="hud-select" aria-label="Select Virtual Background Environment">
                      <option value="real">Real Camera Feed</option>
                      <option value="bank">Bank Counter Background</option>
                      <option value="hospital">Hospital Corridor Background</option>
                      <option value="government">Govt Desk Background</option>
                      <option value="noise">Noise / Public Clutter</option>
                      <option value="blur">Bokeh Blur Background</option>
                    </select>

                    <select id="select-light-preset" class="hud-select" aria-label="Select Lighting Condition">
                      <option value="normal">Normal Lighting</option>
                      <option value="low_light">Low-Light Boost (+Gamma)</option>
                      <option value="high_contrast">High Contrast Filter</option>
                      <option value="overexposed">Backlight / Glare</option>
                      <option value="edge_boost">Edge Enhancement</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- DATASET STREAM CONTROL BAR (Active when streaming dataset videos) -->
            <div class="dataset-stream-controls-card" id="dataset-stream-controls" style="display: none;">
              <div class="stream-info-left">
                <span class="stream-active-icon">🎬</span>
                <div class="stream-title-wrap">
                  <span class="stream-playing-title" id="stream-playing-title">Playing: Hello</span>
                  <span class="stream-playing-sub" id="stream-playing-sub">Greetings & Social • 61-Class Video Dataset</span>
                </div>
              </div>
              <div class="stream-actions-center">
                <button id="btn-stream-prev" class="btn-stream-ctrl" title="Previous Dataset Video">⏮ Prev</button>
                <button id="btn-stream-pause" class="btn-stream-ctrl" title="Play / Pause">⏸ Pause</button>
                <button id="btn-stream-next" class="btn-stream-ctrl" title="Next Dataset Video">Next ⏭</button>
                <div class="stream-speed-pills">
                  <button class="btn-stream-spd" data-spd="0.5">0.5x</button>
                  <button class="btn-stream-spd active" data-spd="1.0">1.0x</button>
                  <button class="btn-stream-spd" data-spd="1.5">1.5x</button>
                </div>
              </div>
              <div class="stream-actions-right">
                <button id="btn-stream-details-quick" class="btn-stream-details-pill" title="View Full Translation & Keypoints">ℹ️ Dataset Info</button>
              </div>
            </div>

            <!-- ASL FINGERSPELLING LIVE WORD COMPOSER BAR -->
            <div class="asl-word-composer-card" id="asl-composer-card">
              <div class="composer-header">
                <div class="composer-title-wrap">
                  <span class="composer-badge">ASL LIVE WORD COMPOSER</span>
                  <span class="composer-hint">Fingerspell letters into live text</span>
                  <span class="composer-gesture-tag" title="Swipe hand right for Space, swipe left for Backspace">
                    🖐️ <strong>Swipe ➔</strong> Space | 👈 <strong>Swipe ⬅</strong> Backspace
                  </span>
                </div>
                <div class="composer-actions">
                  <button id="btn-composer-space" class="btn-composer-tool" title="Add Space (or Swipe Hand ➔ Right)">␣ Space <span class="kbd-pill">Hand ➔</span></button>
                  <button id="btn-composer-backspace" class="btn-composer-tool" title="Delete Last Letter (or Swipe Hand ⬅ Left / Thumbs-Left)">⌫ Backspace <span class="kbd-pill">Hand ⬅</span></button>
                  <button id="btn-composer-clear" class="btn-composer-tool" title="Clear All">Clear</button>
                  <button id="btn-composer-speak" class="btn-composer-speak" title="Speak Word Aloud">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    Speak Word
                  </button>
                </div>
              </div>
              <div class="composer-display">
                <span id="composer-spelled-text" class="spelled-text-placeholder">Fingerspell letters (A-Z) to build words here...</span>
              </div>
            </div>

            <!-- RECOGNITION OUTPUT CARD -->
            <div class="recognition-output-card" id="recognition-card">
              <div class="recog-status-row">
                <div class="recog-badge-live">
                  <span class="pulse-indicator"></span>
                  <span id="recog-mode-badge">LIVE VISION INFERENCE</span>
                </div>
                <div class="confidence-gauge-wrapper">
                  <span class="confidence-label">Confidence:</span>
                  <span class="confidence-number" id="confidence-val">0%</span>
                  <div class="confidence-bar-bg">
                    <div class="confidence-bar-fill" id="confidence-bar" style="width: 0%;"></div>
                  </div>
                </div>
              </div>

              <!-- PRIMARY TRANSLATION TEXT -->
              <div class="primary-translation-box">
                <div class="translation-meta">
                  <span class="meta-label">RECOGNIZED SIGN / VIDEO CLASS:</span>
                  <span class="active-sign-id" id="active-sign-name">Scanning Stream...</span>
                </div>
                <h3 class="translated-spoken-text" id="active-spoken-text">
                  "Hold hand in view or click Play Video Stream from dataset."
                </h3>
              </div>

              <!-- TOP-3 PREDICTIONS & FINGER HUD -->
              <div class="recog-telemetry-grid">
                <div class="top-predictions-box">
                  <span class="telemetry-label">Hypotheses:</span>
                  <div class="top-predictions-list" id="top-predictions-list">
                    <span class="pred-item muted">Standby</span>
                  </div>
                </div>
                
                <div class="finger-status-box">
                  <span class="telemetry-label">Finger States:</span>
                  <div class="finger-indicators" id="finger-indicators">
                    <span class="finger-dot" title="Thumb">T</span>
                    <span class="finger-dot" title="Index">I</span>
                    <span class="finger-dot" title="Middle">M</span>
                    <span class="finger-dot" title="Ring">R</span>
                    <span class="finger-dot" title="Pinky">P</span>
                  </div>
                </div>
              </div>

              <!-- AUDIO TTS STATUS BAR -->
              <div class="tts-status-bar">
                <div class="tts-left">
                  <button id="btn-audio-toggle" class="btn-tts-toggle active" title="Toggle Spoken Voice Output">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-speaker"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    <span>Auto-Speak (TTS Active)</span>
                  </button>
                  <button id="btn-replay-tts" class="btn-replay-tts" title="Replay Last Translation">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                    Replay Voice
                  </button>
                </div>
                <canvas id="tts-audio-waveform" width="120" height="24" class="waveform-mini"></canvas>
              </div>
            </div>

            <!-- 4-STAGE MULTI-MODAL PIPELINE CARD -->
            <div class="pipeline-card" id="pipeline-card">
              <div class="pipeline-card-header">
                <div class="pipeline-card-title-group">
                  <span class="pipeline-card-badge">4-STAGE PIPELINE</span>
                  <h3 class="pipeline-card-title">Sign ➔ Sentence AI ➔ Multilingual ➔ Speech</h3>
                </div>
                <div class="pipeline-header-controls">
                  <label class="toggle-switch-label" title="Automatically form sentences when gesture sequence finishes">
                    <input type="checkbox" id="toggle-auto-sentence" checked />
                    <span class="toggle-slider"></span>
                    <span class="toggle-text">Auto-Synthesize</span>
                  </label>
                </div>
              </div>

              <!-- STAGE 1: SIGN TOKEN SEQUENCE BUFFER -->
              <div class="stage-section stage-1-section">
                <div class="stage-header-row">
                  <div class="stage-tag">
                    <span class="stage-number-chip stage-chip-1">Stage 1</span>
                    <span class="stage-name">Recognized Sign Tokens:</span>
                  </div>
                  <div class="stage-tools">
                    <button id="btn-clear-tokens" class="btn-tool-xs" title="Clear Token Queue">⌫ Clear</button>
                    <button id="btn-generate-sentence" class="btn-synthesize-action" title="Synthesize tokens into grammatical sentence now">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Form Sentence (Stage 2)
                    </button>
                  </div>
                </div>

                <!-- Active Token Chips Display -->
                <div class="token-chips-container" id="token-chips-container">
                  <span class="token-chip-placeholder">Recognized gesture signs will buffer here (e.g. [I] + [FEVER])...</span>
                </div>

                <!-- Quick Token Add Simulation Pills for instant testing -->
                <div class="token-quick-adder-row">
                  <span class="quick-token-label">Quick Concept Add:</span>
                  <div class="token-quick-chips">
                    <button class="btn-quick-token" data-token="I">+ I</button>
                    <button class="btn-quick-token" data-token="FEVER">+ Fever</button>
                    <button class="btn-quick-token" data-token="NEED">+ Need</button>
                    <button class="btn-quick-token" data-token="DOCTOR">+ Doctor</button>
                    <button class="btn-quick-token" data-token="ACCOUNT">+ Account</button>
                    <button class="btn-quick-token" data-token="DEPOSIT">+ Deposit</button>
                    <button class="btn-quick-token" data-token="HELP">+ Help</button>
                    <button class="btn-quick-token" data-token="THANK_YOU">+ Thank You</button>
                  </div>
                </div>
              </div>

              <!-- STAGE 2: GRAMMAR SENTENCE FORMATION -->
              <div class="stage-section stage-2-section">
                <div class="stage-header-row">
                  <div class="stage-tag">
                    <span class="stage-number-chip stage-chip-2">Stage 2</span>
                    <span class="stage-name">Grammatically Meaningful Sentence:</span>
                  </div>
                  <span class="grammar-confidence-badge" id="grammar-confidence-badge">Grammar AI Ready</span>
                </div>
                <div class="formed-sentence-box">
                  <p class="formed-sentence-text" id="formed-sentence-text">
                    "I have a fever and need a medical checkup."
                  </p>
                </div>
              </div>

              <!-- STAGE 3: MULTILINGUAL TRANSLATION (Tamil, Hindi, Telugu, Kannada, Malayalam, English) -->
              <div class="stage-section stage-3-section">
                <div class="stage-header-row">
                  <div class="stage-tag">
                    <span class="stage-number-chip stage-chip-3">Stage 3</span>
                    <span class="stage-name">Multilingual Translation:</span>
                  </div>
                </div>
                
                <!-- Language Selector Tabs -->
                <div class="lang-selector-pills" id="lang-selector-pills">
                  <button class="lang-pill active" data-lang="ta" title="Tamil (தமிழ்)">
                    <span class="lang-flag">🇮🇳</span> <span class="lang-text">தமிழ் (Tamil)</span>
                  </button>
                  <button class="lang-pill" data-lang="hi" title="Hindi (हिन्दी)">
                    <span class="lang-flag">🇮🇳</span> <span class="lang-text">हिन्दी (Hindi)</span>
                  </button>
                  <button class="lang-pill" data-lang="te" title="Telugu (తెలుగు)">
                    <span class="lang-flag">🇮🇳</span> <span class="lang-text">తెలుగు (Telugu)</span>
                  </button>
                  <button class="lang-pill" data-lang="kn" title="Kannada (ಕನ್ನಡ)">
                    <span class="lang-flag">🇮🇳</span> <span class="lang-text">ಕನ್ನಡ (Kannada)</span>
                  </button>
                  <button class="lang-pill" data-lang="ml" title="Malayalam (മലയാളം)">
                    <span class="lang-flag">🇮🇳</span> <span class="lang-text">മലയാളം (Malayalam)</span>
                  </button>
                  <button class="lang-pill" data-lang="en" title="English">
                    <span class="lang-flag">🇬🇧</span> <span class="lang-text">English</span>
                  </button>
                </div>

                <!-- Translated Text Display with Large Native Script -->
                <div class="translated-output-box">
                  <div class="translated-meta-row">
                    <span class="target-lang-label" id="target-lang-label">Tamil (தமிழ் • ta-IN):</span>
                    <span class="translation-mode-indicator">Dictionary + Indic Lexicon</span>
                  </div>
                  <h3 class="translated-output-text" id="translated-output-text">
                    "எனக்கு காய்ச்சல் உள்ளது, மருத்துவ பரிசோதனை தேவை."
                  </h3>
                </div>
              </div>

              <!-- STAGE 4: TEXT-TO-SPEECH (TTS) AUDIO SYNTHESIS -->
              <div class="stage-section stage-4-section">
                <div class="stage-header-row">
                  <div class="stage-tag">
                    <span class="stage-number-chip stage-chip-4">Stage 4</span>
                    <span class="stage-name">Voice Speech Output (TTS):</span>
                  </div>
                  <div class="stage-tools">
                    <button id="btn-speak-translation" class="btn-speak-primary" title="Speak the translated sentence aloud in the target language">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                      <span>Speak in <strong id="btn-speak-lang-name">Tamil</strong></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- RIGHT COLUMN: TWO-WAY COUNTER STAFF & VISITOR VISUAL DISPLAY -->
          <section class="counter-panel staff-panel" aria-label="Service Counter Staff Communication Controls">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-badge-staff">COUNTER STAFF INTERFACE</span>
                <h2 class="panel-title">Two-Way Speech & Sign Prompter</h2>
              </div>
              
              <div class="transcript-actions">
                <button id="btn-export-receipt" class="btn-ghost-small" title="Print Official Receipt">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  <span>Print Receipt</span>
                </button>
                <button id="btn-export-json" class="btn-ghost-small" title="Export JSON Compliance Log">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>JSON</span>
                </button>
                <button id="btn-clear-transcript" class="btn-ghost-small" title="Clear Conversation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>

            <!-- TWO-WAY SIGN PROMPTER & ANIMATED DISPLAY (FOR DEAF CUSTOMER VISIBILITY) -->
            <div class="two-way-prompter-section" id="prompter-section">
              <!-- Dynamically populated by SignVisualizer -->
            </div>

            <!-- STAFF VOICE & TEXT INPUT BAR -->
            <div class="staff-speech-input-card">
              <div class="staff-input-header">
                <label class="staff-input-label">Staff Microphone / Speech-to-Sign:</label>
                <span id="stt-status-indicator" class="stt-idle-badge">Mic Ready</span>
              </div>

              <div class="staff-input-row">
                <button id="btn-staff-mic" class="btn-staff-mic" title="Click to Speak to Customer" aria-label="Toggle Staff Microphone">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-mic"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  <span id="mic-btn-label">Speak (STT)</span>
                </button>

                <div class="staff-text-input-wrap">
                  <input type="text" id="staff-text-input" class="staff-text-input" placeholder="Or type reply for visitor here (Enter to send)..." />
                  <button id="btn-send-staff-text" class="btn-send-text">Send</button>
                </div>
              </div>
            </div>

            <!-- SCENARIO QUICK-REPLY PRESETS -->
            <div class="quick-replies-container">
              <div class="quick-replies-header">
                <span class="quick-title">Desk Quick Actions (<span id="quick-scenario-name">Bank</span>):</span>
              </div>
              <div class="quick-replies-pills" id="quick-replies-pills">
                <!-- Dynamically populated based on active scenario -->
              </div>
            </div>

            <!-- LIVE DUAL-CONVERSATION TRANSCRIPT -->
            <div class="transcript-wrapper">
              <div class="transcript-header-bar">
                <span class="transcript-title">Real-Time Service Dialogue Log</span>
                <span class="transcript-count" id="transcript-count">0 turns</span>
              </div>
              <div class="transcript-scroll-area" id="transcript-container">
                <!-- Dynamically populated by TranscriptManager -->
              </div>
            </div>
          </section>
        </main>
      </div>

      <!-- VIEW 2: DEDICATED GESTURE-TO-SENTENCE STUDIO (SEPARATE SECTION) -->
      <div class="workspace-view" id="view-sentence-studio" style="display: none;">
        <div class="studio-container">
          
          <!-- STUDIO HERO HEADER -->
          <div class="studio-hero-card">
            <div class="studio-hero-title-group">
              <div class="studio-hero-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div>
                <div class="studio-title-row">
                  <h2 class="studio-title">Gesture-to-Sentence Studio</h2>
                  <span class="studio-badge-glow">AI Sentence Synthesizer</span>
                </div>
                <p class="studio-sub">Sign letters or gesture concepts in real time ➔ Stage words into an interactive sequence ➔ AI builds fluent sentences with multilingual Indic speech.</p>
              </div>
            </div>

            <div class="studio-hero-controls">
              <button id="btn-studio-camera-sync" class="btn-action-highlight">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                <span id="studio-camera-btn-text">Camera Active</span>
              </button>
            </div>
          </div>

          <!-- STUDIO DUAL-GRID WORKSPACE -->
          <div class="studio-grid">
            
            <!-- STUDIO LEFT COLUMN: LIVE GESTURE STREAM & WORD BUILDER -->
            <div class="studio-card studio-input-panel">
              <div class="studio-card-header">
                <div class="studio-card-title-wrap">
                  <span class="studio-step-badge">STEP 1</span>
                  <h3 class="studio-card-title">Live Gesture & Word Staging Deck</h3>
                </div>
                <div class="live-recog-pill" id="studio-live-recog-pill">
                  <span class="pulse-indicator"></span>
                  <span id="studio-active-sign-badge">Fingerspell or Sign</span>
                </div>
              </div>

              <!-- LIVE SPELLED WORD FORMULATION BOX -->
              <div class="studio-word-builder-box">
                <div class="builder-meta-row">
                  <span class="builder-label">Current Word Buffer:</span>
                  <span class="builder-gesture-cues">
                    🖐️ <strong>Swipe ➔</strong> Space/Add | 👈 <strong>Swipe ⬅</strong> Backspace
                  </span>
                </div>

                <div class="studio-spelled-display" id="studio-spelled-display">
                  <div class="spelled-letters-tiles" id="studio-spelled-tiles">
                    <!-- Dynamically rendered letter tiles -->
                  </div>
                  <span id="studio-spelled-raw-text" class="spelled-raw-placeholder">Hold hand in camera to fingerspell letters...</span>
                </div>

                <!-- Word Deck Actions -->
                <div class="studio-word-actions-row">
                  <button id="btn-studio-push-word" class="btn-studio-primary-glow" title="Commit this word into the Sentence Chain">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Push Word to Sentence</span>
                  </button>

                  <button id="btn-studio-space" class="btn-studio-tool" title="Add Space">
                    ␣ Space <span class="kbd-pill">Hand ➔</span>
                  </button>

                  <button id="btn-studio-backspace" class="btn-studio-tool" title="Delete Last Letter">
                    ⌫ Backspace <span class="kbd-pill">Hand ⬅</span>
                  </button>

                  <button id="btn-studio-clear-word" class="btn-studio-tool" title="Clear Current Word">
                    🗑️ Clear
                  </button>

                  <button id="btn-studio-speak-word" class="btn-studio-tool" title="Speak Current Word">
                    🔊 Speak
                  </button>
                </div>
              </div>

              <!-- CATEGORIZED CONCEPT WORD PALETTE -->
              <div class="studio-concept-palette">
                <div class="palette-header">
                  <span class="palette-title">One-Click Word Concept Bank:</span>
                  <span class="palette-hint">Click or sign to instantly stage words</span>
                </div>

                <div class="palette-categories-grid">
                  <!-- Health -->
                  <div class="palette-group">
                    <span class="group-label">🏥 Hospital & Health</span>
                    <div class="palette-chips">
                      <button class="btn-palette-chip" data-word="I">I</button>
                      <button class="btn-palette-chip" data-word="FEVER">Fever</button>
                      <button class="btn-palette-chip" data-word="NEED">Need</button>
                      <button class="btn-palette-chip" data-word="DOCTOR">Doctor</button>
                      <button class="btn-palette-chip" data-word="MEDICINE">Medicine</button>
                      <button class="btn-palette-chip" data-word="INJURY">Injury</button>
                      <button class="btn-palette-chip" data-word="EMERGENCY">Emergency</button>
                    </div>
                  </div>

                  <!-- Banking -->
                  <div class="palette-group">
                    <span class="group-label">💳 Banking & Finance</span>
                    <div class="palette-chips">
                      <button class="btn-palette-chip" data-word="ACCOUNT">Account</button>
                      <button class="btn-palette-chip" data-word="MONEY">Money</button>
                      <button class="btn-palette-chip" data-word="DEPOSIT">Deposit</button>
                      <button class="btn-palette-chip" data-word="WITHDRAW">Withdraw</button>
                      <button class="btn-palette-chip" data-word="RECEIPT">Receipt</button>
                      <button class="btn-palette-chip" data-word="SIGN">Sign</button>
                      <button class="btn-palette-chip" data-word="ID_CARD">ID Card</button>
                    </div>
                  </div>

                  <!-- Civic & Daily -->
                  <div class="palette-group">
                    <span class="group-label">🏛️ Public & Courtesy</span>
                    <div class="palette-chips">
                      <button class="btn-palette-chip" data-word="HELLO">Hello</button>
                      <button class="btn-palette-chip" data-word="THANK_YOU">Thank You</button>
                      <button class="btn-palette-chip" data-word="PLEASE">Please</button>
                      <button class="btn-palette-chip" data-word="WHERE">Where</button>
                      <button class="btn-palette-chip" data-word="WATER">Water</button>
                      <button class="btn-palette-chip" data-word="NAME">Name</button>
                      <button class="btn-palette-chip" data-word="HELP">Help</button>
                      <button class="btn-palette-chip" data-word="YES">Yes</button>
                      <button class="btn-palette-chip" data-word="NO">No</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STUDIO RIGHT COLUMN: SENTENCE BUILDER & SYNTHESIZER -->
            <div class="studio-card studio-output-panel">
              <div class="studio-card-header">
                <div class="studio-card-title-wrap">
                  <span class="studio-step-badge step-2-badge">STEP 2 & 3</span>
                  <h3 class="studio-card-title">Interactive Sentence Builder & AI Translation</h3>
                </div>
                <div class="studio-header-toggles">
                  <label class="toggle-switch-label" title="Auto-synthesize sentence when words are added">
                    <input type="checkbox" id="studio-toggle-auto" checked />
                    <span class="toggle-slider"></span>
                    <span class="toggle-text">Auto-Form</span>
                  </label>
                </div>
              </div>

              <!-- STAGED WORD CHAIN CANVAS -->
              <div class="studio-sentence-chain-section">
                <div class="chain-header-row">
                  <div class="chain-title-wrap">
                    <span class="chain-label">Sentence Word Sequence:</span>
                    <span class="chain-count" id="studio-chain-count">0 words</span>
                  </div>
                  <div class="chain-controls">
                    <button id="btn-studio-clear-chain" class="btn-tool-xs" title="Clear All Words">⌫ Clear Chain</button>
                    <button id="btn-studio-synthesize" class="btn-synthesize-action" title="Synthesize Word Sequence into Grammatical Sentence">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      ✨ Synthesize Sentence
                    </button>
                  </div>
                </div>

                <!-- Word Blocks Container -->
                <div class="studio-word-chain-canvas" id="studio-word-chain">
                  <span class="chain-placeholder">No words in chain yet. Fingerspell words or click word chips on the left to start building sentences...</span>
                </div>

                <!-- Custom Word / Name Typing Input -->
                <div class="studio-custom-word-row">
                  <input type="text" id="input-studio-custom-word" class="studio-input" placeholder="Type custom word or name to insert (e.g. John, Prescription, Urgent)..." />
                  <button id="btn-studio-add-custom-word" class="btn-studio-add-word">+ Insert Word</button>
                </div>
              </div>

              <!-- SYNTHESIZED GRAMMAR SENTENCE DISPLAY (STAGE 2) -->
              <div class="studio-formed-sentence-card">
                <div class="formed-sentence-header">
                  <span class="formed-tag">✨ Synthesized Natural Sentence:</span>
                  <span class="grammar-confidence-badge" id="studio-grammar-confidence">Grammar AI Ready</span>
                </div>
                <div class="formed-sentence-body">
                  <h3 class="studio-sentence-text" id="studio-formed-sentence-text">
                    "I have a fever and need a medical checkup."
                  </h3>
                </div>
                <div class="formed-sentence-actions">
                  <button id="btn-studio-copy-sentence" class="btn-action-ghost-sm" title="Copy sentence text">
                    📋 Copy
                  </button>
                  <button id="btn-studio-send-dialogue" class="btn-action-highlight-sm" title="Post this sentence to the Service Desk Dialogue Transcript">
                    💬 Send to Counter Dialogue
                  </button>
                </div>
              </div>

              <!-- MULTILINGUAL TRANSLATION & INDIC VOICE SYNTHESIS (STAGE 3 & 4) -->
              <div class="studio-translation-card">
                <div class="translation-header">
                  <span class="translation-tag">🌐 Multilingual Translation & Indic Speech:</span>
                </div>

                <!-- Language Tabs -->
                <div class="studio-lang-selector" id="studio-lang-selector">
                  <button class="studio-lang-pill active" data-lang="ta" title="Tamil">
                    <span>🇮🇳 தமிழ் (Tamil)</span>
                  </button>
                  <button class="studio-lang-pill" data-lang="hi" title="Hindi">
                    <span>🇮🇳 हिन्दी (Hindi)</span>
                  </button>
                  <button class="studio-lang-pill" data-lang="te" title="Telugu">
                    <span>🇮🇳 తెలుగు (Telugu)</span>
                  </button>
                  <button class="studio-lang-pill" data-lang="kn" title="Kannada">
                    <span>🇮🇳 ಕನ್ನಡ (Kannada)</span>
                  </button>
                  <button class="studio-lang-pill" data-lang="ml" title="Malayalam">
                    <span>🇮🇳 മലയാളം (Malayalam)</span>
                  </button>
                  <button class="studio-lang-pill" data-lang="en" title="English">
                    <span>🇬🇧 English</span>
                  </button>
                </div>

                <!-- Translated Text Output Box -->
                <div class="studio-translated-box">
                  <div class="studio-translated-meta">
                    <span id="studio-target-lang-label">Tamil (தமிழ் • ta-IN):</span>
                    <button id="btn-studio-speak-translation" class="btn-studio-speak-large" title="Speak sentence aloud in target language">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                      <span>🔊 Speak in <strong id="studio-speak-lang-name">Tamil</strong></span>
                    </button>
                  </div>
                  <h2 class="studio-translated-text" id="studio-translated-output-text">
                    "எனக்கு காய்ச்சல் உள்ளது, மருத்துவ பரிசோதனை தேவை."
                  </h2>
                </div>
              </div>

              <!-- RECENT SENTENCES HISTORY LOG -->
              <div class="studio-history-section">
                <div class="history-header-row">
                  <span class="history-title">📚 Recent Formed Sentences Log:</span>
                  <button id="btn-studio-clear-history" class="btn-ghost-xs">Clear History</button>
                </div>
                <div class="studio-history-list" id="studio-history-list">
                  <div class="history-item">
                    <span class="history-text">"I have a fever and need a medical checkup."</span>
                    <button class="btn-history-play" data-text="I have a fever and need a medical checkup." title="Replay">🔊 Speak</button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      <!-- MODAL 0: INTERACTIVE JUDGE DEMO GUIDE & GESTURE CHEAT SHEET -->
      <div id="modal-demo-guide" class="modal-backdrop hidden">
        <div class="modal-dialog-large demo-guide-modal">
          <div class="modal-dialog-header">
            <div class="modal-header-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="demo-icon-accent"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <div>
                <h3>🎯 Live Demo Guide & Gesture ➔ Word Cheat Sheet</h3>
                <p class="modal-header-sub">Master reference for live judge demonstrations, 1-click end-to-end sentence pipelines, and internet-standard gesture poses.</p>
              </div>
            </div>
            <button class="btn-modal-close" data-close="modal-demo-guide">&times;</button>
          </div>

          <!-- DEMO GUIDE TABS -->
          <div class="demo-guide-tabs-bar">
            <button class="demo-tab-btn active" data-guide-tab="sequences">
              🏆 1-Click Judge Demo Sequences
            </button>
            <button class="demo-tab-btn" data-guide-tab="words">
              📖 Everyday Gesture ➔ Word Cheat Sheet (30+ Signs)
            </button>
            <button class="demo-tab-btn" data-guide-tab="alphabet">
              🔤 ASL Alphabet (A-Z) & Space/Backspace Gestures
            </button>
          </div>

          <div class="modal-dialog-body demo-guide-body">
            <!-- TAB 1: 1-CLICK JUDGE DEMO SEQUENCES -->
            <div id="guide-tab-sequences" class="guide-tab-panel active">
              <div class="guide-intro-banner">
                <div class="guide-intro-icon">⚡</div>
                <div>
                  <h4>1-Click Automated Judge Demonstration Runner</h4>
                  <p>Demonstrates the complete <strong>4-Stage AI Pipeline</strong> (Sign Recognition ➔ Sentence AI ➔ Multilingual Translation ➔ Voice TTS). Clicking any sequence automatically populates tokens, synthesizes natural grammar, translates into the active Indic language (Tamil, Hindi, Telugu, etc.), and reads aloud through Voice TTS.</p>
                </div>
              </div>

              <div class="demo-sequences-grid">
                <!-- Sequence 1: Hospital -->
                <div class="demo-seq-card" data-seq="hospital">
                  <div class="seq-card-header">
                    <span class="seq-tag medical-tag">🏥 Hospital Triage</span>
                    <span class="seq-badge">5 Tokens</span>
                  </div>
                  <div class="seq-tokens-flow">
                    <span class="seq-token">[I / ME]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[HAVE]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[FEVER]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[NEED]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[DOCTOR]</span>
                  </div>
                  <div class="seq-output-preview">
                    <p class="seq-english">"I have a fever and need a medical checkup."</p>
                    <p class="seq-trans">Tamil: <em>"எனக்கு காய்ச்சல் உள்ளது, மருத்துவ பரிசோதனை தேவை."</em></p>
                  </div>
                  <button class="btn-run-seq" data-seq-id="hospital">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    ▶ Run Hospital Demo Sequence
                  </button>
                </div>

                <!-- Sequence 2: Bank -->
                <div class="demo-seq-card" data-seq="bank">
                  <div class="seq-card-header">
                    <span class="seq-tag banking-tag">💳 Bank Teller & Deposit</span>
                    <span class="seq-badge">5 Tokens</span>
                  </div>
                  <div class="seq-tokens-flow">
                    <span class="seq-token">[I / ME]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[WANT]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[DEPOSIT]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[MONEY]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[RECEIPT]</span>
                  </div>
                  <div class="seq-output-preview">
                    <p class="seq-english">"I want to deposit cash into my account, please provide a deposit receipt."</p>
                    <p class="seq-trans">Tamil: <em>"நான் பணத்தை டெபாசிட் செய்ய விரும்புகிறேன், ரசீது வழங்கவும்."</em></p>
                  </div>
                  <button class="btn-run-seq" data-seq-id="bank">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    ▶ Run Bank Deposit Demo Sequence
                  </button>
                </div>

                <!-- Sequence 3: Civic Water Facilities -->
                <div class="demo-seq-card" data-seq="civic">
                  <div class="seq-card-header">
                    <span class="seq-tag civic-tag">🏛️ Civic Inquiry</span>
                    <span class="seq-badge">2 Tokens</span>
                  </div>
                  <div class="seq-tokens-flow">
                    <span class="seq-token">[WHERE]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[DRINK_WATER]</span>
                  </div>
                  <div class="seq-output-preview">
                    <p class="seq-english">"Where is the drinking water facility located?"</p>
                    <p class="seq-trans">Tamil: <em>"குடிநீர் வசதி எங்கு உள்ளது?"</em></p>
                  </div>
                  <button class="btn-run-seq" data-seq-id="civic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    ▶ Run Water Facility Demo Sequence
                  </button>
                </div>

                <!-- Sequence 4: Live ASL Fingerspelling -->
                <div class="demo-seq-card" data-seq="fingerspelling">
                  <div class="seq-card-header">
                    <span class="seq-tag asl-tag">🔤 ASL Fingerspelling</span>
                    <span class="seq-badge">5 Letters</span>
                  </div>
                  <div class="seq-tokens-flow">
                    <span class="seq-letter-pill">H</span>
                    <span class="seq-letter-pill">E</span>
                    <span class="seq-letter-pill">L</span>
                    <span class="seq-letter-pill">L</span>
                    <span class="seq-letter-pill">O</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[HELLO]</span>
                  </div>
                  <div class="seq-output-preview">
                    <p class="seq-english">"Hello, how can I assist you today?"</p>
                    <p class="seq-trans">Tamil: <em>"வணக்கம், நான் உங்களுக்கு எப்படி உதவ முடியும்?"</em></p>
                  </div>
                  <button class="btn-run-seq" data-seq-id="fingerspelling">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    ▶ Run ASL Spelling Demo Sequence
                  </button>
                </div>

                <!-- Sequence 5: Emergency Triage -->
                <div class="demo-seq-card" data-seq="emergency">
                  <div class="seq-card-header">
                    <span class="seq-tag emergency-tag">🚨 Emergency Alarm</span>
                    <span class="seq-badge">3 Tokens</span>
                  </div>
                  <div class="seq-tokens-flow">
                    <span class="seq-token emergency-chip">[EMERGENCY]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[PAIN_HURT]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[DOCTOR]</span>
                  </div>
                  <div class="seq-output-preview">
                    <p class="seq-english">"Emergency assistance needed! I am in severe pain, please call the doctor immediately!"</p>
                    <p class="seq-trans">Tamil: <em>"அவசர உதவி! எனக்கு கடுமையான வலி உள்ளது, உடனடியாக மருத்துவரை அழைக்கவும்!"</em></p>
                  </div>
                  <button class="btn-run-seq" data-seq-id="emergency">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    ▶ Run Emergency Triage Demo Sequence
                  </button>
                </div>

                <!-- Sequence 6: Courtesy & Assistance -->
                <div class="demo-seq-card" data-seq="courtesy">
                  <div class="seq-card-header">
                    <span class="seq-tag courtesy-tag">🙏 Public Assistance</span>
                    <span class="seq-badge">4 Tokens</span>
                  </div>
                  <div class="seq-tokens-flow">
                    <span class="seq-token">[HELLO]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[PLEASE]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[HELP_ASSIST]</span>
                    <span class="seq-arrow">➔</span>
                    <span class="seq-token">[THANK_YOU]</span>
                  </div>
                  <div class="seq-output-preview">
                    <p class="seq-english">"Hello, please help me with this process, thank you."</p>
                    <p class="seq-trans">Tamil: <em>"வணக்கம், தயவுசெய்து எனக்கு உதவ முடியுமா, மிக்க நன்றி."</em></p>
                  </div>
                  <button class="btn-run-seq" data-seq-id="courtesy">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    ▶ Run Courtesy Demo Sequence
                  </button>
                </div>
              </div>
            </div>

            <!-- TAB 2: EVERYDAY GESTURE CHEAT SHEET -->
            <div id="guide-tab-words" class="guide-tab-panel">
              <div class="cheat-filter-bar">
                <input type="text" id="guide-cheat-search" class="cheat-search-input" placeholder="🔍 Search gesture or word (e.g. Fever, Water, Deposit, Where)..." />
                <div class="cheat-filter-pills">
                  <button class="cheat-pill active" data-filter="all">All (30+)</button>
                  <button class="cheat-pill" data-filter="pronouns">Pronouns & Questions</button>
                  <button class="cheat-pill" data-filter="medical">Medical & Health</button>
                  <button class="cheat-pill" data-filter="banking">Banking & Civic</button>
                  <button class="cheat-pill" data-filter="actions">Actions & Needs</button>
                  <button class="cheat-pill" data-filter="courtesy">Courtesy</button>
                </div>
              </div>

              <div class="cheat-cards-grid" id="cheat-cards-grid">
                <!-- PRONOUNS & QUESTIONS -->
                <div class="cheat-card" data-category="pronouns">
                  <div class="cheat-card-header">
                    <h4>I / ME</h4>
                    <span class="cheat-tag pronouns">Pronoun</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Point index finger directly inward toward your chest.</p>
                  <div class="cheat-cues">
                    <span>Index: OPEN</span>
                    <span>Others: FOLDED</span>
                    <span>Target: Chest</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="I_ME">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="I_ME">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="pronouns">
                  <div class="cheat-card-header">
                    <h4>YOU</h4>
                    <span class="cheat-tag pronouns">Pronoun</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Point index finger forward toward the screen/camera.</p>
                  <div class="cheat-cues">
                    <span>Index: OPEN</span>
                    <span>Forward Direction</span>
                    <span>Single Hand</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="YOU">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="YOU">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="pronouns">
                  <div class="cheat-card-header">
                    <h4>MY / MINE</h4>
                    <span class="cheat-tag pronouns">Possessive</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Flat open hand placed firmly over center of chest.</p>
                  <div class="cheat-cues">
                    <span>All 5: OPEN</span>
                    <span>Flat Palm</span>
                    <span>On Chest</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="MY_MINE">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="MY_MINE">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="pronouns">
                  <div class="cheat-card-header">
                    <h4>WHERE</h4>
                    <span class="cheat-tag pronouns">Question</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Upright index finger wagging side-to-side in inquiry.</p>
                  <div class="cheat-cues">
                    <span>Index: OPEN</span>
                    <span>Side Shake</span>
                    <span>Inquiry</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="WHERE">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="WHERE">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="pronouns">
                  <div class="cheat-card-header">
                    <h4>WHAT</h4>
                    <span class="cheat-tag pronouns">Question</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Open upward palms shaking gently side to side.</p>
                  <div class="cheat-cues">
                    <span>Palms Up</span>
                    <span>Horizontal Shake</span>
                    <span>Question</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="WHAT">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="WHAT">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="pronouns">
                  <div class="cheat-card-header">
                    <h4>WHY</h4>
                    <span class="cheat-tag pronouns">Question</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Touch forehead with flat hand then pull down to Y-hand shape.</p>
                  <div class="cheat-cues">
                    <span>Forehead Touch</span>
                    <span>Y-Shape Pull</span>
                    <span>Reason</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="WHY">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="WHY">▶ Test in Camera</button>
                  </div>
                </div>

                <!-- ACTIONS & NEEDS -->
                <div class="cheat-card" data-category="actions">
                  <div class="cheat-card-header">
                    <h4>NEED</h4>
                    <span class="cheat-tag actions">Action / Need</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Hooked index finger (X-hand) pulled downward firmly.</p>
                  <div class="cheat-cues">
                    <span>Index: HALF/HOOK</span>
                    <span>Downward Pull</span>
                    <span>Requirement</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="NEED">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="NEED">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="actions">
                  <div class="cheat-card-header">
                    <h4>WANT</h4>
                    <span class="cheat-tag actions">Desire</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Clawed hands facing upward pulling back toward body.</p>
                  <div class="cheat-cues">
                    <span>Fingers: HALF/CLAW</span>
                    <span>Inward Pull</span>
                    <span>Desire</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="WANT">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="WANT">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="actions">
                  <div class="cheat-card-header">
                    <h4>HAVE</h4>
                    <span class="cheat-tag actions">Possession</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Bent flat fingertips resting gently against chest.</p>
                  <div class="cheat-cues">
                    <span>Bent Fingers</span>
                    <span>Touches Chest</span>
                    <span>Possession</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="HAVE">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="HAVE">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="actions">
                  <div class="cheat-card-header">
                    <h4>STOP / HALT</h4>
                    <span class="cheat-tag actions">Control</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Dominant vertical flat hand chopping down onto flat horizontal palm.</p>
                  <div class="cheat-cues">
                    <span>2 Hands</span>
                    <span>Vertical Chop</span>
                    <span>Palm Halt</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="STOP">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="STOP">▶ Test in Camera</button>
                  </div>
                </div>

                <!-- MEDICAL & HEALTH -->
                <div class="cheat-card" data-category="medical">
                  <div class="cheat-card-header">
                    <h4>FEVER</h4>
                    <span class="cheat-tag medical">Medical</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Back of hand placed against forehead feeling temperature.</p>
                  <div class="cheat-cues">
                    <span>Forehead Level</span>
                    <span>Back of Hand</span>
                    <span>High Temp</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="FEVER">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="FEVER">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="medical">
                  <div class="cheat-card-header">
                    <h4>DOCTOR</h4>
                    <span class="cheat-tag medical">Medical</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Two fingers (index & middle) tapping the pulse on the opposite wrist.</p>
                  <div class="cheat-cues">
                    <span>Wrist Pulse Tap</span>
                    <span>2 Fingers</span>
                    <span>Physician</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="DOCTOR">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="DOCTOR">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="medical">
                  <div class="cheat-card-header">
                    <h4>PAIN / HURT</h4>
                    <span class="cheat-tag medical">Medical</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Both index fingers pointed toward each other with a twisting motion.</p>
                  <div class="cheat-cues">
                    <span>2 Index Fingers</span>
                    <span>Opposing Twist</span>
                    <span>Severe Pain</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="PAIN_HURT">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="PAIN_HURT">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="medical">
                  <div class="cheat-card-header">
                    <h4>DRINK / WATER</h4>
                    <span class="cheat-tag medical">Essential</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> C-hand shape held like a cup tilted upward to the lips.</p>
                  <div class="cheat-cues">
                    <span>Cup Shape (C)</span>
                    <span>Tilted to Lips</span>
                    <span>Water</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="DRINK_WATER">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="DRINK_WATER">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="medical">
                  <div class="cheat-card-header">
                    <h4>EAT / FOOD</h4>
                    <span class="cheat-tag medical">Essential</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Bunched fingertips (flat-O) tapping mouth twice.</p>
                  <div class="cheat-cues">
                    <span>Bunched Tips</span>
                    <span>Touch Lips</span>
                    <span>Nutrition</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="EAT_FOOD">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="EAT_FOOD">▶ Test in Camera</button>
                  </div>
                </div>

                <!-- BANKING & CIVIC -->
                <div class="cheat-card" data-category="banking">
                  <div class="cheat-card-header">
                    <h4>MONEY / CASH</h4>
                    <span class="cheat-tag banking">Banking</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Dominant flat-O hand tapping flat horizontal palm repeatedly.</p>
                  <div class="cheat-cues">
                    <span>Tapping Flat Palm</span>
                    <span>2 Hands</span>
                    <span>Currency</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="MONEY">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="MONEY">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="banking">
                  <div class="cheat-card-header">
                    <h4>DEPOSIT</h4>
                    <span class="cheat-tag banking">Banking</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Hands holding imaginary cash and inserting it forward into a slot.</p>
                  <div class="cheat-cues">
                    <span>Push Forward</span>
                    <span>Insert Motion</span>
                    <span>Credit Cash</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="DEPOSIT">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="DEPOSIT">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="banking">
                  <div class="cheat-card-header">
                    <h4>RECEIPT / FEE</h4>
                    <span class="cheat-tag banking">Desk</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Two flat hands sliding past each other like holding a printed voucher.</p>
                  <div class="cheat-cues">
                    <span>2 Flat Hands</span>
                    <span>Slide Past</span>
                    <span>Slip / Invoice</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="RECEIPT_FEE">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="RECEIPT_FEE">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="banking">
                  <div class="cheat-card-header">
                    <h4>SIGN FORM</h4>
                    <span class="cheat-tag banking">Civic</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Dominant hand holds imaginary pen and writes across flat palm.</p>
                  <div class="cheat-cues">
                    <span>Pencil Grip</span>
                    <span>Across Palm</span>
                    <span>Signature</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="SIGN_FORM">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="SIGN_FORM">▶ Test in Camera</button>
                  </div>
                </div>

                <!-- COURTESY -->
                <div class="cheat-card" data-category="courtesy">
                  <div class="cheat-card-header">
                    <h4>HELLO</h4>
                    <span class="cheat-tag courtesy">Greeting</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Open 5-finger palm waving or salutary gesture from temple.</p>
                  <div class="cheat-cues">
                    <span>All 5: OPEN</span>
                    <span>Wave Motion</span>
                    <span>Greeting</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="HELLO">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="HELLO">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="courtesy">
                  <div class="cheat-card-header">
                    <h4>THANK YOU</h4>
                    <span class="cheat-tag courtesy">Courtesy</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Flat open hand touching chin/lips and extending outward toward judge.</p>
                  <div class="cheat-cues">
                    <span>Fingers: OPEN</span>
                    <span>Chin Outward</span>
                    <span>Gratitude</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="THANK_YOU">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="THANK_YOU">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="courtesy">
                  <div class="cheat-card-header">
                    <h4>PLEASE</h4>
                    <span class="cheat-tag courtesy">Courtesy</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Open flat hand over chest moving in a gentle clockwise circle.</p>
                  <div class="cheat-cues">
                    <span>Flat Hand</span>
                    <span>Chest Circle</span>
                    <span>Polite</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="PLEASE">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="PLEASE">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="courtesy">
                  <div class="cheat-card-header">
                    <h4>YES</h4>
                    <span class="cheat-tag courtesy">Response</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Closed fist nodding up and down from the wrist like a nodding head.</p>
                  <div class="cheat-cues">
                    <span>Closed Fist</span>
                    <span>Up/Down Nod</span>
                    <span>Affirmative</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="YES">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="YES">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="courtesy">
                  <div class="cheat-card-header">
                    <h4>NO</h4>
                    <span class="cheat-tag courtesy">Response</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Index & middle fingers extended, snapping down onto the thumb tip.</p>
                  <div class="cheat-cues">
                    <span>2 Fingers Open</span>
                    <span>Snap to Thumb</span>
                    <span>Negative</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="NO">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="NO">▶ Test in Camera</button>
                  </div>
                </div>

                <div class="cheat-card" data-category="courtesy">
                  <div class="cheat-card-header">
                    <h4>GOOD / OK</h4>
                    <span class="cheat-tag courtesy">Response</span>
                  </div>
                  <p class="cheat-pose-desc"><strong>Hand Pose:</strong> Thumbs up gesture held steady in camera view.</p>
                  <div class="cheat-cues">
                    <span>Thumb: OPEN (Up)</span>
                    <span>Fingers: FOLDED</span>
                    <span>Approval</span>
                  </div>
                  <div class="cheat-card-actions">
                    <button class="btn-guide-add-token" data-token="GOOD_OK">+ Add to Studio</button>
                    <button class="btn-guide-test-pose" data-sign-id="GOOD_OK">▶ Test in Camera</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 3: ASL ALPHABET (A-Z) & GESTURE SWIPES -->
            <div id="guide-tab-alphabet" class="guide-tab-panel">
              <div class="asl-guide-controls-box">
                <h4>🚀 Real-Time Hand Gesture Controls (No Keyboard Needed)</h4>
                <div class="asl-gestures-grid">
                  <div class="control-gesture-card">
                    <div class="control-card-icon">␣</div>
                    <div>
                      <h5>Hand Swipe Right = SPACE</h5>
                      <p>Sweep open flat hand horizontally from left to right across the camera to insert a word space.</p>
                    </div>
                  </div>
                  <div class="control-gesture-card">
                    <div class="control-card-icon">⌫</div>
                    <div>
                      <h5>Fist Swipe Left = BACKSPACE</h5>
                      <p>Sweep closed fist horizontally from right to left across the camera to delete the previous letter or word.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="asl-alphabet-chart-wrap">
                <h4>🔤 Complete ASL Fingerspelling (A to Z) Pose Reference</h4>
                <div class="asl-alphabet-cards-grid">
                  ${['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map(char => `
                    <div class="asl-letter-card" data-letter="${char}">
                      <div class="asl-letter-big">${char}</div>
                      <div class="asl-letter-sub">ASL ${char}</div>
                      <button class="btn-asl-add-letter" data-letter="${char}" title="Add '${char}' to composed word">+ Add</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- MODAL 1: INTERACTIVE SIGN & ASL ALPHABET & VIDEO DATASET DICTIONARY -->
      <div id="modal-dictionary" class="modal-backdrop hidden">
        <div class="modal-dialog-large">
          <div class="modal-dialog-header">
            <div class="modal-header-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <h3>Sign Language Dictionary & 61-Video Dataset Explorer</h3>
            </div>
            <button class="btn-modal-close" data-close="modal-dictionary">&times;</button>
          </div>
          <div class="modal-dialog-body" id="dict-view-wrapper">
            <!-- Rendered by DictionaryView -->
          </div>
        </div>
      </div>

      <!-- MODAL 2: STRESS TEST & DATASET BENCHMARK LAB -->
      <div id="modal-lab" class="modal-backdrop hidden">
        <div class="modal-dialog-medium">
          <div class="modal-dialog-header">
            <div class="modal-header-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>
              <h3>Robustness & 61-Class Dataset Benchmark Lab</h3>
            </div>
            <button class="btn-modal-close" data-close="modal-lab">&times;</button>
          </div>
          <div class="modal-dialog-body" id="lab-view-wrapper">
            <div class="lab-intro-box">
              <p>Verify gesture & ASL recognition stability across 5 public stress conditions (low-light 10 Lux, backlight glare, visual background clutter, and video dataset samples).</p>
              <button id="btn-start-benchmark" class="btn-primary-large">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Run Automated Robustness & Video Dataset Benchmark
              </button>
            </div>
            
            <div id="benchmark-progress-box" class="benchmark-progress-box hidden">
              <div class="bench-status-row">
                <span id="bench-stage-title">Testing Stage 1 of 5...</span>
                <span id="bench-percent">20%</span>
              </div>
              <div class="progress-bar-bg">
                <div id="bench-bar-fill" class="progress-bar-fill" style="width: 20%;"></div>
              </div>
            </div>

            <div id="benchmark-results-box" class="benchmark-results-box hidden">
              <!-- Dynamically populated upon benchmark completion -->
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL 3: CUSTOM GESTURE CALIBRATION & RECORDER -->
      <div id="modal-custom-trainer" class="modal-backdrop hidden">
        <div class="modal-dialog-medium">
          <div class="modal-dialog-header">
            <div class="modal-header-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <h3>Custom Sign Calibrator & Local Trainer</h3>
            </div>
            <button class="btn-modal-close" data-close="modal-custom-trainer">&times;</button>
          </div>
          <div class="modal-dialog-body">
            <p>Record and calibrate specialized regional gestures or custom phrases directly into the browser in 3 seconds.</p>
            <div class="trainer-form">
              <div class="form-group">
                <label>Sign Name / Action:</label>
                <input type="text" id="custom-sign-name" class="form-input" placeholder="e.g. Senior Citizen Priority" />
              </div>
              <div class="form-group">
                <label>Spoken Text to Read Aloud:</label>
                <input type="text" id="custom-sign-text" class="form-input" placeholder="e.g. I am a senior citizen requesting priority counter." />
              </div>
              <button id="btn-record-custom-gesture" class="btn-action-highlight">
                Hold Sign in Front of Camera & Start 3s Recording
              </button>
              <div id="custom-record-feedback" class="custom-feedback hidden"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER ACCESSIBILITY & SHORTCUTS -->
      <footer class="app-footer">
        <div class="footer-left">
          <span class="status-indicator-live"></span>
          <span>Inference Feasibility: <strong>Real-Time Continuous Stream (&lt; 25ms Latency)</strong></span>
          <span class="divider">|</span>
          <span>Integrated <strong>61 Video Dataset Classes + 26 ASL Letters</strong></span>
        </div>
        <div class="footer-right">
          <button id="btn-open-trainer" class="btn-footer-link">Calibrate Custom Sign</button>
          <span class="divider">|</span>
          <span class="key-hint">Shortcuts: <strong>Space</strong> (Camera) • <strong>M</strong> (Mic) • <strong>D</strong> (Demo)</span>
        </div>
      </footer>
    </div>
  `;
}
