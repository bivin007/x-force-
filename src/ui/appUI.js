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
      <div class="sub-header-bar">
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

      <!-- MAIN WORKSPACE: DUAL-COUNTER BRIDGE -->
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
