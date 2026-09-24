/**
 * Speech-to-Text (STT) Engine for Two-Way Counter Staff Communication
 * Captures staff speech, transcribes to text, and parses sign language keywords.
 */

import { VOCABULARY } from '../data/vocabulary.js';

export class STTEngine {
  constructor(onTranscriptCallback, onKeywordMatchCallback) {
    this.onTranscriptCallback = onTranscriptCallback;
    this.onKeywordMatchCallback = onKeywordMatchCallback;

    this.recognition = null;
    this.isListening = false;
    this.isSupported = false;

    this._initRecognition();
  }

  _initRecognition() {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn('SpeechRecognition API not supported in this browser.');
      this.isSupported = false;
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognitionClass();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      const currentText = finalTranscript || interimTranscript;

      if (this.onTranscriptCallback) {
        this.onTranscriptCallback({
          text: currentText,
          isFinal: Boolean(finalTranscript)
        });
      }

      if (finalTranscript) {
        this._matchVocabularyKeywords(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('STT Error:', event.error);
      if (event.error === 'not-allowed') {
        this.isListening = false;
      }
    };

    this.recognition.onend = () => {
      // Auto restart if still supposed to be listening
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch (e) {
          this.isListening = false;
        }
      }
    };
  }

  startListening() {
    if (!this.isSupported || !this.recognition) return false;
    try {
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Recognition already started or error', e);
      return false;
    }
  }

  stopListening() {
    if (!this.recognition) return;
    this.isListening = false;
    try {
      this.recognition.stop();
    } catch (e) {}
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      return this.startListening();
    }
  }

  /**
   * Process manual staff text input (simulated voice or typing)
   */
  processManualStaffInput(text) {
    if (!text) return;
    if (this.onTranscriptCallback) {
      this.onTranscriptCallback({ text, isFinal: true });
    }
    this._matchVocabularyKeywords(text);
  }

  /**
   * Scan staff sentence for sign language vocabulary matches to trigger visual sign animations
   */
  _matchVocabularyKeywords(sentence) {
    if (!sentence) return;
    const lower = sentence.toLowerCase();

    // Check vocabulary items
    for (const sign of VOCABULARY) {
      if (sign.scenarioKeywords && sign.scenarioKeywords.some(kw => lower.includes(kw.toLowerCase()))) {
        if (this.onKeywordMatchCallback) {
          this.onKeywordMatchCallback(sign);
        }
        return sign;
      }
    }

    // Direct name match
    for (const sign of VOCABULARY) {
      if (lower.includes(sign.name.toLowerCase().split('/')[0].trim())) {
        if (this.onKeywordMatchCallback) {
          this.onKeywordMatchCallback(sign);
        }
        return sign;
      }
    }

    return null;
  }
}
