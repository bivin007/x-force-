/**
 * Text-to-Speech (TTS) & Acoustic Feedback Engine
 * Handles speech synthesis for Deaf visitor gesture translation
 * and Web Audio API audio confirmation cues.
 */

export class TTSEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.autoSpeak = true;
    this.audioContext = null;
    this.isSpeaking = false;
    this.onStateChange = null;

    this._initVoices();
    this._initAudioContext();
  }

  _initVoices() {
    if (!this.synth) return;

    const load = () => {
      this.voices = this.synth.getVoices();
      // Select best default natural English voice
      const preferred = this.voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')) && v.lang.startsWith('en'))
        || this.voices.find(v => v.lang.startsWith('en'))
        || this.voices[0];
      this.selectedVoice = preferred;
    };

    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
  }

  _initAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  getVoices() {
    return this.voices;
  }

  setVoice(voiceURI) {
    const found = this.voices.find(v => v.voiceURI === voiceURI);
    if (found) this.selectedVoice = found;
  }

  setRate(val) {
    this.rate = Math.max(0.5, Math.min(2.0, val));
  }

  setPitch(val) {
    this.pitch = Math.max(0.5, Math.min(2.0, val));
  }

  setVolume(val) {
    this.volume = Math.max(0.0, Math.min(1.0, val));
  }

  toggleAutoSpeak(enabled) {
    this.autoSpeak = enabled;
  }

  /**
   * Speak translated text aloud in selected target language
   */
  speak(text, priority = false, langTag = null) {
    if (!this.synth || !text) return;
    if (!this.autoSpeak && !priority) return;

    if (priority) {
      this.synth.cancel();
    }

    // Play subtle soft chime before speaking
    this.playConfirmationChime();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select voice matching requested language if provided
    if (langTag && this.voices.length > 0) {
      const cleanLang = langTag.toLowerCase();
      const baseCode = cleanLang.substring(0, 2);
      const matchVoice = this.voices.find(v => v.lang.toLowerCase() === cleanLang)
        || this.voices.find(v => v.lang.toLowerCase().startsWith(baseCode));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
      utterance.lang = langTag;
    } else if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChange) this.onStateChange({ isSpeaking: true, text });
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange({ isSpeaking: false, text: '' });
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange({ isSpeaking: false, text: '' });
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) this.synth.cancel();
    this.isSpeaking = false;
  }

  /**
   * Soft harmonic chime confirmation tone (Web Audio API)
   */
  playConfirmationChime() {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    try {
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.08); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      // Audio context silenced or blocked
    }
  }

  /**
   * Alert chime for Emergency signs
   */
  playEmergencyAlert() {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    try {
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.15);
      osc.frequency.linearRampToValueAtTime(700, now + 0.30);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.40);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.40);
    } catch (e) {}
  }
}
