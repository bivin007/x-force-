/**
 * Complete Video Dataset Registry
 * Maps all 61 sign language videos from the dataset with categorization,
 * spoken translations, and public service context.
 */

export const DATASET_CATEGORIES = {
  GREETINGS: { id: 'greetings', name: 'Greetings & Social', icon: 'message-circle', color: '#38bdf8' },
  HEALTH: { id: 'health', name: 'Health & Medical', icon: 'heart-pulse', color: '#f87171' },
  SERVICES: { id: 'services', name: 'Public Desk & Daily Life', icon: 'briefcase', color: '#fbbf24' },
  ACTIONS: { id: 'actions', name: 'Action Verbs', icon: 'zap', color: '#34d399' },
  FOOD: { id: 'food', name: 'Food & Essentials', icon: 'coffee', color: '#f97316' },
  ANIMALS: { id: 'animals', name: 'Animals & Nature', icon: 'trees', color: '#a855f7' }
};

export const VIDEO_DATASET_REGISTRY = [
  // --- GREETINGS & SOCIAL ---
  {
    id: 'HELLO',
    label: 'Hello',
    category: 'greetings',
    videoPath: '/sample_videos/Hello.mp4',
    spokenText: 'Hello, good day!',
    counterResponse: 'Welcome! How may I help you at the counter today?'
  },
  {
    id: 'GOOD_MORNING',
    label: 'Good Morning',
    category: 'greetings',
    videoPath: '/sample_videos/Good morning.mp4',
    spokenText: 'Good morning!',
    counterResponse: 'Good morning! Welcome to the service counter.'
  },
  {
    id: 'GOOD_AFTERNOON',
    label: 'Good Afternoon',
    category: 'greetings',
    videoPath: '/sample_videos/Good afternoon.mp4',
    spokenText: 'Good afternoon!',
    counterResponse: 'Good afternoon! How can we assist your visit?'
  },
  {
    id: 'THANK_YOU',
    label: 'Thank You',
    category: 'greetings',
    videoPath: '/sample_videos/Thank you.mp4',
    spokenText: 'Thank you very much!',
    counterResponse: 'You are welcome! Have a wonderful day.'
  },
  {
    id: 'WHAT_IS_YOUR_NAME',
    label: 'What is your Name',
    category: 'greetings',
    videoPath: '/sample_videos/What is your Name.mp4',
    spokenText: 'What is your name? / My name verification.',
    counterResponse: 'Please provide your full legal name and ID proof.'
  },
  {
    id: 'HUG',
    label: 'Hug / Affection',
    category: 'greetings',
    videoPath: '/sample_videos/Hug.mp4',
    spokenText: 'Warm greetings and regards.',
    counterResponse: 'Thank you for your warmth and courtesy.'
  },

  // --- HEALTH & MEDICAL ---
  {
    id: 'FEVER',
    label: 'Fever',
    category: 'health',
    videoPath: '/sample_videos/Fever.mp4',
    spokenText: 'I have a fever / High body temperature.',
    counterResponse: 'Routing to triage nurse for temperature & vitals check.'
  },
  {
    id: 'INJURY',
    label: 'Injury / Wound',
    category: 'health',
    videoPath: '/sample_videos/Injury.mp4',
    spokenText: 'I have an injury / wound that needs care.',
    counterResponse: 'Emergency dressing room notified for wound attention.'
  },
  {
    id: 'CRY',
    label: 'Cry / Pain / Distress',
    category: 'health',
    videoPath: '/sample_videos/Cry.mp4',
    spokenText: 'I am in severe distress / pain.',
    counterResponse: 'Please sit down. The medical team is coming immediately.'
  },
  {
    id: 'FEDUP',
    label: 'Fed up / Exhausted',
    category: 'health',
    videoPath: '/sample_videos/Fedup.mp4',
    spokenText: 'I am exhausted / waiting too long.',
    counterResponse: 'We apologize for the wait. Taking your token next.'
  },

  // --- PUBLIC DESK & DAILY LIFE ---
  {
    id: 'BUDGET',
    label: 'Budget / Financial Plan',
    category: 'services',
    videoPath: '/sample_videos/Budget.mp4',
    spokenText: 'I am inquiring about account budget / fees.',
    counterResponse: 'Here is the fee schedule and account statement.'
  },
  {
    id: 'INTERVIEW',
    label: 'Interview / Appointment',
    category: 'services',
    videoPath: '/sample_videos/Interview.mp4',
    spokenText: 'I am here for an interview / scheduled appointment.',
    counterResponse: 'Appointment found. Please head to Room 3.'
  },
  {
    id: 'EXAM',
    label: 'Exam / Test',
    category: 'services',
    videoPath: '/sample_videos/Exam.mp4',
    spokenText: 'I am here for document exam / verification test.',
    counterResponse: 'Exam verification room is on the 2nd floor.'
  },
  {
    id: 'MATHS',
    label: 'Maths / Calculation',
    category: 'services',
    videoPath: '/sample_videos/Maths.mp4',
    spokenText: 'Please calculate total amount / billing figures.',
    counterResponse: 'Total calculation breakdown is printed on the screen.'
  },
  {
    id: 'WRITER',
    label: 'Writer / Scribe / Document Clerk',
    category: 'services',
    videoPath: '/sample_videos/Writer.mp4',
    spokenText: 'I need assistance writing / filling this form.',
    counterResponse: 'Counter scribe assigned to help fill your form.'
  },
  {
    id: 'KEY',
    label: 'Key / Locker Access',
    category: 'services',
    videoPath: '/sample_videos/Key.mp4',
    spokenText: 'I need the safe deposit locker key / access.',
    counterResponse: 'Locker custodian authorized for verification.'
  },
  {
    id: 'TEMPLE',
    label: 'Temple / Community Hall',
    category: 'services',
    videoPath: '/sample_videos/Temple.mp4',
    spokenText: 'Where is the temple / community hall?',
    counterResponse: 'Directions to the community premises shown on map.'
  },
  {
    id: 'KARNATAKA',
    label: 'Karnataka / State Jurisdiction',
    category: 'services',
    videoPath: '/sample_videos/Karnataka.mp4',
    spokenText: 'Karnataka state domicile / service request.',
    counterResponse: 'State civic portal verified.'
  },
  {
    id: 'UMBRELLA',
    label: 'Umbrella / Rain Protection',
    category: 'services',
    videoPath: '/sample_videos/Umbrella.mp4',
    spokenText: 'Lost umbrella / weather amenity assistance.',
    counterResponse: 'Lost and found desk registered your report.'
  },
  {
    id: 'KNIFE',
    label: 'Knife / Security Alert',
    category: 'services',
    videoPath: '/sample_videos/Knife.mp4',
    spokenText: 'Sharp object / security notice.',
    counterResponse: 'Security screening checkpoint alerted.'
  },
  {
    id: 'MAN',
    label: 'Man / Gentleman',
    category: 'services',
    videoPath: '/sample_videos/Man.mp4',
    spokenText: 'The gentleman accompanying me.',
    counterResponse: 'Visitor companion entry pass authorized.'
  },
  {
    id: 'WIFE',
    label: 'Wife / Spouse',
    category: 'services',
    videoPath: '/sample_videos/Wife.mp4',
    spokenText: 'My wife / joint account spouse.',
    counterResponse: 'Joint holder verification requested.'
  },
  {
    id: 'UNCLE',
    label: 'Uncle / Family Guardian',
    category: 'services',
    videoPath: '/sample_videos/Uncle.mp4',
    spokenText: 'Family guardian / representative.',
    counterResponse: 'Representative authorization documented.'
  },
  {
    id: 'BUSY',
    label: 'Busy / In Progress',
    category: 'services',
    videoPath: '/sample_videos/Busy.mp4',
    spokenText: 'Counter is busy / Processing in progress.',
    counterResponse: 'Transaction underway, please hold a moment.'
  },
  {
    id: 'STILL',
    label: 'Still / Waiting',
    category: 'services',
    videoPath: '/sample_videos/Still.mp4',
    spokenText: 'Still standing by / No update yet.',
    counterResponse: 'Checking real-time status with the back office.'
  },
  {
    id: 'MAYBE',
    label: 'Maybe / Uncertain',
    category: 'services',
    videoPath: '/sample_videos/Maybe.mp4',
    spokenText: 'Maybe / Not certain of option.',
    counterResponse: 'Let me explain the options in detail for you.'
  },
  {
    id: 'WRONG',
    label: 'Wrong / Error',
    category: 'services',
    videoPath: '/sample_videos/Wrong.mp4',
    spokenText: 'This entry or detail is wrong.',
    counterResponse: 'Form cleared for revision and re-entry.'
  },

  // --- ACTIONS ---
  {
    id: 'CLEAN',
    label: 'Clean / Sanitized',
    category: 'actions',
    videoPath: '/sample_videos/Clean.mp4',
    spokenText: 'Please clean / Counter hygiene.',
    counterResponse: 'Sanitation team notified for cleaning.'
  },
  {
    id: 'CLOSE',
    label: 'Close / Finish Session',
    category: 'actions',
    videoPath: '/sample_videos/Close.mp4',
    spokenText: 'Close account / Finish session.',
    counterResponse: 'Closing session and issuing final statement.'
  },
  {
    id: 'COME',
    label: 'Come / Approach Counter',
    category: 'actions',
    videoPath: '/sample_videos/Come.mp4',
    spokenText: 'Please come forward / Calling token.',
    counterResponse: 'Please step up to Counter 1.'
  },
  {
    id: 'COOK',
    label: 'Cook / Food Service',
    category: 'actions',
    videoPath: '/sample_videos/Cook.mp4',
    spokenText: 'Canteen food service query.',
    counterResponse: 'Cafeteria tokens available at Counter 6.'
  },
  {
    id: 'DRINK',
    label: 'Drink / Thirsty',
    category: 'actions',
    videoPath: '/sample_videos/Drink.mp4',
    spokenText: 'I need drinking water.',
    counterResponse: 'Water dispenser is right by the entrance.'
  },
  {
    id: 'GIVE',
    label: 'Give / Hand Over',
    category: 'actions',
    videoPath: '/sample_videos/Give.mp4',
    spokenText: 'Please give me the document / receipt.',
    counterResponse: 'Handing over your signed document now.'
  },
  {
    id: 'JUMP',
    label: 'Jump / Urgent Move',
    category: 'actions',
    videoPath: '/sample_videos/Jump.mp4',
    spokenText: 'Fast track / Priority queue request.',
    counterResponse: 'Priority token issued.'
  },
  {
    id: 'POUR',
    label: 'Pour / Dispense',
    category: 'actions',
    videoPath: '/sample_videos/Pour.mp4',
    spokenText: 'Dispense service / Liquid medicine.',
    counterResponse: 'Liquid dispenser activated.'
  },
  {
    id: 'SWITCH',
    label: 'Switch / Change Counter',
    category: 'actions',
    videoPath: '/sample_videos/Switch.mp4',
    spokenText: 'I want to switch counter / service category.',
    counterResponse: 'Transferring your token to Counter 3.'
  },
  {
    id: 'BREAK',
    label: 'Break / Lunch Time',
    category: 'actions',
    videoPath: '/sample_videos/Break.mp4',
    spokenText: 'Counter recess / Break time inquiry.',
    counterResponse: 'Counter reopens at 2:00 PM.'
  },

  // --- FOOD & ESSENTIALS ---
  {
    id: 'TEA',
    label: 'Tea / Beverage',
    category: 'food',
    videoPath: '/sample_videos/Tea.mp4',
    spokenText: 'Tea / Hot beverage facility.',
    counterResponse: 'Hot beverage vending is in the waiting lobby.'
  },
  {
    id: 'VEGETABLES',
    label: 'Vegetables / Ration',
    category: 'food',
    videoPath: '/sample_videos/Vegetables.mp4',
    spokenText: 'Public food distribution / ration card.',
    counterResponse: 'Ration subsidy desk verified.'
  },
  {
    id: 'LEMON',
    label: 'Lemon',
    category: 'food',
    videoPath: '/sample_videos/Lemon.mp4',
    spokenText: 'Lemon / Agricultural commodity.',
    counterResponse: 'Agri market rate recorded.'
  },
  {
    id: 'ONION',
    label: 'Onion',
    category: 'food',
    videoPath: '/sample_videos/Onion.mp4',
    spokenText: 'Onion / Market commodity.',
    counterResponse: 'Commodity market rate recorded.'
  },
  {
    id: 'CARROT',
    label: 'Carrot',
    category: 'food',
    videoPath: '/sample_videos/Carrot.mp4',
    spokenText: 'Carrot.',
    counterResponse: 'Recorded in system.'
  },
  {
    id: 'CABBAGE',
    label: 'Cabbage',
    category: 'food',
    videoPath: '/sample_videos/Cabbage.mp4',
    spokenText: 'Cabbage.',
    counterResponse: 'Recorded in system.'
  },
  {
    id: 'CAULIFLOWER',
    label: 'Cauliflower',
    category: 'food',
    videoPath: '/sample_videos/Cauliflower.mp4',
    spokenText: 'Cauliflower.',
    counterResponse: 'Recorded in system.'
  },
  {
    id: 'CHILLI',
    label: 'Chilli',
    category: 'food',
    videoPath: '/sample_videos/Chilli.mp4',
    spokenText: 'Chilli.',
    counterResponse: 'Recorded in system.'
  },
  {
    id: 'BRINJAL',
    label: 'Brinjal / Eggplant',
    category: 'food',
    videoPath: '/sample_videos/Brinjal.mp4',
    spokenText: 'Brinjal / Eggplant.',
    counterResponse: 'Recorded in system.'
  },
  {
    id: 'CUCUMBER',
    label: 'Cucumber',
    category: 'food',
    videoPath: '/sample_videos/Cucumber.mp4',
    spokenText: 'Cucumber.',
    counterResponse: 'Recorded in system.'
  },
  {
    id: 'RADISH',
    label: 'Radish',
    category: 'food',
    videoPath: '/sample_videos/Radish.mp4',
    spokenText: 'Radish.',
    counterResponse: 'Recorded in system.'
  },

  // --- ANIMALS & NATURE ---
  {
    id: 'LION',
    label: 'Lion',
    category: 'animals',
    videoPath: '/sample_videos/Lion.mp4',
    spokenText: 'Lion / Forest Department emblem.',
    counterResponse: 'National emblem verified.'
  },
  {
    id: 'TIGER',
    label: 'Tiger',
    category: 'animals',
    videoPath: '/sample_videos/Tiger.mp4',
    spokenText: 'Tiger / Wildlife sanctuary permit.',
    counterResponse: 'Sanctuary pass verified.'
  },
  {
    id: 'ELEPHANT',
    label: 'Elephant',
    category: 'animals',
    videoPath: '/sample_videos/Elephant.mp4',
    spokenText: 'Elephant / Forest tourism.',
    counterResponse: 'Forest tourism pass verified.'
  },
  {
    id: 'BEAR',
    label: 'Bear',
    category: 'animals',
    videoPath: '/sample_videos/Bear.mp4',
    spokenText: 'Bear.',
    counterResponse: 'Recorded.'
  },
  {
    id: 'DEER',
    label: 'Deer',
    category: 'animals',
    videoPath: '/sample_videos/Deer.mp4',
    spokenText: 'Deer.',
    counterResponse: 'Recorded.'
  },
  {
    id: 'GIRAFFE',
    label: 'Giraffe',
    category: 'animals',
    videoPath: '/sample_videos/Giraffe.mp4',
    spokenText: 'Giraffe.',
    counterResponse: 'Recorded.'
  },
  {
    id: 'MONKEY',
    label: 'Monkey',
    category: 'animals',
    videoPath: '/sample_videos/Monkey.mp4',
    spokenText: 'Monkey.',
    counterResponse: 'Recorded.'
  },
  {
    id: 'PEACOCK',
    label: 'Peacock',
    category: 'animals',
    videoPath: '/sample_videos/Peacock.mp4',
    spokenText: 'Peacock.',
    counterResponse: 'National bird emblem acknowledged.'
  },
  {
    id: 'PIGEON',
    label: 'Pigeon',
    category: 'animals',
    videoPath: '/sample_videos/Pigeon.mp4',
    spokenText: 'Pigeon.',
    counterResponse: 'Recorded.'
  },
  {
    id: 'SPARROW',
    label: 'Sparrow',
    category: 'animals',
    videoPath: '/sample_videos/Sparrow.mp4',
    spokenText: 'Sparrow.',
    counterResponse: 'Recorded.'
  },
  {
    id: 'TURTLE',
    label: 'Turtle',
    category: 'animals',
    videoPath: '/sample_videos/Turtle.mp4',
    spokenText: 'Turtle.',
    counterResponse: 'Recorded.'
  },
  {
    id: 'CROCODILE',
    label: 'Crocodile',
    category: 'animals',
    videoPath: '/sample_videos/Crocodile.mp4',
    spokenText: 'Crocodile.',
    counterResponse: 'Recorded.'
  },
  {
    id: 'VOLCANO',
    label: 'Volcano / Disaster Alert',
    category: 'animals',
    videoPath: '/sample_videos/Volcano.mp4',
    spokenText: 'Natural disaster alert / Emergency.',
    counterResponse: 'Disaster management authority alerted.'
  }
];

export function findVideoById(id) {
  if (!id) return null;
  const cleanId = id.toUpperCase().replace(/\s+/g, '_');
  return VIDEO_DATASET_REGISTRY.find(v => v.id === cleanId || v.id === id);
}

export function findVideoByPath(path) {
  if (!path) return null;
  return VIDEO_DATASET_REGISTRY.find(v => v.videoPath === path);
}

export function findVideoByLabel(label) {
  if (!label) return null;
  const lower = label.toLowerCase();
  return VIDEO_DATASET_REGISTRY.find(v => v.label.toLowerCase() === lower || v.id.toLowerCase() === lower);
}

