/**
 * Default Data & Presets for Event Spin Wheels
 * DRESTEIN '26 Theme - 4 Theme Colors Only: Cyan (#00C8FF), Yellow (#FFC800), Pink (#FF2A85), Purple (#8B3DFF)
 */

export const THEME_COLORS = ['#00C8FF', '#FFC800', '#FF2A85', '#8B3DFF'];

export const DEFAULT_WHEELS = {
  wheel1: {
    id: 'wheel1',
    title: 'Digital Experience',
    description: 'Wheel 1: Format / Digital Platform (12-15 options)',
    colorPalette: ['#00C8FF', '#FFC800', '#FF2A85', '#8B3DFF'],
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
    colorPalette: ['#00C8FF', '#FFC800', '#FF2A85', '#8B3DFF'],
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
    colorPalette: ['#00C8FF', '#FFC800', '#FF2A85', '#8B3DFF'],
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

export const DEFAULT_SPEED_FEATURES = [
  {
    id: 'sf-1',
    title: '⚡ 45-Min Rapid MVP Sprint',
    description: 'Build a clickable demo of the core happy path in under 45 minutes for bonus judging points.',
    badge: '45-Min MVP Sprint'
  },
  {
    id: 'sf-2',
    title: '🚀 60-Second Lightning Pitch',
    description: 'Final demo must be delivered in exactly 60 seconds with zero slides—pure live prototype walkthrough.',
    badge: '60s Lightning Pitch'
  },
  {
    id: 'sf-3',
    title: '⏱️ 15-Second Frictionless Onboarding',
    description: 'A first-time user must be able to complete their primary task within 15 seconds of opening the app.',
    badge: '15s Onboarding'
  },
  {
    id: 'sf-4',
    title: '🏎️ 3-Tap Micro Interaction Flow',
    description: 'All primary interactions must be fully operable in less than 3 taps / clicks.',
    badge: '3-Tap Flow'
  },
  {
    id: 'sf-5',
    title: '⏳ 30-Min Fast Pivot Challenge',
    description: 'Must adapt one feature mid-way to address a live mock user feedback prompt in under 30 minutes.',
    badge: 'Fast Pivot Challenge'
  },
  {
    id: 'sf-6',
    title: '🔥 Live Interactive Demo Only',
    description: 'No mockups or static screenshots during judging—must be run live in browser/device under pressure.',
    badge: 'Live Run Only'
  },
  {
    id: 'sf-7',
    title: '🎯 Single Killer Core Feature',
    description: 'Strip away all secondary features and polish 1 single killer interaction to perfection.',
    badge: 'Single Core Focus'
  },
  {
    id: 'sf-8',
    title: '💨 Turbo Power-User Shortcuts',
    description: 'Implement power-user hotkeys for every main action to enable lightning-fast navigation.',
    badge: 'Turbo Shortcuts'
  }
];

export const PROBLEM_TEMPLATES = [
  (exp, prod, user) => 
    `📖 **The Scenario:** A community of **${user}** relies heavily on their **${prod}** every single day. However, clunky interfaces, confusing controls, and rigid designs turn simple daily tasks into stressful bottlenecks.\n\n🎯 **Your Mission:** Design a breakthrough **${exp}** for the **${prod}** that completely transforms their daily experience—turning everyday friction into an intuitive, empowering, and delightful journey!`,

  (exp, prod, user) => 
    `📖 **The Scenario:** For **${user}**, operating a **${prod}** quickly becomes overwhelming under real-world time pressure and unique constraints. Traditional solutions completely overlook their accessibility and workflow needs.\n\n🎯 **Your Mission:** Build an innovative **${exp}** that acts as an intelligent, responsive co-pilot for the **${prod}**, delivering instant clarity, effortless accessibility, and rapid control when they need it most.`,

  (exp, prod, user) => 
    `📖 **The Scenario:** Traditional versions of **${prod}** were never built with **${user}** in mind. As technology advances, they face steep learning curves, frequent errors, and unnecessary daily complexity.\n\n🎯 **Your Mission:** Reimagine the future of the **${prod}** through a cutting-edge **${exp}**, purpose-built from the ground up to empower **${user}** with seamless, barrier-free interactions.`,

  (exp, prod, user) => 
    `📖 **The Scenario:** Imagine **${user}** trying to unlock the full potential of their **${prod}**, only to be held back by complicated setup, unhelpful feedback, and zero personalized guidance.\n\n🎯 **Your Mission:** Architect a human-centered **${exp}** that bridges this gap—empowering **${user}** to master their **${prod}** effortlessly, safely, and with complete confidence.`,

  (exp, prod, user) => 
    `📖 **The Scenario:** In fast-paced moments, **${user}** need their **${prod}** to deliver instantaneous results without second-guessing or deciphering complex manuals.\n\n🎯 **Your Mission:** Engineer a streamlined **${exp}** that strips away all complexity from the **${prod}**, delivering a lightning-fast, ultra-reliable, and highly rewarding experience for **${user}**.`
];

export function generateProblemStatement(digitalExp, product, constraint, templateIndex = 0) {
  if (!digitalExp || !product || !constraint || digitalExp === 'Pending Spin' || product === 'Pending Spin' || constraint === 'Pending Spin') {
    return 'Spin all 3 wheels to generate an AI-crafted story problem statement!';
  }
  const tpl = PROBLEM_TEMPLATES[templateIndex % PROBLEM_TEMPLATES.length];
  return tpl(digitalExp, product, constraint);
}

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
