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
    this.currentEmotion = null; // { id: 'PAIN', emoji: '😣', ... }

    this.grammarRules = this._initGrammarRules();
  }

  setEmotion(emotionData) {
    this.currentEmotion = emotionData;
  }

  _initGrammarRules() {
    return [
      // --- HEALTH & MEDICAL RULES ---
      {
        tokens: ['I', 'FEVER'],
        sentence: 'I have a fever and need a medical checkup.',
        confidence: 0.98,
        category: 'medical'
      },
      {
        tokens: ['FEVER'],
        sentence: 'I have a high fever.',
        confidence: 0.95,
        category: 'medical'
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
        tokens: ['DOCTOR'],
        sentence: 'I need to consult a doctor.',
        confidence: 0.95,
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
        tokens: ['EMERGENCY'],
        sentence: 'This is an urgent emergency, please help immediately.',
        confidence: 0.99,
        category: 'medical'
      },

      // --- FINANCIAL & BANKING RULES ---
      {
        tokens: ['I', 'WANT', 'DEPOSIT', 'MONEY'],
        sentence: 'I would like to make a cash deposit into my bank account.',
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
        tokens: ['WHAT_IS_YOUR_NAME'],
        sentence: 'What is your name? / Identity verification.',
        confidence: 0.96,
        category: 'general'
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
        tokens: ['HUG'],
        sentence: 'Warm greetings and regards.',
        confidence: 0.92,
        category: 'general'
      },
      {
        tokens: ['INTERVIEW'],
        sentence: 'I am here for my scheduled appointment or interview.',
        confidence: 0.95,
        category: 'civic'
      },
      {
        tokens: ['EXAM'],
        sentence: 'I am here for document examination and verification.',
        confidence: 0.95,
        category: 'civic'
      },
      {
        tokens: ['MATHS'],
        sentence: 'Please calculate the total amount and billing figures for me.',
        confidence: 0.95,
        category: 'civic'
      },
      {
        tokens: ['WRITER'],
        sentence: 'I need assistance from a scribe to write and fill this form.',
        confidence: 0.96,
        category: 'civic'
      },
      {
        tokens: ['TEMPLE'],
        sentence: 'Where is the community hall or temple located?',
        confidence: 0.94,
        category: 'civic'
      },
      {
        tokens: ['KARNATAKA'],
        sentence: 'I am applying under Karnataka state jurisdiction.',
        confidence: 0.95,
        category: 'civic'
      },
      {
        tokens: ['UMBRELLA'],
        sentence: 'Inquiring about lost umbrella and weather assistance.',
        confidence: 0.93,
        category: 'civic'
      },
      {
        tokens: ['KNIFE'],
        sentence: 'Security alert: sharp object reported.',
        confidence: 0.95,
        category: 'civic'
      },
      {
        tokens: ['MAN'],
        sentence: 'The gentleman accompanying me is my representative.',
        confidence: 0.92,
        category: 'civic'
      },
      {
        tokens: ['WIFE'],
        sentence: 'This transaction is for my spouse and joint account.',
        confidence: 0.94,
        category: 'civic'
      },
      {
        tokens: ['UNCLE'],
        sentence: 'My guardian and representative is present with me.',
        confidence: 0.92,
        category: 'civic'
      },
      {
        tokens: ['BUSY'],
        sentence: 'The counter is busy, I will wait for my turn.',
        confidence: 0.92,
        category: 'civic'
      },
      {
        tokens: ['STILL'],
        sentence: 'I am still standing by for the update.',
        confidence: 0.92,
        category: 'civic'
      },
      {
        tokens: ['MAYBE'],
        sentence: 'I am uncertain, please explain the options.',
        confidence: 0.92,
        category: 'civic'
      },
      {
        tokens: ['WRONG'],
        sentence: 'This entry appears to be wrong, please rectify it.',
        confidence: 0.95,
        category: 'civic'
      },

      // --- ACTIONS & VERBS ---
      {
        tokens: ['CLEAN'],
        sentence: 'Please clean and sanitize the counter area.',
        confidence: 0.95,
        category: 'actions'
      },
      {
        tokens: ['CLOSE'],
        sentence: 'I would like to close my account or finish this session.',
        confidence: 0.95,
        category: 'actions'
      },
      {
        tokens: ['COME'],
        sentence: 'Please step forward to the counter.',
        confidence: 0.94,
        category: 'actions'
      },
      {
        tokens: ['COOK'],
        sentence: 'Inquiring about food and cafeteria services.',
        confidence: 0.92,
        category: 'actions'
      },
      {
        tokens: ['I', 'DRINK'],
        sentence: 'I am thirsty, could I please have some drinking water?',
        confidence: 0.97,
        category: 'actions'
      },
      {
        tokens: ['DRINK'],
        sentence: 'I need drinking water, please.',
        confidence: 0.95,
        category: 'actions'
      },
      {
        tokens: ['GIVE'],
        sentence: 'Please give me the completed document or certificate.',
        confidence: 0.95,
        category: 'actions'
      },
      {
        tokens: ['JUMP'],
        sentence: 'Requesting priority fast-track queue assistance.',
        confidence: 0.94,
        category: 'actions'
      },
      {
        tokens: ['POUR'],
        sentence: 'Please dispense the liquid medication.',
        confidence: 0.93,
        category: 'actions'
      },
      {
        tokens: ['SWITCH'],
        sentence: 'I would like to switch service category or counter.',
        confidence: 0.95,
        category: 'actions'
      },
      {
        tokens: ['BREAK'],
        sentence: 'What time will the counter reopen after the break?',
        confidence: 0.94,
        category: 'actions'
      },

      // --- FOOD & COMMODITIES ---
      {
        tokens: ['TEA'],
        sentence: 'Is tea or hot beverage available in the waiting lobby?',
        confidence: 0.94,
        category: 'food'
      },
      {
        tokens: ['VEGETABLES'],
        sentence: 'I am inquiring about public food distribution and ration cards.',
        confidence: 0.95,
        category: 'food'
      },
      {
        tokens: ['LEMON'],
        sentence: 'Agricultural commodity inquiry for lemon.',
        confidence: 0.90,
        category: 'food'
      },
      {
        tokens: ['ONION'],
        sentence: 'Market commodity inquiry for onion.',
        confidence: 0.90,
        category: 'food'
      },
      {
        tokens: ['CARROT'],
        sentence: 'Agricultural produce inquiry for carrot.',
        confidence: 0.90,
        category: 'food'
      },
      {
        tokens: ['CABBAGE'],
        sentence: 'Agricultural produce inquiry for cabbage.',
        confidence: 0.90,
        category: 'food'
      },
      {
        tokens: ['CAULIFLOWER'],
        sentence: 'Agricultural produce inquiry for cauliflower.',
        confidence: 0.90,
        category: 'food'
      },
      {
        tokens: ['CHILLI'],
        sentence: 'Agricultural commodity inquiry for chilli.',
        confidence: 0.90,
        category: 'food'
      },
      {
        tokens: ['BRINJAL'],
        sentence: 'Agricultural produce inquiry for brinjal / eggplant.',
        confidence: 0.90,
        category: 'food'
      },
      {
        tokens: ['CUCUMBER'],
        sentence: 'Agricultural produce inquiry for cucumber.',
        confidence: 0.90,
        category: 'food'
      },
      {
        tokens: ['RADISH'],
        sentence: 'Agricultural produce inquiry for radish.',
        confidence: 0.90,
        category: 'food'
      },

      // --- ANIMALS & NATURE ---
      {
        tokens: ['LION'],
        sentence: 'National emblem verification and department query.',
        confidence: 0.92,
        category: 'animals'
      },
      {
        tokens: ['TIGER'],
        sentence: 'Wildlife sanctuary entry permit for tiger reserve.',
        confidence: 0.93,
        category: 'animals'
      },
      {
        tokens: ['ELEPHANT'],
        sentence: 'Forest tourism safari booking for elephant reserve.',
        confidence: 0.93,
        category: 'animals'
      },
      {
        tokens: ['BEAR'],
        sentence: 'Wildlife sanctuary entry permit for bear park.',
        confidence: 0.90,
        category: 'animals'
      },
      {
        tokens: ['DEER'],
        sentence: 'Wildlife park safari pass for deer enclosure.',
        confidence: 0.90,
        category: 'animals'
      },
      {
        tokens: ['GIRAFFE'],
        sentence: 'Zoological park visit permit for giraffe exhibit.',
        confidence: 0.90,
        category: 'animals'
      },
      {
        tokens: ['MONKEY'],
        sentence: 'Wildlife department report regarding monkey observation.',
        confidence: 0.90,
        category: 'animals'
      },
      {
        tokens: ['PEACOCK'],
        sentence: 'Bird sanctuary permit for peacock reserve.',
        confidence: 0.91,
        category: 'animals'
      },
      {
        tokens: ['PIGEON'],
        sentence: 'Urban bird management and advisory query.',
        confidence: 0.90,
        category: 'animals'
      },
      {
        tokens: ['SPARROW'],
        sentence: 'Bird conservation project inquiry for sparrows.',
        confidence: 0.90,
        category: 'animals'
      },
      {
        tokens: ['TURTLE'],
        sentence: 'Aquatic wildlife sanctuary permit for turtle conservation.',
        confidence: 0.91,
        category: 'animals'
      },
      {
        tokens: ['CROCODILE'],
        sentence: 'River basin safety advisory regarding crocodile sanctuary.',
        confidence: 0.91,
        category: 'animals'
      },
      {
        tokens: ['VOLCANO'],
        sentence: 'Natural disaster alert and emergency rescue assistance.',
        confidence: 0.96,
        category: 'animals'
      },

      // --- COURTESIES & ASSISTANCE ---
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

    // Avoid immediate duplicate token repetition within 1.5s
    const now = performance.now();
    const lastToken = this.tokenBuffer[this.tokenBuffer.length - 1];
    if (lastToken && lastToken.token === cleanToken && (now - this.lastTokenTimestamp) < 1800) {
      return;
    }

    this.tokenBuffer.push({
      token: cleanToken,
      spokenText: spokenText || token,
      timestamp: now
    });

    if (this.tokenBuffer.length > this.maxTokens) {
      this.tokenBuffer.shift();
    }

    this.lastTokenTimestamp = now;

    if (this.onTokensUpdated) {
      this.onTokensUpdated(this.getTokens());
    }

    // Debounce sentence formation
    if (this.autoCommit) {
      if (this.commitDebounceTimer) clearTimeout(this.commitDebounceTimer);
      this.commitDebounceTimer = setTimeout(() => {
        this.formSentence();
      }, 1400);
    }
  }

  getTokens() {
    return this.tokenBuffer.map(t => ({
      id: t.token,
      label: t.spokenText || t.token,
      timestamp: t.timestamp
    }));
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

  /**
   * Synthesize tokens into a grammatically fluent sentence
   */
  formSentence() {
    if (this.tokenBuffer.length === 0) return null;

    const tokenList = this.tokenBuffer.map(t => t.token);
    let matchedRule = null;

    // 1. Search for multi-token rules matching the current sequence or suffix
    for (let len = tokenList.length; len >= 1; len--) {
      const subTokens = tokenList.slice(-len);
      const rule = this.grammarRules.find(r => 
        r.tokens.length === subTokens.length &&
        r.tokens.every((tok, idx) => tok === subTokens[idx])
      );

      if (rule) {
        matchedRule = rule;
        break;
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
      const words = this.tokenBuffer.map(t => t.spokenText || t.token);
      sentence = this._naturalFallback(words);
    }

    // Modulate sentence with active facial emotion (NMM)
    const emotionInfo = this.currentEmotion || { emotion: 'NEUTRAL', emoji: '😐' };
    const modulated = this._modulateSentenceWithEmotion(sentence, emotionInfo);

    const result = {
      tokens: [...tokenList],
      sentence: modulated.sentence,
      plainSentence: sentence,
      emotion: emotionInfo.emotion || 'NEUTRAL',
      emoji: emotionInfo.emoji || '😐',
      confidence: Math.round(confidence * 100),
      category: category,
      timestamp: new Date().toLocaleTimeString()
    };

    if (this.onSentenceFormed) {
      this.onSentenceFormed(result);
    }

    // Reset buffer after successfully generating the sentence
    this.clearTokens();
    return result;
  }

  _modulateSentenceWithEmotion(baseSentence, emotionInfo) {
    if (!emotionInfo || !emotionInfo.emotion || emotionInfo.emotion === 'NEUTRAL') {
      return { sentence: baseSentence };
    }

    const { emotion, emoji } = emotionInfo;
    let text = baseSentence;

    if (emotion === 'PAIN') {
      if (text.toLowerCase().includes('fever')) {
        text = 'I have a severe fever and I am in intense pain.';
      } else if (text.toLowerCase().includes('injury')) {
        text = 'I have a painful injury that urgently requires medical attention.';
      } else if (text.toLowerCase().includes('doctor')) {
        text = 'I am in severe pain and need to see a doctor immediately.';
      }
      return { sentence: `${emoji} ${text}` };
    }

    if (emotion === 'URGENT') {
      if (text.toLowerCase().includes('emergency') || text.toLowerCase().includes('help')) {
        text = 'Critical Emergency! I need immediate urgent assistance!';
      } else {
        text = `Priority Alert: ${text}`;
      }
      return { sentence: `${emoji} ${text}` };
    }

    if (emotion === 'QUESTION') {
      if (text.toLowerCase().startsWith('what is') || text.toLowerCase().startsWith('where')) {
        text = `Excuse me, ${text}`;
      }
      return { sentence: `${emoji} ${text}` };
    }

    if (emotion === 'HAPPY') {
      if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('morning') || text.toLowerCase().includes('afternoon')) {
        text = `${text} Wishing you a great day!`;
      }
      return { sentence: `${emoji} ${text}` };
    }

    if (emotion === 'GRATEFUL') {
      if (text.toLowerCase().includes('thank you')) {
        text = 'Thank you so much for your kind and patient help!';
      }
      return { sentence: `${emoji} ${text}` };
    }

    if (emotion === 'FATIGUED') {
      if (text.toLowerCase().includes('waiting')) {
        text = 'I have been waiting in line for a very long time and I am exhausted.';
      }
      return { sentence: `${emoji} ${text}` };
    }

    return { sentence: `${emoji} ${text}` };
  }

  _naturalFallback(words) {
    if (words.length === 1) {
      return `${words[0]}.`;
    }
    const joined = words.join(' ');
    return joined.charAt(0).toUpperCase() + joined.slice(1) + '.';
  }
}
