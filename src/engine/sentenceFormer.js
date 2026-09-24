/**
 * Sentence Formation Engine (Stage 2 of SignBridge Pipeline)
 * Takes individual recognized sign language tokens/concepts (e.g. ['I', 'FEVER'])
 * and synthesizes grammatically fluent, natural English sentences tailored
 * to public service desk scenarios (Medical, Financial, Civic, Daily Life).
 */

export class SentenceFormer {
  constructor() {
    this.tokenBuffer = [];
    this.maxTokens = 8;
    this.tokenTimeoutMs = 6000; // Auto-flush if inactive for 6s
    this.lastTokenTimestamp = 0;
    this.onSentenceFormed = null;
    this.onTokensUpdated = null;
    this.autoCommit = true;
    this.commitDebounceTimer = null;

    this.sentenceHistory = [];
    this.grammarRules = this._initGrammarRules();
  }

  _normalizeToken(t) {
    if (!t) return '';
    const clean = t.toUpperCase().replace(/\s+/g, '_');
    const aliasMap = {
      'I_ME': 'I',
      'ME': 'I',
      'MY_MINE': 'MY',
      'MINE': 'MY',
      'YOURS': 'YOUR',
      'DRINK_WATER': 'WATER',
      'DRINK': 'WATER',
      'EAT_FOOD': 'FOOD',
      'EAT': 'FOOD',
      'PAIN_HURT': 'PAIN',
      'HURT': 'PAIN',
      'DOCTOR_MEDICAL': 'DOCTOR',
      'MEDICINE_PHARMACY': 'MEDICINE',
      'RECEIPT_FEE': 'RECEIPT',
      'SIGN_FORM': 'SIGN',
      'ACCOUNT_MONEY': 'ACCOUNT',
      'HELP_ASSIST': 'HELP',
      'GOOD_OK': 'GOOD',
      'GOOD_MORNING': 'GOOD_MORNING',
      'GOOD_AFTERNOON': 'GOOD_AFTERNOON'
    };
    return aliasMap[clean] || clean;
  }

  _initGrammarRules() {
    return [
      // --- HEALTH & MEDICAL RULES ---
      {
        tokens: ['I', 'HAVE', 'FEVER', 'NEED', 'DOCTOR'],
        sentence: 'I have a fever and need a medical checkup.',
        confidence: 0.99,
        category: 'medical'
      },
      {
        tokens: ['I', 'FEVER', 'NEED', 'DOCTOR'],
        sentence: 'I have a fever and need a medical checkup.',
        confidence: 0.99,
        category: 'medical'
      },
      {
        tokens: ['I', 'FEVER'],
        sentence: 'I have a fever and need a medical checkup.',
        confidence: 0.98,
        category: 'medical'
      },
      {
        tokens: ['I', 'HAVE', 'FEVER'],
        sentence: 'I have a fever and need a medical checkup.',
        confidence: 0.99,
        category: 'medical'
      },
      {
        tokens: ['I', 'HAVE', 'PAIN'],
        sentence: 'I am in pain and require medical assistance.',
        confidence: 0.98,
        category: 'medical'
      },
      {
        tokens: ['I', 'PAIN'],
        sentence: 'I am experiencing pain and need medical care.',
        confidence: 0.97,
        category: 'medical'
      },
      {
        tokens: ['PAIN'],
        sentence: 'I am experiencing pain here.',
        confidence: 0.95,
        category: 'medical'
      },
      {
        tokens: ['FEVER'],
        sentence: 'I have a high fever.',
        confidence: 0.95,
        category: 'medical'
      },
      {
        tokens: ['I', 'WANT', 'WATER'],
        sentence: 'I would like some drinking water, please.',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['I', 'NEED', 'WATER'],
        sentence: 'I need some drinking water, please.',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['WATER'],
        sentence: 'Where can I find drinking water / restroom?',
        confidence: 0.94,
        category: 'general'
      },
      {
        tokens: ['I', 'WANT', 'FOOD'],
        sentence: 'I would like to have some food / meal.',
        confidence: 0.98,
        category: 'food'
      },
      {
        tokens: ['FOOD'],
        sentence: 'Where is the food / cafeteria counter?',
        confidence: 0.94,
        category: 'food'
      },
      {
        tokens: ['I', 'NEED', 'HELP'],
        sentence: 'I need assistance and guidance, please.',
        confidence: 0.99,
        category: 'general'
      },
      {
        tokens: ['WHERE', 'DOCTOR'],
        sentence: 'Where can I find the doctor or consultation room?',
        confidence: 0.98,
        category: 'medical'
      },
      {
        tokens: ['WHERE', 'RESTROOM'],
        sentence: 'Where is the restroom facility located?',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['WHAT', 'TIME'],
        sentence: 'What is the current time or appointment slot?',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['MY', 'NAME'],
        sentence: 'My name is on the identity document.',
        confidence: 0.96,
        category: 'general'
      },
      {
        tokens: ['WHAT', 'YOUR', 'NAME'],
        sentence: 'What is your name? Please introduce yourself.',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['PLEASE', 'HELP'],
        sentence: 'Please, kindly assist me with this service.',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['PLEASE', 'WAIT'],
        sentence: 'Please wait for a moment while I prepare.',
        confidence: 0.97,
        category: 'general'
      },
      {
        tokens: ['THANK_YOU', 'HELP'],
        sentence: 'Thank you very much for all your help and support!',
        confidence: 0.99,
        category: 'general'
      },
      {
        tokens: ['I', 'INJURY'],
        sentence: 'I have an injury that needs immediate medical dressing.',
        confidence: 0.98,
        category: 'medical'
      },
      {
        tokens: ['INJURY'],
        sentence: 'I have an injury that requires medical care.',
        confidence: 0.95,
        category: 'medical'
      },
      {
        tokens: ['I', 'NEED', 'DOCTOR'],
        sentence: 'I need to see a doctor or medical officer urgently.',
        confidence: 0.99,
        category: 'medical'
      },
      {
        tokens: ['NEED', 'DOCTOR'],
        sentence: 'I need to consult a doctor urgently.',
        confidence: 0.98,
        category: 'medical'
      },
      {
        tokens: ['DOCTOR'],
        sentence: 'I need to consult a doctor.',
        confidence: 0.95,
        category: 'medical'
      },
      {
        tokens: ['I', 'NEED', 'MEDICINE'],
        sentence: 'I need to collect my prescribed medicine from the pharmacy.',
        confidence: 0.98,
        category: 'medical'
      },
      {
        tokens: ['NEED', 'MEDICINE'],
        sentence: 'I need my prescribed medication, please.',
        confidence: 0.97,
        category: 'medical'
      },
      {
        tokens: ['I', 'CRY'],
        sentence: 'I am experiencing severe pain and distress.',
        confidence: 0.96,
        category: 'medical'
      },
      {
        tokens: ['CRY'],
        sentence: 'I am in severe distress and pain.',
        confidence: 0.94,
        category: 'medical'
      },
      {
        tokens: ['I', 'FEDUP'],
        sentence: 'I have been waiting for a very long time.',
        confidence: 0.95,
        category: 'medical'
      },
      {
        tokens: ['FEDUP'],
        sentence: 'I am exhausted from the long wait.',
        confidence: 0.92,
        category: 'medical'
      },
      {
        tokens: ['MEDICINE'],
        sentence: 'I need to collect my prescribed medication from the pharmacy.',
        confidence: 0.95,
        category: 'medical'
      },
      {
        tokens: ['EMERGENCY', 'PAIN', 'DOCTOR'],
        sentence: 'Emergency assistance needed! I am in severe pain, please call the doctor immediately!',
        confidence: 0.99,
        category: 'medical'
      },
      {
        tokens: ['EMERGENCY', 'PAIN_HURT', 'DOCTOR'],
        sentence: 'Emergency assistance needed! I am in severe pain, please call the doctor immediately!',
        confidence: 0.99,
        category: 'medical'
      },
      {
        tokens: ['EMERGENCY'],
        sentence: 'This is an urgent emergency, please help immediately.',
        confidence: 0.99,
        category: 'medical'
      },

      // --- FINANCIAL & BANKING RULES ---
      {
        tokens: ['I', 'WANT', 'DEPOSIT', 'MONEY', 'RECEIPT'],
        sentence: 'I want to deposit cash into my account, please provide a deposit receipt.',
        confidence: 0.99,
        category: 'financial'
      },
      {
        tokens: ['I', 'DEPOSIT', 'MONEY', 'RECEIPT'],
        sentence: 'I want to deposit cash into my account, please provide a deposit receipt.',
        confidence: 0.99,
        category: 'financial'
      },
      {
        tokens: ['I', 'WANT', 'DEPOSIT', 'MONEY'],
        sentence: 'I would like to make a cash deposit into my bank account.',
        confidence: 0.98,
        category: 'financial'
      },
      {
        tokens: ['I', 'DEPOSIT', 'MONEY'],
        sentence: 'I want to deposit money into my bank account.',
        confidence: 0.98,
        category: 'financial'
      },
      {
        tokens: ['DEPOSIT', 'MONEY'],
        sentence: 'I would like to deposit money into my account.',
        confidence: 0.97,
        category: 'financial'
      },
      {
        tokens: ['I', 'WITHDRAW', 'MONEY'],
        sentence: 'I would like to withdraw cash from my bank account.',
        confidence: 0.98,
        category: 'financial'
      },
      {
        tokens: ['WITHDRAW', 'MONEY'],
        sentence: 'I would like to withdraw cash from my bank account.',
        confidence: 0.97,
        category: 'financial'
      },
      {
        tokens: ['ACCOUNT', 'MONEY'],
        sentence: 'I want to check my bank account balance and deposit funds.',
        confidence: 0.96,
        category: 'financial'
      },
      {
        tokens: ['ACCOUNT', 'BUDGET'],
        sentence: 'I am inquiring about account fees, budget, and charges.',
        confidence: 0.96,
        category: 'financial'
      },
      {
        tokens: ['BUDGET'],
        sentence: 'I am inquiring about fees and budget breakdown.',
        confidence: 0.94,
        category: 'financial'
      },
      {
        tokens: ['ID_CARD'],
        sentence: 'Here is my official identity card for account verification.',
        confidence: 0.96,
        category: 'financial'
      },
      {
        tokens: ['KEY'],
        sentence: 'I need safe deposit locker key access.',
        confidence: 0.95,
        category: 'financial'
      },
      {
        tokens: ['FORM', 'SIGN'],
        sentence: 'Where do I need to sign this form?',
        confidence: 0.97,
        category: 'financial'
      },
      {
        tokens: ['SIGN_FORM'],
        sentence: 'I have signed the document / Where do I sign?',
        confidence: 0.95,
        category: 'financial'
      },
      {
        tokens: ['RECEIPT_FEE'],
        sentence: 'Please provide an official printed receipt for this transaction.',
        confidence: 0.96,
        category: 'financial'
      },

      // --- CIVIC, GOVERNMENT & GENERAL INQUIRIES ---
      {
        tokens: ['WHAT', 'YOUR', 'NAME'],
        sentence: 'What is your name? / Please verify my identity.',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['MY', 'NAME'],
        sentence: 'My name is on the identity document.',
        confidence: 0.95,
        category: 'general'
      },
      {
        tokens: ['WHERE', 'LOCATION'],
        sentence: 'Where is this office located / Can you guide me with directions?',
        confidence: 0.97,
        category: 'civic'
      },
      {
        tokens: ['WHERE', 'WATER'],
        sentence: 'Where can I find drinking water or the restroom facility?',
        confidence: 0.97,
        category: 'civic'
      },
      {
        tokens: ['HELLO', 'GOOD_MORNING'],
        sentence: 'Hello, good morning! Hope you are well.',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['HELLO', 'GOOD_AFTERNOON'],
        sentence: 'Hello, good afternoon!',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['HELLO', 'THANK_YOU'],
        sentence: 'Hello, thank you very much for your kind support!',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['HELLO'],
        sentence: 'Hello, good day!',
        confidence: 0.95,
        category: 'general'
      },
      {
        tokens: ['GOOD_MORNING'],
        sentence: 'Good morning!',
        confidence: 0.95,
        category: 'general'
      },
      {
        tokens: ['GOOD_AFTERNOON'],
        sentence: 'Good afternoon!',
        confidence: 0.95,
        category: 'general'
      },
      {
        tokens: ['THANK_YOU'],
        sentence: 'Thank you very much for your assistance!',
        confidence: 0.96,
        category: 'general'
      },
      {
        tokens: ['PLEASE', 'HELP'],
        sentence: 'Please, kindly assist me with this service.',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['HELP'],
        sentence: 'I need assistance and guidance, please.',
        confidence: 0.95,
        category: 'general'
      },
      {
        tokens: ['DEAF_ASSIST'],
        sentence: 'I am Deaf. Please use text or visual sign prompts on the screen.',
        confidence: 0.99,
        category: 'general'
      },
      {
        tokens: ['HELP_ASSIST'],
        sentence: 'I need assistance with this service counter application.',
        confidence: 0.98,
        category: 'general'
      },
      {
        tokens: ['YES'],
        sentence: 'Yes, that is correct and confirmed.',
        confidence: 0.95,
        category: 'general'
      },
      {
        tokens: ['NO'],
        sentence: 'No, that is not what I need.',
        confidence: 0.95,
        category: 'general'
      },
      {
        tokens: ['GOOD_OK'],
        sentence: 'Everything is good, confirmed and completed.',
        confidence: 0.95,
        category: 'general'
      }
    ];
  }

  /**
   * Add a recognized concept token to the buffer
   * (e.g. 'I', 'FEVER', 'NEED', 'DOCTOR')
   */
  addToken(token, spokenText = null) {
    if (!token) return;
    const cleanToken = token.toUpperCase().replace(/\s+/g, '_');

    // Avoid immediate duplicate token repetition within 1.2s
    const now = performance.now();
    const lastToken = this.tokenBuffer[this.tokenBuffer.length - 1];
    if (lastToken && lastToken.token === cleanToken && (now - this.lastTokenTimestamp) < 1200) {
      return;
    }

    this.tokenBuffer.push({
      token: cleanToken,
      spokenText: spokenText || token.replace(/_/g, ' '),
      timestamp: now
    });

    if (this.tokenBuffer.length > this.maxTokens) {
      this.tokenBuffer.shift();
    }

    this.lastTokenTimestamp = now;

    if (this.onTokensUpdated) {
      this.onTokensUpdated(this.getTokens());
    }

    // Debounce sentence formation if autoCommit is on
    if (this.autoCommit) {
      if (this.commitDebounceTimer) clearTimeout(this.commitDebounceTimer);
      this.commitDebounceTimer = setTimeout(() => {
        this.formSentence();
      }, 1400);
    }
  }

  /**
   * Add an arbitrary fingerspelled word or text phrase directly into the sentence builder
   */
  addWord(wordText) {
    if (!wordText || !wordText.trim()) return;
    const cleanWord = wordText.trim();
    this.addToken(cleanWord, cleanWord);
  }

  getTokens() {
    return this.tokenBuffer.map(t => ({
      id: t.token,
      label: t.spokenText || t.token.replace(/_/g, ' '),
      timestamp: t.timestamp
    }));
  }

  hasTokens() {
    return this.tokenBuffer.length > 0;
  }

  moveToken(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.tokenBuffer.length) return;
    if (toIndex < 0 || toIndex >= this.tokenBuffer.length) return;
    const item = this.tokenBuffer.splice(fromIndex, 1)[0];
    this.tokenBuffer.splice(toIndex, 0, item);
    if (this.onTokensUpdated) {
      this.onTokensUpdated(this.getTokens());
    }
  }

  removeToken(index) {
    if (index >= 0 && index < this.tokenBuffer.length) {
      this.tokenBuffer.splice(index, 1);
      if (this.onTokensUpdated) {
        this.onTokensUpdated(this.getTokens());
      }
    }
  }

  clear() {
    this.clearTokens();
  }

  clearTokens() {
    this.tokenBuffer = [];
    if (this.commitDebounceTimer) clearTimeout(this.commitDebounceTimer);
    if (this.onTokensUpdated) {
      this.onTokensUpdated([]);
    }
  }

  setAutoCommit(val) {
    this.autoCommit = Boolean(val);
  }

  forceCommit() {
    return this.formSentence();
  }

  getSentenceHistory() {
    return [...this.sentenceHistory];
  }

  /**
   * Synthesize tokens into a grammatically fluent sentence
   */
  formSentence() {
    if (this.tokenBuffer.length === 0) return null;

    const tokenList = this.tokenBuffer.map(t => this._normalizeToken(t.token));
    let matchedRule = null;

    // 1. First priority: Exact full token match
    const exactRule = this.grammarRules.find(r => {
      const normRuleTokens = r.tokens.map(tok => this._normalizeToken(tok));
      return normRuleTokens.length === tokenList.length &&
        normRuleTokens.every((tok, idx) => tok === tokenList[idx]);
    });

    if (exactRule) {
      matchedRule = exactRule;
    } else {
      // 2. Second priority: Largest contiguous sub-sequence
      for (let len = tokenList.length - 1; len >= 2; len--) {
        for (let start = 0; start <= tokenList.length - len; start++) {
          const sliceTokens = tokenList.slice(start, start + len);
          const rule = this.grammarRules.find(r => {
            const normRuleTokens = r.tokens.map(tok => this._normalizeToken(tok));
            return normRuleTokens.length === sliceTokens.length &&
              normRuleTokens.every((tok, idx) => tok === sliceTokens[idx]);
          });
          if (rule) {
            matchedRule = rule;
            break;
          }
        }
        if (matchedRule) break;
      }

      // 3. Third priority: Suffix sub-sequence
      if (!matchedRule) {
        for (let len = tokenList.length; len >= 1; len--) {
          const subTokens = tokenList.slice(-len);
          const rule = this.grammarRules.find(r => {
            const normRuleTokens = r.tokens.map(tok => this._normalizeToken(tok));
            return normRuleTokens.length === subTokens.length &&
              normRuleTokens.every((tok, idx) => tok === subTokens[idx]);
          });

          if (rule) {
            matchedRule = rule;
            break;
          }
        }
      }
    }

    let sentence = '';
    let confidence = 0.90;
    let category = 'general';

    if (matchedRule) {
      sentence = matchedRule.sentence;
      confidence = matchedRule.confidence;
      category = matchedRule.category;
    } else {
      // Fallback natural sentence synthesizer
      const words = this.tokenBuffer.map(t => t.spokenText || t.token.replace(/_/g, ' '));
      sentence = this._naturalFallback(words);
    }

    const result = {
      tokens: [...tokenList],
      sentence: sentence,
      confidence: Math.round(confidence * 100),
      category: category,
      timestamp: new Date().toLocaleTimeString()
    };

    // Save to history
    this.sentenceHistory.unshift({ ...result, id: Date.now() });
    if (this.sentenceHistory.length > 20) {
      this.sentenceHistory.pop();
    }

    if (this.onSentenceFormed) {
      this.onSentenceFormed(result);
    }

    // Reset buffer after successfully generating the sentence
    this.clearTokens();
    return result;
  }

  _naturalFallback(words) {
    if (words.length === 1) {
      const w = words[0].trim();
      return w.endsWith('.') || w.endsWith('?') || w.endsWith('!') ? w : `${w}.`;
    }
    const joined = words.join(' ');
    const formatted = joined.charAt(0).toUpperCase() + joined.slice(1);
    return formatted.endsWith('.') || formatted.endsWith('?') || formatted.endsWith('!') ? formatted : `${formatted}.`;
  }
}

