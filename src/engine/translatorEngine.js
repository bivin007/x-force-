/**
 * Multilingual Translation Engine (Stage 3 of SignBridge Pipeline)
 * Translates generated natural language sentences across Indic & Global languages:
 * 1. English (EN)
 * 2. Tamil (TA - தமிழ்)
 * 3. Hindi (HI - हिन्दी)
 * 4. Telugu (TE - తెలుగు)
 * 5. Kannada (KN - ಕನ್ನಡ)
 * 6. Malayalam (ML - മലയാളം)
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', langTag: 'en-US', flag: '🇬🇧' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', langTag: 'ta-IN', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', langTag: 'hi-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', langTag: 'te-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', langTag: 'kn-IN', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', langTag: 'ml-IN', flag: '🇮🇳' }
];

export class TranslatorEngine {
  constructor() {
    this.currentLanguage = 'en';
    this.dictionary = this._buildMultilingualDictionary();
  }

  setTargetLanguage(langCode) {
    if (SUPPORTED_LANGUAGES.some(l => l.code === langCode)) {
      this.currentLanguage = langCode;
    }
  }

  getCurrentLanguage() {
    return SUPPORTED_LANGUAGES.find(l => l.code === this.currentLanguage) || SUPPORTED_LANGUAGES[0];
  }

  /**
   * Translate English text into the specified language (or current target language)
   */
  translate(text, targetLang = null) {
    if (!text) return { translatedText: '', langCode: 'en', langName: 'English' };
    const lang = targetLang || this.currentLanguage;

    // Detect emoji prefix if present (e.g. '😣 ', '🚨 ', '😊 ')
    let emojiPrefix = '';
    let bodyText = text.trim();
    const emojiMatch = bodyText.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uD83C-\uD83E][\uDD00-\uDFFF]|\p{Emoji})\s*/u);
    if (emojiMatch) {
      emojiPrefix = emojiMatch[0];
      bodyText = bodyText.substring(emojiMatch[0].length).trim();
    }

    if (lang === 'en') {
      return {
        originalText: text,
        translatedText: text,
        langCode: 'en',
        langName: 'English',
        nativeName: 'English',
        langTag: 'en-US'
      };
    }

    const clean = bodyText;
    let translated = '';
    
    // 1. Direct phrase lookup in dictionary
    if (this.dictionary[clean] && this.dictionary[clean][lang]) {
      translated = this.dictionary[clean][lang];
    } else {
      // 2. Fuzzy / lower case lookup
      const lowerKey = clean.toLowerCase();
      let foundMatch = null;
      for (const [k, translations] of Object.entries(this.dictionary)) {
        if (k.toLowerCase() === lowerKey || k.toLowerCase().includes(lowerKey) || lowerKey.includes(k.toLowerCase())) {
          if (translations[lang]) {
            foundMatch = translations[lang];
            break;
          }
        }
      }

      if (foundMatch) {
        translated = foundMatch;
      } else {
        // 3. Fallback: Word-by-word contextual replacement
        translated = this._wordByWordTranslate(clean, lang);
      }
    }

    const finalOutput = emojiPrefix ? `${emojiPrefix}${translated}` : translated;

    return {
      originalText: text,
      translatedText: finalOutput,
      langCode: lang,
      langName: this.getLangName(lang),
      nativeName: this.getNativeName(lang),
      langTag: this.getLangTag(lang)
    };
  }

  getLangName(code) {
    const found = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return found ? found.name : code;
  }

  getNativeName(code) {
    const found = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return found ? found.native : code;
  }

  getLangTag(code) {
    const found = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return found ? found.langTag : 'en-US';
  }

  _buildMultilingualDictionary() {
    return {
      // --- Medical & Health Sentences ---
      'I have a severe fever and I am in intense pain.': {
        ta: 'எனக்கு அதிக காய்ச்சல் மற்றும் கடுமையான வலி உள்ளது.',
        hi: 'मुझे तेज बुखार है और बहुत तीव्र दर्द हो रहा है।',
        te: 'నాకు తీవ్రమైన జ్వరం మరియు అధిక నొప్పి ఉంది.',
        kn: 'ನನಗೆ ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಅತಿಯಾದ ನೋವು ಇದೆ.',
        ml: 'എനിക്ക് കടുത്ത പനിയും കഠിനമായ വേദനയുമുണ്ട്.'
      },
      'I have a painful injury that urgently requires medical attention.': {
        ta: 'எனக்கு கடுமையான காயம் ஏற்பட்டுள்ளது, அவசர சிகிச்சை தேவை.',
        hi: 'मुझे दर्दनाक चोट लगी है, तुरंत डॉक्टर की मदद चाहिए।',
        te: 'నాకు తీవ్రమైన గాయమైంది, తక్షణ వైద్య సహాయం కావాలి.',
        kn: 'ನನಗೆ ನೋವಿನ ಗಾಯವಾಗಿದೆ, ತುರ್ತು ಚಿಕಿತ್ಸೆ ಬೇಕಾಗಿದೆ.',
        ml: 'എനിക്ക് വേദനയേറിയ പരിക്കേറ്റിട്ടുണ്ട്, അടിയന്തര ചികിത്സ ആവശ്യമാണ്.'
      },
      'Critical Emergency! I need immediate urgent assistance!': {
        ta: 'அவசர நிலைமை! உடனடியாக உதவி தேவைப்படுகிறது!',
        hi: 'अति आवश्यक आपातकाल! कृपया तुरंत मदद करें!',
        te: 'అత్యవసర పరిస్థితి! దయచేసి వెంటనే సహాయం చేయండి!',
        kn: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ! ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ಸಹಾಯ ಮಾಡಿ!',
        ml: 'അടിയന്തരാവസ്ഥ! ദയവായി ഉടൻ സഹായിക്കുക!'
      },
      'Thank you so much for your kind and patient help!': {
        ta: 'உங்கள் கனிவான மற்றும் பொறுமையான உதவிக்கு மிக்க நன்றி!',
        hi: 'आपकी दयालु और धैर्यपूर्ण मदद के लिए बहुत-बहुत धन्यवाद!',
        te: 'మీ దయతో కూడిన సహాయానికి చాలా ధన్యవాదాలు!',
        kn: 'ನಿಮ್ಮ ತಾಳ್ಮೆಯ ಸಹಾಯಕ್ಕಾಗಿ ತುಂಬಾ ಧನ್ಯವಾದಗಳು!',
        ml: 'നിങ്ങളുടെ ദയയുള്ള സഹായത്തിന് വളരെ നന്ദി!'
      },
      'I have a fever and need a medical checkup.': {
        ta: 'எனக்கு காய்ச்சல் உள்ளது, மருத்துவ பரிசோதனை தேவைப்படுகிறது.',
        hi: 'मुझे बुखार है और मेडिकल जांच की आवश्यकता है।',
        te: 'నాకు జ్వరం ఉంది మరియు వైద్య పరీక్ష అవసరం.',
        kn: 'ನನಗೆ ಜ್ವರವಿದೆ ಮತ್ತು ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಅಗತ್ಯವಿದೆ.',
        ml: 'എനിക്ക് പനിയുണ്ട്, ഒരു വൈദ്യപരിശോധന ആവശ്യമാണ്.'
      },
      'I have a fever.': {
        ta: 'எனக்கு காய்ச்சல் உள்ளது.',
        hi: 'मुझे बुखार है।',
        te: 'నాకు జ్వరం ఉంది.',
        kn: 'ನನಗೆ ಜ್ವರವಿದೆ.',
        ml: 'എനിക്ക് പനിയുണ്ട്.'
      },
      'I have a high fever.': {
        ta: 'எனக்கு அதிக காய்ச்சல் உள்ளது.',
        hi: 'मुझे तेज बुखार है।',
        te: 'నాకు తీవ్ర జ్వరం ఉంది.',
        kn: 'ನನಗೆ ತೀವ್ರ ಜ್ವರವಿದೆ.',
        ml: 'എനിക്ക് കടുത്ത പനിയുണ്ട്.'
      },
      'I have an injury that needs immediate medical dressing.': {
        ta: 'எனக்கு காயம் ஏற்பட்டுள்ளது, உடனே கட்டு போட வேண்டும்.',
        hi: 'मुझे चोट लगी है, तत्काल ड्रेसिंग की आवश्यकता है।',
        te: 'నాకు గాయమైంది, వెంటనే కట్టు కట్టాలి.',
        kn: 'ನನಗೆ ಗಾಯವಾಗಿದೆ, ತಕ್ಷಣದ ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿದೆ.',
        ml: 'എനിക്ക് പരിക്കേറ്റിട്ടുണ്ട്, അടിയന്തര മരുന്നുകെട്ടൽ ആവശ്യമാണ്.'
      },
      'I have an injury that requires medical care.': {
        ta: 'எனக்கு காயம் ஏற்பட்டுள்ளது, மருத்துவ சிகிச்சை தேவை.',
        hi: 'मुझे चोट लगी है, जिसके लिए चिकित्सा की आवश्यकता है।',
        te: 'నాకు గాయమైంది, వైద్య సహాయం కావాలి.',
        kn: 'ನನಗೆ ಗಾಯವಾಗಿದೆ, ವೈದ್ಯಕೀಯ ಆರೈಕೆ ಬೇಕು.',
        ml: 'എനിക്ക് പരിക്കേറ്റിട്ടുണ്ട്, ചികിത്സ ആവശ്യമാണ്.'
      },
      'I need to see a doctor or medical officer urgently.': {
        ta: 'நான் அவசரமாக மருத்துவரை பார்க்க வேண்டும்.',
        hi: 'मुझे तुरंत डॉक्टर या चिकित्सा अधिकारी से मिलना है।',
        te: 'నేను వెంటనే వైద్యుడిని సంప్రదించాలి.',
        kn: 'ನಾನು ತುರ್ತಾಗಿ ವೈದ್ಯರನ್ನು ಕಾಣಬೇಕು.',
        ml: 'എനിക്ക് അടിയന്തരമായി ഡോക്ടറെ കാണണം.'
      },
      'I need to consult a doctor.': {
        ta: 'நான் மருத்துவரிடம் ஆலோசனை பெற வேண்டும்.',
        hi: 'मुझे डॉक्टर से परामर्श लेना है।',
        te: 'నేను డాక్టర్‌ను సంప్రదించాలి.',
        kn: 'ನಾನು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಬೇಕು.',
        ml: 'എനിക്ക് ഒരു ഡോക്ടറെ കാണണം.'
      },
      'I am experiencing severe pain and distress.': {
        ta: 'நான் கடுமையான வலியையும் வேதனையையும் உணர்கிறேன்.',
        hi: 'मुझे बहुत तेज दर्द और परेशानी हो रही है।',
        te: 'నేను తీవ్రమైన నొప్పి మరియు బాధను అనుభవిస్తున్నాను.',
        kn: 'ನನಗೆ ತೀವ್ರ ನೋವು ಮತ್ತು ಸಂಕಟವಾಗುತ್ತಿದೆ.',
        ml: 'എനിക്ക് കഠിനമായ വേദനയും അസ്വസ്ഥതയും അനുഭവപ്പെടുന്നു.'
      },
      'I am in severe distress and pain.': {
        ta: 'நான் அதிக வேதனையிலும் வலியிலும் இருக்கிறேன்.',
        hi: 'मैं भारी संकट और दर्द में हूँ।',
        te: 'నేను తీవ్రమైన బాధలో ఉన్నాను.',
        kn: 'ನಾನು ತೀವ್ರ ನೋವಿನಲ್ಲಿದ್ದೇನೆ.',
        ml: 'ഞാൻ കഠിനമായ വേദനയിലാണ്.'
      },
      'I have been waiting for a very long time.': {
        ta: 'நான் நீண்ட நேரமாக காத்துக் கொண்டிருக்கிறேன்.',
        hi: 'मैं काफी देर से इंतजार कर रहा हूँ।',
        te: 'నేను చాలా సమయంగా వేచి చూస్తున్నాను.',
        kn: 'ನಾನು ತುಂಬಾ ಸಮಯದಿಂದ ಕಾಯುತ್ತಿದ್ದೇನೆ.',
        ml: 'ഞാൻ വളരെ നേരമായി കാത്തിരിക്കുകയാണ്.'
      },
      'I am exhausted from the long wait.': {
        ta: 'நீண்ட காத்திருப்பால் நான் சோர்வடைந்துவிட்டேன்.',
        hi: 'लंबे इंतजार से मैं थक गया हूँ।',
        te: 'ఎక్కువసేపు వేచి ఉండటం వల్ల నేను అలసిపోయాను.',
        kn: 'ದೀರ್ಘ ಕಾಯುವಿಕೆಯಿಂದ ನಾನು ಸುಸ್ತಾಗಿದ್ದೇನೆ.',
        ml: 'നീണ്ട കാത്തിരിപ്പുകൊണ്ട് ഞാൻ ക്ഷീണിച്ചു.'
      },
      'I need to collect my prescribed medication from the pharmacy.': {
        ta: 'நான் மருந்தகத்திலிருந்து பரிந்துரைக்கப்பட்ட மருந்துகளை வாங்க வேண்டும்.',
        hi: 'मुझे फार्मेसी से निर्धारित दवाएं लेनी हैं।',
        te: 'నేను మందుల దుకాణం నుండి సూచించిన మందులను తీసుకోవాలి.',
        kn: 'ನಾನು ಔಷಧಾಲಯದಿಂದ ನಿಗದಿತ ಔಷಧಿಗಳನ್ನು ಪಡೆಯಬೇಕು.',
        ml: 'ഫാർമസിയിൽ നിന്ന് എനിക്ക് മരുന്നുകൾ വാങ്ങണം.'
      },
      'This is an urgent emergency, please help immediately.': {
        ta: 'இது அவசர நிலை, தயவுசெய்து உடனடியாக உதவுங்கள்.',
        hi: 'यह एक आपातकालीन स्थिति है, कृपया तुरंत मदद करें।',
        te: 'ఇది అత్యవసర పరిస్థితి, దయచేసి వెంటనే సహాయం చేయండి.',
        kn: 'ಇದು ತುರ್ತು ಪರಿಸ್ಥಿತಿ, ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ಸಹಾಯ ಮಾಡಿ.',
        ml: 'ഇതൊരു അടിയന്തര സാഹചര്യമാണ്, ഉടൻ സഹായിക്കൂ.'
      },

      // --- Financial & Banking Sentences ---
      'I would like to make a cash deposit into my bank account.': {
        ta: 'என் வங்கிக் கணக்கில் பணம் டெபாசிட் செய்ய விரும்புகிறேன்.',
        hi: 'मैं अपने बैंक खाते में नकद जमा करना चाहता हूँ।',
        te: 'నేను నా బ్యాంక్ ఖాతాలో నగదు జమ చేయాలనుకుంటున్నాను.',
        kn: 'ನನ್ನ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ನಗದು ಠೇವಣಿ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ.',
        ml: 'എന്റെ ബാങ്ക് അക്കൗണ്ടിലേക്ക് പണം നിക്ഷേപിക്കാൻ ഞാൻ ആഗ്രഹിക്കുന്നു.'
      },
      'I would like to deposit money into my account.': {
        ta: 'எனது கணக்கில் பணம் டெபாசிட் செய்ய விரும்புகிறேன்.',
        hi: 'मैं अपने खाते में पैसे जमा करना चाहता हूँ।',
        te: 'నేను నా ఖాతాలో డబ్బులు డిపాజిట్ చేయాలనుకుంటున్నాను.',
        kn: 'ನನ್ನ ಖಾತೆಗೆ ಹಣ ಜಮೆ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ.',
        ml: 'എന്റെ അക്കൗണ്ടിൽ പണം നിക്ഷേപിക്കണം.'
      },
      'I would like to withdraw cash from my bank account.': {
        ta: 'என் வங்கிக் கணக்கிலிருந்து பணம் எடுக்க விரும்புகிறேன்.',
        hi: 'मैं अपने बैंक खाते से नकद निकालना चाहता हूँ।',
        te: 'నేను నా బ్యాంక్ ఖాతా నుండి నగదు విత్‌డ్రా చేయాలనుకుంటున్నాను.',
        kn: 'ನನ್ನ ಬ್ಯಾಂಕ್ ಖಾತೆಯಿಂದ ಹಣ ಹಿಂಪಡೆಯಲು ಬಯಸುತ್ತೇನೆ.',
        ml: 'എന്റെ ബാങ്ക് അക്കൗണ്ടിൽ നിന്ന് പണം പിൻവലിക്കാൻ ആഗ്രഹിക്കുന്നു.'
      },
      'I want to check my bank account balance and deposit funds.': {
        ta: 'என் வங்கிக் கணக்கு இருப்பை சரிபார்த்து பணம் செலுத்த விரும்புகிறேன்.',
        hi: 'मैं अपने खाते का बैलेंस चेक कर पैसे जमा करना चाहता हूँ।',
        te: 'నేను నా ఖాతా బ్యాలెన్స్ చూసి డబ్బులు జమ చేయాలనుకుంటున్నాను.',
        kn: 'ನನ್ನ ಖಾತೆಯ ಶಿಲ್ಕು ಪರಿಶೀಲಿಸಿ ಹಣ ಜಮೆ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ.',
        ml: 'അക്കൗണ്ട് ബാലൻസ് പരിശോധിച്ച് പണം നിക്ഷേപിക്കണം.'
      },
      'I am inquiring about account fees, budget, and charges.': {
        ta: 'கணக்கு கட்டணங்கள் மற்றும் வரவு செலவு பற்றி விசாரிக்கிறேன்.',
        hi: 'मैं खाते के शुल्क, बजट और चार्जेज के बारे में पूछ रहा हूँ।',
        te: 'నేను ఖాతా ఛార్జీలు మరియు బడ్జెట్ వివరాలు తెలుసుకోవాలనుకుంటున్నాను.',
        kn: 'ಖಾತೆಯ ಶುಲ್ಕಗಳು ಮತ್ತು ಬಜೆಟ್ ವಿವರಗಳ ಬಗ್ಗೆ ವಿಚಾರಿಸುತ್ತಿದ್ದೇನೆ.',
        ml: 'അക്കൗണ്ട് ഫീസുകളെക്കുറിച്ചും ബജറ്റിനെക്കുറിച്ചും അന്വേഷിക്കുകയാണ്.'
      },
      'Here is my official identity card for account verification.': {
        ta: 'கணக்கு சரிபார்ப்பிற்கான எனது அடையாள அட்டை இதோ.',
        hi: 'खाता सत्यापन के लिए यह मेरा आधिकारिक पहचान पत्र है।',
        te: 'ఖాతా ధృవీకరణ కోసం ఇది నా గుర్తింపు కార్డు.',
        kn: 'ಖಾತೆ ಪರಿಶೀಲನೆಗಾಗಿ ನನ್ನ ಅಧಿಕೃತ ಗುರುತಿನ ಚೀಟಿ ಇಲ್ಲಿದೆ.',
        ml: 'അക്കൗണ്ട് വെരിഫിക്കേഷനായി എന്റെ ഐഡി കാർഡ് ഇതാ.'
      },
      'I need safe deposit locker key access.': {
        ta: 'எனக்கு லாக்கர் சாவிக்கான அனுமதி தேவை.',
        hi: 'मुझे सेफ डिपॉजिट लॉकर की चाबी चाहिए।',
        te: 'నాకు సేఫ్ డిపాజిట్ లాకర్ కీ యాక్సెస్ కావాలి.',
        kn: 'ನನಗೆ ಲಾಕರ್ ಕೀ ಪ್ರವೇಶ ಬೇಕಾಗಿದೆ.',
        ml: 'സേഫ് ഡിപ്പോസിറ്റ് ലോക്കർ താക്കോൽ പരിശോധിക്കണം.'
      },
      'Where do I need to sign this form?': {
        ta: 'இந்த படிவத்தில் நான் எங்கே கையொப்பமிட வேண்டும்?',
        hi: 'मुझे इस फॉर्म पर कहाँ हस्ताक्षर करने हैं?',
        te: 'ఈ ఫారమ్‌పై నేను ఎక్కడ సంతకం చేయాలి?',
        kn: 'ಈ ಫಾರ್ಮ್‌ನಲ್ಲಿ ನಾನು ಎಲ್ಲಿ ಸಹಿ ಮಾಡಬೇಕು?',
        ml: 'ഈ ഫോമിൽ ഞാൻ എവിടെയാണ് ഒപ്പിടേണ്ടത്?'
      },
      'Please provide an official printed receipt for this transaction.': {
        ta: 'இந்த பரிவர்த்தனைக்கான ரசீதை வழங்கவும்.',
        hi: 'कृपया इस लेनदेन की मुद्रित रसीद प्रदान करें।',
        te: 'దయచేసి ఈ లావాదేవీకి రసీదు ఇవ్వండి.',
        kn: 'ದಯವಿಟ್ಟು ಈ ವಹಿವಾಟಿಗೆ ಮುದ್ರಿತ ರಶೀದಿಯನ್ನು ನೀಡಿ.',
        ml: 'ദയവായി ഈ ഇടപാടിന്റെ പ്രിന്റ് ചെയ്ത രസീത് നൽകുക.'
      },

      // --- Greetings & Daily Life ---
      'What is your name? / Please verify my identity.': {
        ta: 'உங்கள் பெயர் என்ன? / என் அடையாளத்தை சரிபார்க்கவும்.',
        hi: 'आपका नाम क्या है? / मेरी पहचान सत्यापित करें।',
        te: 'మీ పేరు ఏమిటి? / నా గుర్తింపును ధృవీకరించండి.',
        kn: 'ನಿಮ್ಮ ಹೆಸರೇನು? / ನನ್ನ ಗುರುತನ್ನು ಪರಿಶೀಲಿಸಿ.',
        ml: 'നിങ്ങളുടെ പേരെന്താണ്? / എന്റെ ഐഡന്റിറ്റി പരിശോധിക്കുക.'
      },
      'Hello, good day!': {
        ta: 'வணக்கம், நல்ல நாள்!',
        hi: 'नमस्ते, शुभ दिन!',
        te: 'నమస్కారం, శుభదినం!',
        kn: 'ನಮಸ್ಕಾರ, ಶುಭ ದಿನ!',
        ml: 'നമസ്കാരം, നല്ലൊരു ദിവസം ആശംസിക്കുന്നു!'
      },
      'Good morning!': {
        ta: 'காலை வணக்கம்!',
        hi: 'सुप्रभात!',
        te: 'శుభోదయం!',
        kn: 'ಶುಭೋದಯ!',
        ml: 'സുപ്രഭാതം!'
      },
      'Good afternoon!': {
        ta: 'மதிய வணக்கம்!',
        hi: 'शुभ दोपहर!',
        te: 'శుభ మధ్యాహ్నం!',
        kn: 'ಶುಭ ಮಧ್ಯಾಹ್ನ!',
        ml: 'ശുഭ സായാഹ്നം!'
      },
      'Thank you very much for your assistance!': {
        ta: 'உங்கள் உதவிக்கு மிக்க நன்றி!',
        hi: 'आपकी सहायता के लिए बहुत-बहुत धन्यवाद!',
        te: 'మీ సహాయానికి చాలా ధన్యవాదాలు!',
        kn: 'ನಿಮ್ಮ ಸಹಾಯಕ್ಕೆ ತುಂಬಾ ಧನ್ಯವಾದಗಳು!',
        ml: 'നിങ്ങളുടെ സഹായത്തിന് വളരെ നന്ദി!'
      },
      'I am thirsty, could I please have some drinking water?': {
        ta: 'எனக்கு தாகமாக உள்ளது, குடிநீர் கிடைக்குமா?',
        hi: 'मुझे प्यास लगी है, क्या मुझे पीने का पानी मिल सकता है?',
        te: 'నాకు దాహం వేస్తోంది, దయచేసి తాగడానికి నీరు ఇస్తారా?',
        kn: 'ನನಗೆ ಬಾಯಾರಿಕೆಯಾಗಿದೆ, ಕುಡಿಯುವ ನೀರು ಸಿಗಬಹುದೇ?',
        ml: 'എനിക്ക് ദാഹിക്കുന്നു, കുടിക്കാൻ കുറച്ച് വെള്ളം തരുമോ?'
      },
      'I need drinking water, please.': {
        ta: 'தயவுசெய்து குடிநீர் வேண்டும்.',
        hi: 'कृपया मुझे पीने का पानी चाहिए।',
        te: 'దయచేసి తాగే నీరు కావాలి.',
        kn: 'ದಯವಿಟ್ಟು ಕುಡಿಯುವ ನೀರು ಬೇಕು.',
        ml: 'ദയവായി കുടിവെള്ളം നൽകുക.'
      },
      'I am Deaf. Please use text or visual sign prompts on the screen.': {
        ta: 'நான் காது கேளாதவர். தயவுசெய்து திரையில் எழுத்து அல்லது சைகை வழிகாட்டலைப் பயன்படுத்தவும்.',
        hi: 'मैं बधिर हूँ। कृपया स्क्रीन पर टेक्स्ट या सांकेतिक भाषा का उपयोग करें।',
        te: 'నేను బధిరుడిని. దయచేసి తెరపై టెక్స్ట్ లేదా సంకేతాలను చూపించండి.',
        kn: 'ನಾನು ಶ್ರವಣದೋಷವುಳ್ಳವನು. ದಯವಿಟ್ಟು ಪರದೆಯ ಮೇಲೆ ಪಠ್ಯ ಅಥವಾ ಸಂಜ್ಞೆಗಳನ್ನು ಬಳಸಿ.',
        ml: 'ഞാൻ കേൾവി പരിമിതിയുള്ള ആളാണ്. ദയവായി സ്ക്രീനിൽ ടെക്സ്റ്റ് അല്ലെങ്കിൽ ആംഗ്യങ്ങൾ ഉപയോഗിക്കുക.'
      },
      'I need assistance with this service counter application.': {
        ta: 'இந்த சேவை கவுண்டர் விண்ணப்பத்தில் எனக்கு உதவி தேவை.',
        hi: 'मुझे इस सेवा काउंटर आवेदन में सहायता चाहिए।',
        te: 'ఈ సేవా కౌంటర్ దరఖాస్తులో నాకు సహాయం కావాలి.',
        kn: 'ಈ ಸೇವಾ ಕೌಂಟರ್ ಅರ್ಜಿಗೆ ನನಗೆ ಸಹಾಯ ಬೇಕಾಗಿದೆ.',
        ml: 'ഈ സർവീസ് കൗണ്ടർ അപേക്ഷയിൽ എനിക്ക് സഹായം ആവശ്യമാണ്.'
      },
      'Yes, that is correct and confirmed.': {
        ta: 'ஆம், அது சரியானது மற்றும் உறுதிசெய்யப்பட்டது.',
        hi: 'हाँ, यह सही है और पुष्टि की गई है।',
        te: 'అవును, అది సరైనది మరియు నిర్ధారించబడింది.',
        kn: 'ಹೌದು, ಅದು ಸರಿಯಾಗಿದೆ ಮತ್ತು ಖಚಿತಪಡಿಸಲಾಗಿದೆ.',
        ml: 'അതെ, അത് ശരിയാണ്, സ്ഥിരീകരിച്ചു.'
      },
      'No, that is not what I need.': {
        ta: 'இல்லை, எனக்கு அது தேவையில்லை.',
        hi: 'नहीं, मुझे इसकी आवश्यकता नहीं है।',
        te: 'లేదు, నాకు అది అవసరం లేదు.',
        kn: 'ಇಲ್ಲ, ನನಗೆ ಅದು ಬೇಡ.',
        ml: 'അല്ല, എനിക്ക് അതല്ല വേണ്ടത്.'
      }
    };
  }

  _wordByWordTranslate(text, lang) {
    const vocabMap = {
      'hello': { ta: 'வணக்கம்', hi: 'नमस्ते', te: 'నమస్కారం', kn: 'ನಮಸ್ಕಾರ', ml: 'നമസ്കാരം' },
      'fever': { ta: 'காய்ச்சல்', hi: 'बुखार', te: 'జ్వరం', kn: 'ಜ್ವರ', ml: 'പനി' },
      'doctor': { ta: 'மருத்துவர்', hi: 'डॉक्टर', te: 'వైద్యుడు', kn: 'ವೈದ್ಯರು', ml: 'ഡോക്ടർ' },
      'money': { ta: 'பணம்', hi: 'पैसे', te: 'డబ్బు', kn: 'ಹಣ', ml: 'പണം' },
      'deposit': { ta: 'டெபாசிட்', hi: 'जमा', te: 'డిపాజిట్', kn: 'ಠೇವಣಿ', ml: 'നിക്ഷേപം' },
      'account': { ta: 'கணக்கு', hi: 'खाता', te: 'ఖాతా', kn: 'ಖಾತೆ', ml: 'അക്കൗണ്ട്' },
      'water': { ta: 'தண்ணீர்', hi: 'पानी', te: 'నీరు', kn: 'ನೀರು', ml: 'വെള്ളം' },
      'help': { ta: 'உதவி', hi: 'मदद', te: 'సహాయం', kn: 'ಸಹಾಯ', ml: 'സഹായം' },
      'thank you': { ta: 'நன்றி', hi: 'धन्यवाद', te: 'ధన్యవాదాలు', kn: 'ಧನ್ಯವಾದಗಳು', ml: 'നന്ദി' }
    };

    const words = text.split(/\s+/);
    const translatedWords = words.map(w => {
      const cleanW = w.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
      if (vocabMap[cleanW] && vocabMap[cleanW][lang]) {
        return vocabMap[cleanW][lang];
      }
      return w;
    });

    return translatedWords.join(' ');
  }
}
