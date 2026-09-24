/**
 * Interactive Sign & ASL Alphabet Dictionary & Dataset Explorer View
 * Allows visitors, staff, and judges to explore all 26 ASL alphabet signs
 * and 61 Video Dataset classes with rich interactive video previews,
 * joint kinematics, translation actions, and live stream inference.
 */

import { VOCABULARY, SIGN_CATEGORIES } from '../data/vocabulary.js';
import confetti from 'canvas-confetti';

export class DictionaryView {
  constructor(containerElement, onPracticeSign, onStreamVideo = null) {
    this.container = containerElement;
    this.onPracticeSign = onPracticeSign;
    this.onStreamVideo = onStreamVideo;
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.activeDetailSignId = null;
  }

  findSign(signId) {
    if (!signId) return null;
    const target = String(signId).trim();
    return VOCABULARY.find(v => 
      v.id === target ||
      v.id.toUpperCase() === target.toUpperCase() ||
      v.id === `SIGN_${target.toUpperCase()}` ||
      v.id.replace('SIGN_', '') === target.toUpperCase() ||
      v.name.toLowerCase() === target.toLowerCase() ||
      (v.videoPath && v.videoPath.toLowerCase().includes(target.toLowerCase()))
    );
  }

  openSignDetail(signId) {
    const sign = this.findSign(signId);
    if (sign) {
      this.activeDetailSignId = sign.id;
      this.render();
    }
  }

  closeSignDetail() {
    this.activeDetailSignId = null;
    this.render();
  }

  render() {
    if (this.activeDetailSignId) {
      this._renderDetailView(this.activeDetailSignId);
    } else {
      this._renderGridView();
    }
  }

  _renderGridView() {
    this.container.innerHTML = `
      <div class="dictionary-view-container animate-fade-in">
        <!-- Dictionary Header -->
        <div class="dictionary-header">
          <div>
            <h2 class="dict-title">Sign Language & 61-Video Dataset Explorer</h2>
            <p class="dict-subtitle">Explore 26 ASL Alphabet signs + 61 Video Dataset classes with video previews & live stream testing.</p>
          </div>
          <div class="dict-search-wrapper">
            <input type="text" id="dict-search-input" class="dict-search-input" placeholder="Search signs, letters, or keywords..." value="${this.searchQuery}" />
          </div>
        </div>

        <!-- Category Filters -->
        <div class="dict-category-filters">
          <button class="cat-pill ${this.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">All (${VOCABULARY.length})</button>
          ${Object.values(SIGN_CATEGORIES).map(cat => {
            const count = VOCABULARY.filter(v => v.category === cat.id).length;
            if (count === 0) return '';
            return `
              <button class="cat-pill ${this.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                ${cat.name} (${count})
              </button>
            `;
          }).join('')}
        </div>

        <!-- Sign Cards Grid -->
        <div class="dict-cards-grid" id="dict-cards-grid">
          ${this._renderCards()}
        </div>
      </div>
    `;

    this._bindGridEvents();
  }

  _renderCards() {
    const filtered = VOCABULARY.filter(item => {
      const matchCat = this.selectedCategory === 'all' || item.category === this.selectedCategory;
      const matchSearch = !this.searchQuery ||
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.spokenText.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (item.letter && item.letter.toLowerCase() === this.searchQuery.toLowerCase()) ||
        (item.scenarioKeywords && item.scenarioKeywords.some(k => k.toLowerCase().includes(this.searchQuery.toLowerCase())));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      return `
        <div class="dict-empty-state">
          <p>No matching sign language gestures, videos, or ASL letters found.</p>
        </div>
      `;
    }

    return filtered.map(sign => {
      const isAlphabet = sign.category === 'asl_alphabet' || Boolean(sign.letter);
      const hasVideo = Boolean(sign.videoPath);
      return `
        <div class="dict-card ${isAlphabet ? 'dict-card-alphabet' : ''} ${hasVideo ? 'dict-card-video' : ''}" data-sign-id="${sign.id}">
          <div class="dict-card-top">
            <span class="dict-category-tag category-${sign.category}">${isAlphabet ? 'ASL LETTER' : sign.category.toUpperCase()}</span>
            <div class="dict-card-tags">
              ${hasVideo ? '<span class="dict-video-tag">🎬 Video Clip</span>' : ''}
              <span class="dict-hands-badge">${sign.handsRequired === 2 ? '2 Hands' : '1 Hand'}</span>
            </div>
          </div>

          <div class="dict-card-main-row">
            ${isAlphabet ? `<div class="card-letter-badge">${sign.letter || sign.spokenText}</div>` : ''}
            <div>
              <h4 class="dict-card-name">${sign.name}</h4>
              <p class="dict-card-spoken">"${sign.spokenText}"</p>
            </div>
          </div>

          <p class="dict-card-desc">${sign.description}</p>
          <div class="dict-card-footer">
            ${hasVideo ? `
              <button class="btn-stream-video" data-action="stream-video" data-video-path="${sign.videoPath}" data-sign-id="${sign.id}" title="Run Live Stream Inference in Video Engine">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Stream Video
              </button>
            ` : `
              <button class="btn-practice" data-action="practice" data-sign-id="${sign.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Practice Live
              </button>
            `}
            <button class="btn-details" data-action="details" data-sign-id="${sign.id}">
              ${hasVideo ? 'Clip & Details' : 'Keypoints'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  _renderDetailView(signId) {
    const sign = this.findSign(signId);
    if (!sign) {
      this._renderGridView();
      return;
    }

    const currentIndex = VOCABULARY.findIndex(v => v.id === sign.id);
    const prevSign = currentIndex > 0 ? VOCABULARY[currentIndex - 1] : VOCABULARY[VOCABULARY.length - 1];
    const nextSign = currentIndex < VOCABULARY.length - 1 ? VOCABULARY[currentIndex + 1] : VOCABULARY[0];
    const hasVideo = Boolean(sign.videoPath);

    this.container.innerHTML = `
      <div class="dict-detail-page animate-slide-up">
        <!-- Top Navigation Bar -->
        <div class="detail-top-nav">
          <button id="btn-back-to-grid" class="btn-back-nav">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>Back to Signs & Dataset Catalog</span>
          </button>

          <div class="detail-pagination">
            <button class="btn-page-nav" data-action="nav-sign" data-sign-id="${prevSign.id}" title="Previous Sign: ${prevSign.name}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              <span>${prevSign.name.substring(0, 16)}</span>
            </button>
            <span class="page-current">${currentIndex + 1} / ${VOCABULARY.length}</span>
            <button class="btn-page-nav" data-action="nav-sign" data-sign-id="${nextSign.id}" title="Next Sign: ${nextSign.name}">
              <span>${nextSign.name.substring(0, 16)}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>

        <!-- Main Detail Content Grid -->
        <div class="detail-main-layout">
          
          <!-- LEFT COLUMN: VIDEO CLIP PLAYER OR 2D ASL PLACARD -->
          <div class="detail-media-column">
            ${hasVideo ? `
              <div class="detail-video-wrapper">
                <video id="dict-player-video" src="${sign.videoPath}" controls autoplay loop muted playsinline class="detail-hd-video"></video>
                
                <div class="video-playback-controls">
                  <span class="speed-label">Playback Speed:</span>
                  <button class="btn-speed active" data-speed="1.0">1.0x</button>
                  <button class="btn-speed" data-speed="0.5">0.5x (Slow-Mo)</button>
                  <button class="btn-speed" data-speed="1.5">1.5x</button>
                </div>
                
                <div class="dataset-source-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                  <span>Dataset Stream: <code>${sign.videoPath}</code></span>
                </div>
              </div>
            ` : `
              <div class="detail-asl-placard">
                <div class="placard-large-letter">${sign.letter || sign.spokenText}</div>
                <div class="placard-caption">ASL Fingerspelling Handshape</div>
              </div>
            `}
          </div>

          <!-- RIGHT COLUMN: DATASET METADATA & JOINT KINEMATICS -->
          <div class="detail-info-column">
            <div class="detail-header-row">
              <div class="detail-title-group">
                <span class="dict-category-tag category-${sign.category}">${sign.category.toUpperCase()}</span>
                <h3 class="detail-sign-name">${sign.name}</h3>
              </div>
              <span class="detail-hands-tag">${sign.handsRequired === 2 ? '2-Handed Gesture' : 'Single Hand Pose'}</span>
            </div>

            <div class="detail-meta-card">
              <div class="meta-row">
                <span class="meta-label">Spoken Translation (TTS):</span>
                <span class="meta-val highlight-cyan">"${sign.spokenText}"</span>
              </div>

              <div class="meta-row">
                <span class="meta-label">Public Desk Response Action:</span>
                <span class="meta-val">"${sign.counterResponse || 'Acknowledged and documented.'}"</span>
              </div>

              <div class="meta-row">
                <span class="meta-label">Service Context:</span>
                <span class="meta-val">${sign.serviceContext || 'Public Service Counter interaction.'}</span>
              </div>

              <div class="meta-row">
                <span class="meta-label">Kinematic Movement Guide:</span>
                <span class="meta-val">${sign.visualGuide || sign.description}</span>
              </div>
            </div>

            <div class="detail-kinematics-card">
              <h4 class="kinematics-title">Hand Joint & Finger Flexion States</h4>
              <div class="finger-states-grid">
                <div class="finger-state-box">
                  <span class="finger-name">Thumb</span>
                  <span class="finger-badge badge-${(sign.keyFingerStates?.thumb || 'OPEN').toLowerCase()}">${sign.keyFingerStates?.thumb || 'OPEN'}</span>
                </div>
                <div class="finger-state-box">
                  <span class="finger-name">Index</span>
                  <span class="finger-badge badge-${(sign.keyFingerStates?.index || 'OPEN').toLowerCase()}">${sign.keyFingerStates?.index || 'OPEN'}</span>
                </div>
                <div class="finger-state-box">
                  <span class="finger-name">Middle</span>
                  <span class="finger-badge badge-${(sign.keyFingerStates?.middle || 'OPEN').toLowerCase()}">${sign.keyFingerStates?.middle || 'OPEN'}</span>
                </div>
                <div class="finger-state-box">
                  <span class="finger-name">Ring</span>
                  <span class="finger-badge badge-${(sign.keyFingerStates?.ring || 'OPEN').toLowerCase()}">${sign.keyFingerStates?.ring || 'OPEN'}</span>
                </div>
                <div class="finger-state-box">
                  <span class="finger-name">Pinky</span>
                  <span class="finger-badge badge-${(sign.keyFingerStates?.pinky || 'OPEN').toLowerCase()}">${sign.keyFingerStates?.pinky || 'OPEN'}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="detail-actions-bar">
              ${hasVideo ? `
                <button class="btn-action-highlight btn-stream-action" data-action="stream-video" data-video-path="${sign.videoPath}" data-sign-id="${sign.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  <span>Run Live Stream Inference</span>
                </button>
              ` : `
                <button class="btn-action-highlight btn-practice-action" data-action="practice" data-sign-id="${sign.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  <span>Practice with Live Webcam</span>
                </button>
              `}
              <button class="btn-action-ghost" data-action="practice" data-sign-id="${sign.id}">
                <span>Practice Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindDetailEvents();
  }

  _bindGridEvents() {
    const searchInput = this.container.querySelector('#dict-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        const grid = this.container.querySelector('#dict-cards-grid');
        if (grid) grid.innerHTML = this._renderCards();
      });
    }

    const pills = this.container.querySelectorAll('.cat-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        pills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedCategory = e.currentTarget.dataset.cat;
        const grid = this.container.querySelector('#dict-cards-grid');
        if (grid) grid.innerHTML = this._renderCards();
      });
    });

    this.container.addEventListener('click', (e) => {
      const streamBtn = e.target.closest('[data-action="stream-video"]');
      if (streamBtn) {
        const videoPath = streamBtn.dataset.videoPath;
        const signId = streamBtn.dataset.signId;
        if (this.onStreamVideo) {
          this.onStreamVideo(videoPath, signId);
        }
        return;
      }

      const practiceBtn = e.target.closest('[data-action="practice"]');
      if (practiceBtn) {
        const signId = practiceBtn.dataset.signId;
        if (this.onPracticeSign) this.onPracticeSign(signId);
        return;
      }

      const detailBtn = e.target.closest('[data-action="details"]');
      if (detailBtn) {
        const signId = detailBtn.dataset.signId;
        this.openSignDetail(signId);
        return;
      }

      // Clicking directly on a card opens details
      const card = e.target.closest('.dict-card');
      if (card && !e.target.closest('button')) {
        const signId = card.dataset.signId;
        this.openSignDetail(signId);
      }
    });
  }

  _bindDetailEvents() {
    const backBtn = this.container.querySelector('#btn-back-to-grid');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.closeSignDetail();
      });
    }

    const videoEl = this.container.querySelector('#dict-player-video');
    const speedBtns = this.container.querySelectorAll('.btn-speed');
    speedBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        speedBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const speed = parseFloat(e.currentTarget.dataset.speed);
        if (videoEl) videoEl.playbackRate = speed;
      });
    });

    this.container.addEventListener('click', (e) => {
      const navBtn = e.target.closest('[data-action="nav-sign"]');
      if (navBtn) {
        const signId = navBtn.dataset.signId;
        this.openSignDetail(signId);
        return;
      }

      const streamBtn = e.target.closest('[data-action="stream-video"]');
      if (streamBtn) {
        const videoPath = streamBtn.dataset.videoPath;
        const signId = streamBtn.dataset.signId;
        if (this.onStreamVideo) {
          this.onStreamVideo(videoPath, signId);
        }
        return;
      }

      const practiceBtn = e.target.closest('[data-action="practice"]');
      if (practiceBtn) {
        const signId = practiceBtn.dataset.signId;
        if (this.onPracticeSign) this.onPracticeSign(signId);
        return;
      }
    });
  }

  triggerSuccessCelebration() {
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.8 }
      });
    } catch (e) {}
  }
}


