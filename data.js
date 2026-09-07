/**
 * Default Data & Presets for Event Spin Wheels
 * Section 2 & 4 implementation
 */

export const DEFAULT_WHEELS = {
  wheel1: {
    id: 'wheel1',
    title: 'Digital Experience',
    description: 'Wheel 1: Format / Digital Platform (12-15 options)',
    colorPalette: ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#10B981', '#06B6D4', '#0EA5E9'],
    items: [
      'Mobile App',
      'VR Experience',
      'Browser Extension',
      'AI Assistant',
      'Smartwatch App',
      'Voice Skill',
      'Interactive Dashboard',
      'AR Navigator',
      'Desktop Application',
      'Interactive Kiosk UI',
      'Chatbot Interface',
      'SaaS Platform',
      'CLI / Terminal Tool',
      'Smart Wearable App'
    ]
  },
  wheel2: {
    id: 'wheel2',
    title: 'Product / Object',
    description: 'Wheel 2: Physical / Domain Focus (15-20 options)',
    colorPalette: ['#F59E0B', '#10B981', '#84CC16', '#06B6D4', '#6366F1', '#EC4899', '#F97316', '#A855F7'],
    items: [
      'Smart Refrigerator',
      'Electric Bicycle',
      'Coffee Machine',
      'Indoor Plant Pot',
      'Delivery Drone',
      'Automated Pet Feeder',
      'Smart Bathroom Mirror',
      'Ergonomic Desk Chair',
      'Rooftop Solar Panel',
      'Ambient Desk Lamp',
      'Fitness Tracker',
      'Smart Water Bottle',
      'Keyless Door Lock',
      'Noise-Canceling Headphones',
      'Travel Backpack',
      'Air Purifier',
      'Microwave Oven',
      'Stargazing Telescope'
    ]
  },
  wheel3: {
    id: 'wheel3',
    title: 'Target User / Constraint',
    description: 'Wheel 3: Persona / Technical Constraint (15-20 options)',
    colorPalette: ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'],
    items: [
      'Elderly Tech Beginners',
      'College Students on Budget',
      'Remote Workers with ADHD',
      'Parents of Toddlers',
      'Visually Impaired Athletes',
      'Solo Backpackers',
      'Night Shift Hospital Nurses',
      'Eco-Conscious Teenagers',
      'High-Stress Executives',
      'Minimalist Digital Nomads',
      'Gamers with Low Bandwidth',
      'Offline Rural Communities',
      'Emergency First Responders',
      'Extreme Sports Athletes',
      'Small Apartment Pet Owners'
    ]
  }
};

export const DEFAULT_MARKET_SHIFTS = [
  {
    id: 'ms-1',
    title: '📉 Severe Budget Cut',
    description: 'Your project cost must be slashed by 80%. Simplify all features down to a single core MVP.',
    impact: 'High'
  },
  {
    id: 'ms-2',
    title: '📡 Offline-First Mode Required',
    description: 'Target users have zero internet access 90% of the time. All key functions must work completely offline.',
    impact: 'Critical'
  },
  {
    id: 'ms-3',
    title: '♿ Strict Accessibility Upgrade',
    description: 'Must fully support screen readers, high contrast, and single-switch inputs for motor impairments.',
    impact: 'Medium'
  },
  {
    id: 'ms-4',
    title: '👶 New Target Persona: Kids (Under 8)',
    description: 'Simplify UI drastically for young children. Uses ultra-large buttons, zero complex text, and audio cues.',
    impact: 'High'
  },
  {
    id: 'ms-5',
    title: '📱 Mobile-Only Pivot',
    description: 'Desktop build cancelled! Experience must be optimized purely for single-thumb smartphone usage.',
    impact: 'Medium'
  },
  {
    id: 'ms-6',
    title: '🌐 Global Market Expansion',
    description: 'Must support 5 languages and multi-currency right out of the box with zero layout breaking.',
    impact: 'Medium'
  },
  {
    id: 'ms-7',
    title: '🔒 Ultra High Privacy Standard',
    description: 'Zero cloud data storage permitted! All user data must remain encrypted on the local device.',
    impact: 'High'
  },
  {
    id: 'ms-8',
    title: '⚡ 100ms Ultra Latency Limit',
    description: 'Response time must feel instant. Any task taking longer than 100 milliseconds requires optimistic UI updates.',
    impact: 'Medium'
  },
  {
    id: 'ms-9',
    title: '🗣️ Voice-First Interaction',
    description: 'Screen is secondary! Primary user interactions must occur via audio prompt and voice commands.',
    impact: 'High'
  },
  {
    id: 'ms-10',
    title: '💰 Zero Third-Party API Budget',
    description: 'No paid APIs allowed (OpenAI, Maps, Twilio). Build custom fallback or use open-source local models.',
    impact: 'High'
  },
  {
    id: 'ms-11',
    title: '🔋 Extreme Battery Saving Mode',
    description: 'App must consume minimal CPU/GPU power to run efficiently on low-battery, low-spec devices.',
    impact: 'Medium'
  },
  {
    id: 'ms-12',
    title: '🤝 Gamification Mandate',
    description: 'Incorporate streak counts, rewards, or progress badges to boost daily active user retention by 50%.',
    impact: 'Low'
  }
];
