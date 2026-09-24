/**
 * Visual Sign Language Generator & Animated Avatar Visualizer
 * Converts counter staff speech / text replies into clear visual sign diagrams,
 * ASL alphabet finger cards, motion guides, and accessibility placards for Deaf visitors.
 */

import { VOCABULARY } from '../data/vocabulary.js';

export class SignVisualizer {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentSign = null;
  }

  displaySignPrompt(signIdOrObject, staffSpokenSentence = '') {
    let sign = null;
    if (typeof signIdOrObject === 'string') {
      sign = VOCABULARY.find(v => v.id === signIdOrObject || v.letter === signIdOrObject.toUpperCase()) || VOCABULARY[0];
    } else {
      sign = signIdOrObject;
    }

    if (!sign) return;
    this.currentSign = sign;

    const isAlphabet = sign.category === 'asl_alphabet' || Boolean(sign.letter);

    this.container.innerHTML = `
      <div class="sign-prompt-card animate-fade-in">
        <div class="sign-prompt-header">
          <div class="prompt-badge">
            <span class="pulse-dot"></span>
            <span>${isAlphabet ? 'ASL FINGERSPELLING' : 'STAFF RESPONSE CUE'}</span>
          </div>
          <span class="prompt-category category-${sign.category}">${isAlphabet ? 'ASL LETTER ' + (sign.letter || '') : sign.category.toUpperCase()}</span>
        </div>

        <div class="prompt-main-grid">
          <div class="prompt-visual-box ${isAlphabet ? 'alphabet-visual-box' : ''}">
            ${isAlphabet ? this._generateAlphabetCard(sign) : this._generateSignIllustration(sign)}
          </div>
          <div class="prompt-details">
            <h3 class="prompt-sign-name">${sign.name}</h3>
            <p class="prompt-spoken-reply">"${staffSpokenSentence || sign.counterResponse || sign.spokenText}"</p>
            <div class="prompt-instructions">
              <span class="instruction-label">Visual Hand Guide:</span>
              <p class="instruction-text">${sign.visualGuide || sign.description}</p>
            </div>
            <div class="prompt-finger-states">
              <span class="finger-pill ${sign.keyFingerStates.thumb === 'OPEN' ? 'pill-open' : (sign.keyFingerStates.thumb === 'HALF' ? 'pill-half' : 'pill-folded')}">Thumb: ${sign.keyFingerStates.thumb}</span>
              <span class="finger-pill ${sign.keyFingerStates.index === 'OPEN' ? 'pill-open' : (sign.keyFingerStates.index === 'HALF' ? 'pill-half' : 'pill-folded')}">Index: ${sign.keyFingerStates.index}</span>
              <span class="finger-pill ${sign.keyFingerStates.middle === 'OPEN' ? 'pill-open' : (sign.keyFingerStates.middle === 'HALF' ? 'pill-half' : 'pill-folded')}">Middle: ${sign.keyFingerStates.middle}</span>
              <span class="finger-pill ${sign.keyFingerStates.pinky === 'OPEN' ? 'pill-open' : (sign.keyFingerStates.pinky === 'HALF' ? 'pill-half' : 'pill-folded')}">Pinky: ${sign.keyFingerStates.pinky}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  clear() {
    this.container.innerHTML = `
      <div class="sign-prompt-idle">
        <div class="idle-icon-ring">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </div>
        <p class="idle-title">Two-Way Sign Language Assistant Ready</p>
        <p class="idle-subtitle">Staff speech and fingerspelling will show live visual sign representations here.</p>
      </div>
    `;
  }

  _generateAlphabetCard(sign) {
    return `
      <div class="asl-letter-visual-display">
        <div class="asl-large-glyph">${sign.letter || sign.spokenText}</div>
        <div class="asl-glyph-sub">ASL Handshape</div>
      </div>
    `;
  }

  _generateSignIllustration(sign) {
    const isTwoHand = sign.handsRequired === 2;
    const motion = sign.motionType;

    let motionOverlaySvg = '';

    if (motion === 'wave_outward') {
      motionOverlaySvg = `
        <path d="M 60,35 Q 85,25 110,35" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4 4" class="motion-arrow" />
        <polygon points="112,35 104,30 106,39" fill="#38bdf8" />
      `;
    } else if (motion === 'chin_to_forward') {
      motionOverlaySvg = `
        <path d="M 70,30 Q 70,60 100,75" fill="none" stroke="#34d399" stroke-width="3" class="motion-arrow" />
        <polygon points="104,77 94,72 98,82" fill="#34d399" />
      `;
    } else if (motion === 'chest_circle') {
      motionOverlaySvg = `
        <ellipse cx="70" cy="65" rx="35" ry="20" fill="none" stroke="#fbbf24" stroke-width="3" stroke-dasharray="6 4" class="motion-arrow-circle" />
      `;
    } else if (motion === 'fist_nod') {
      motionOverlaySvg = `
        <path d="M 70,35 L 70,75" fill="none" stroke="#38bdf8" stroke-width="3" class="motion-arrow-nod" />
        <polygon points="70,80 65,70 75,70" fill="#38bdf8" />
        <polygon points="70,30 65,40 75,40" fill="#38bdf8" />
      `;
    } else if (motion === 'pulse_tap') {
      motionOverlaySvg = `
        <circle cx="50" cy="70" r="14" fill="none" stroke="#ef4444" stroke-width="2" class="motion-pulse" />
        <circle cx="50" cy="70" r="8" fill="rgba(239, 68, 68, 0.4)" />
      `;
    }

    return `
      <div class="vector-hand-container">
        <svg viewBox="0 0 140 140" class="vector-hand-svg">
          <circle cx="70" cy="70" r="60" fill="rgba(56, 189, 248, 0.05)" />
          
          <g class="hand-shape-primary ${isTwoHand ? 'hand-right' : 'hand-center'}">
            <path d="M 50,110 C 50,95 55,80 60,70 C 65,70 75,70 80,70 C 85,80 90,95 90,110 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" />
            ${this._generateFingerSegments(sign)}
          </g>

          ${isTwoHand ? `
            <g class="hand-shape-secondary">
              <path d="M 25,100 C 25,85 30,75 35,70 C 40,70 48,70 52,70 C 56,75 60,85 60,100 Z" fill="#0f172a" stroke="#818cf8" stroke-width="2" opacity="0.8" />
              <path d="M 35,70 L 35,45" stroke="#818cf8" stroke-width="4" stroke-linecap="round" />
              <path d="M 43,70 L 43,40" stroke="#818cf8" stroke-width="4" stroke-linecap="round" />
            </g>
          ` : ''}

          ${motionOverlaySvg}
        </svg>
      </div>
    `;
  }

  _generateFingerSegments(sign) {
    const f = sign.keyFingerStates;
    let svg = '';

    // Thumb
    if (f.thumb === 'OPEN') {
      svg += `<path d="M 55,85 C 45,78 40,70 38,62" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    } else {
      svg += `<path d="M 55,85 C 60,80 68,80 72,82" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    }

    // Index
    if (f.index === 'OPEN') {
      svg += `<path d="M 62,70 L 62,35" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    } else if (f.index === 'HALF') {
      svg += `<path d="M 62,70 C 62,50 50,55 52,65" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    } else {
      svg += `<path d="M 62,70 C 62,60 68,60 68,68" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    }

    // Middle
    if (f.middle === 'OPEN') {
      svg += `<path d="M 70,70 L 70,30" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    } else {
      svg += `<path d="M 70,70 C 70,60 76,60 76,68" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    }

    // Ring
    if (f.ring === 'OPEN') {
      svg += `<path d="M 78,70 L 78,35" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    } else {
      svg += `<path d="M 78,70 C 78,60 84,60 84,68" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    }

    // Pinky
    if (f.pinky === 'OPEN') {
      svg += `<path d="M 86,72 L 86,45" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    } else {
      svg += `<path d="M 86,72 C 86,63 90,63 90,70" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    }

    return svg;
  }
}
