// Mock Database Service for AdViral AI
// Synchronizes fully with LocalStorage to simulate Supabase operations in client-only mode
import { safeStorage } from './safeStorage';

const STORAGE_KEYS = {
  USERS: 'adviral_users',
  GENERATIONS: 'adviral_generations',
  API_SETTINGS: 'adviral_api_settings',
  PLANS: 'adviral_plans',
  TRANSACTIONS: 'adviral_transactions',
};

// Seed Data
const DEFAULT_PLANS = [
  { id: 'plan_free', plan_name: 'Free', credits: 50, price: 0, features: ['50 monthly credits', 'AI Ad Copy Generator', 'Viral Hook Builder', 'Basic Email Support'] },
  { id: 'plan_pro', plan_name: 'Pro', credits: 1000, price: 49, features: ['1,000 monthly credits', 'All AI Generators', 'Priority Support', 'Saved Projects Folder', 'Stripe Payments Access'] },
  { id: 'plan_enterprise', plan_name: 'Enterprise', credits: 99999, price: 199, features: ['Unlimited credits', 'All AI Generators', '24/7 Dedicated Support', 'Saved Projects Folder', 'Team Collaboration Accounts', 'Custom AI Provider Switching'] },
];

const DEFAULT_USERS = [
  {
    id: 'admin-uuid-1',
    name: 'Chief Admin',
    email: 'admin@adviral.ai',
    password: 'admin', // Simple passwords for demonstration purposes
    role: 'admin',
    credits: 99999,
    plan: 'Enterprise',
    is_banned: false,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  },
  {
    id: 'user-uuid-1',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    password: 'password',
    role: 'user',
    credits: 35,
    plan: 'Free',
    is_banned: false,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  {
    id: 'user-uuid-2',
    name: 'Sarah Jenkins',
    email: 'sarah@agency.co',
    password: 'password',
    role: 'user',
    credits: 820,
    plan: 'Pro',
    is_banned: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: 'user-uuid-3',
    name: 'Marc Marcus',
    email: 'marc@ecombrands.io',
    password: 'password',
    role: 'user',
    credits: 120,
    plan: 'Pro',
    is_banned: true, // Seeding one banned user to show admin ban mechanics works!
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const DEFAULT_API_SETTINGS = [
  { id: 'api-1', provider_name: 'openai', api_key: 'sk-proj-••••••••••••••••U98A', status: true, is_default: true, created_at: new Date().toISOString() },
  { id: 'api-2', provider_name: 'gemini', api_key: 'AIzaSy••••••••••••••••Hj91', status: false, is_default: false, created_at: new Date().toISOString() },
];

const DEFAULT_GENERATIONS = [
  {
    id: 'gen-1',
    user_id: 'user-uuid-1',
    tool_type: 'ad_generator',
    input_data: {
      product_name: 'GlowSip Collagen',
      product_description: 'Organic berry-flavored powdered collagen drink mix for radiant skin and hair.',
      target_audience: 'Beauty & Skincare enthusiasts (ages 22-45)',
      platform: 'Instagram',
      tone: 'Witty',
      cta_style: 'Shop Now',
    },
    generated_result: {
      headlines: [
        'Beauty sleep in a cup? Yes, please! 🍓',
        'Ditch the multi-step routine. Drink your glow instead.',
        'The skincare secret your dermatologist won’t tell you.'
      ],
      hooks: [
        'Stop spending $150 on face creams that do nothing.',
        'This one drink mix is replacing my entire beauty cabinet.',
        'Is collagen actually worth the hype? We tested it.'
      ],
      copy: 'Listen, skincare is an inside job. You can slather on all the expensive serums you want, but if you aren\'t nourishing your body from within, you\'re just painting a leaky house. 🏠✨\n\nMeet GlowSip: Organic, berry-infused collagen that dissolves in seconds and tastes like absolute heaven. Just one scoop a day supports skin elasticity, hair growth, and overall radiance. Plus, zero sugar and packed with antioxidants. \n\nStop overcomplicating beauty. Keep it simple, organic, and delicious. Click below to secure yours today! 👇',
      ctas: ['Tap "Shop Now" for 20% off your first jar!', 'Shop GlowSip Radiant Skincare now.'],
      viral_angles: [
        'Routine Simplification: "I replaced 5 skincare serums with 1 berry drink."',
        'Under $2/Day Luxury: "Cheaper than a latte, better than a luxury facial."'
      ]
    },
    credits_used: 1,
    is_saved: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'gen-2',
    user_id: 'user-uuid-2',
    tool_type: 'viral_hooks',
    input_data: {
      product_name: 'HyperFocus Planner',
      product_description: 'Undated daily goal-setting notebook built for ADHD minds, using scientifically proven dopamine-stacking hacks.',
      target_audience: 'Entrepreneurs and students with ADHD',
      tone: 'Bold',
    },
    generated_result: {
      curiosity_hooks: [
        'Why standard planners are actually toxic for ADHD brains...',
        'The dopamine-stacking secret they don’t want you to know about productivity.'
      ],
      emotional_hooks: [
        'I felt like a lazy failure for 5 years. Then I discovered this.',
        'To anyone who has 15 unfinished planners gathering dust on their shelf...'
      ],
      fear_hooks: [
        'You are losing 3 hours a day to executive dysfunction.',
        'If you keep trying to organize your day like a neurotypical, you will burn out by Sunday.'
      ],
      viral_hooks: [
        'ADHD brains do NOT work in standard calendars. Try this instead.',
        'How to trick your brain into getting things done without forcing it.'
      ],
      short_form_hooks: [
        'ADHD Productivity Hack you need to try ASAP 🧠',
        'Stop scrolling if your brain has 50 tabs open right now.'
      ]
    },
    credits_used: 1,
    is_saved: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'gen-3',
    user_id: 'user-uuid-2',
    tool_type: 'ugc_scripts',
    input_data: {
      product_name: 'FitFlow Resistance Bands',
      product_description: 'Heavy duty, premium fabric hip loops that do not slip, pinch or roll up, bundled with an online workout app.',
      target_audience: 'Busy moms wanting quick home workouts',
      tone: 'Energetic',
    },
    generated_result: {
      tiktok_script: {
        visual: 'Hook: Mom showing standard rubber bands snapping & rolling, looking frustrated. Transitions to stretching FitFlow bands easily while laughing with her baby.',
        audio: 'Upbeat modern pop music.',
        dialogue: 'Are you still using those cheap rubber resistance bands that pinch your skin, roll up, and eventually SNAP mid-squat? 🙄 Stop! I replaced all my gym equipment with this fabric FitFlow set. They physically cannot slip, they are padded, and they come with a free app of 10-minute workouts I can do while my baby takes a nap. Trust me, mama, your glutes will thank you. Get yours now!'
      },
      testimonial_script: {
        visual: 'Medium shot of user looking relaxed in her living room, holding the resistance band.',
        audio: 'Soft inspiring music.',
        dialogue: 'Honestly, as a busy mom of two, getting to the gym was impossible. I felt so guilty. But the FitFlow bands changed everything. I get a burning workout in just 10 minutes, and the bands stay exactly where they belong. The quality is next level. 10/10!'
      },
      problem_solution_script: {
        visual: 'Split screen: Left side shows rubber band snapping, right side shows a woman easily completing a set of lateral walks.',
        audio: 'Trendy background track.',
        dialogue: 'The problem? Rubber bands are uncomfortable, they roll down, and they break. The solution? FitFlow premium fabric bands. They stay put, they are insanely durable, and they actually work. Get yours today!'
      },
      thirty_second_ad: {
        visual: 'Dynamic montage of different women using the bands in home settings. Ends with a CTA product shot.',
        audio: 'Punchy energetic beat.',
        dialogue: 'Say goodbye to pinching, slipping, and cheap rubber. FitFlow premium fabric bands are designed to stay in place, support maximum resistance, and power up your home workouts. Click the link below to get 25% off today. Move your way!'
      }
    },
    credits_used: 1,
    is_saved: true,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  }
];

const DEFAULT_TRANSACTIONS = [
  { id: 'tx-1', user_id: 'user-uuid-2', credits_added: 1000, amount: 49.00, payment_status: 'completed', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'tx-2', user_id: 'user-uuid-3', credits_added: 1000, amount: 49.00, payment_status: 'completed', created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
];

// LocalStorage Helper functions
const getStored = (key, fallback) => {
  const data = safeStorage.getItem(key);
  if (!data) {
    safeStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(data);
};

const setStored = (key, data) => {
  safeStorage.setItem(key, JSON.stringify(data));
};

// Database Initialization
export const initMockDb = () => {
  getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
  getStored(STORAGE_KEYS.GENERATIONS, DEFAULT_GENERATIONS);
  getStored(STORAGE_KEYS.API_SETTINGS, DEFAULT_API_SETTINGS);
  getStored(STORAGE_KEYS.PLANS, DEFAULT_PLANS);
  getStored(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
};

// Seed db immediately on import
initMockDb();

// Exported DB operations
export const mockDb = {
  // --- USERS API ---
  getUsers: () => getStored(STORAGE_KEYS.USERS, DEFAULT_USERS),
  
  getUserById: (id) => {
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    return users.find(u => u.id === id) || null;
  },
  
  createUser: (user) => {
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const newUser = {
      id: `user-uuid-${Date.now()}`,
      role: 'user',
      credits: 50, // default welcome credits
      plan: 'Free',
      is_banned: false,
      created_at: new Date().toISOString(),
      ...user
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    return newUser;
  },
  
  updateUser: (id, data) => {
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...data };
    setStored(STORAGE_KEYS.USERS, users);
    return users[index];
  },
  
  deleteUser: (id) => {
    let users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    users = users.filter(u => u.id !== id);
    setStored(STORAGE_KEYS.USERS, users);
    return true;
  },

  // --- GENERATIONS API ---
  getGenerations: () => getStored(STORAGE_KEYS.GENERATIONS, DEFAULT_GENERATIONS),
  
  getGenerationsByUserId: (userId) => {
    const gens = getStored(STORAGE_KEYS.GENERATIONS, DEFAULT_GENERATIONS);
    return gens.filter(g => g.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  
  createGeneration: (gen) => {
    const gens = getStored(STORAGE_KEYS.GENERATIONS, DEFAULT_GENERATIONS);
    const newGen = {
      id: `gen-uuid-${Date.now()}`,
      credits_used: 1,
      is_saved: false,
      created_at: new Date().toISOString(),
      ...gen
    };
    gens.push(newGen);
    setStored(STORAGE_KEYS.GENERATIONS, gens);
    return newGen;
  },
  
  updateGeneration: (id, data) => {
    const gens = getStored(STORAGE_KEYS.GENERATIONS, DEFAULT_GENERATIONS);
    const index = gens.findIndex(g => g.id === id);
    if (index === -1) return null;
    
    gens[index] = { ...gens[index], ...data };
    setStored(STORAGE_KEYS.GENERATIONS, gens);
    return gens[index];
  },

  deleteGeneration: (id) => {
    let gens = getStored(STORAGE_KEYS.GENERATIONS, DEFAULT_GENERATIONS);
    gens = gens.filter(g => g.id !== id);
    setStored(STORAGE_KEYS.GENERATIONS, gens);
    return true;
  },

  // --- API SETTINGS API ---
  getApiSettings: () => getStored(STORAGE_KEYS.API_SETTINGS, DEFAULT_API_SETTINGS),
  
  updateApiSetting: (providerName, data) => {
    const apis = getStored(STORAGE_KEYS.API_SETTINGS, DEFAULT_API_SETTINGS);
    const index = apis.findIndex(a => a.provider_name === providerName);
    if (index === -1) return null;
    
    apis[index] = { ...apis[index], ...data };
    setStored(STORAGE_KEYS.API_SETTINGS, apis);
    return apis[index];
  },
  
  switchDefaultProvider: (providerName) => {
    const apis = getStored(STORAGE_KEYS.API_SETTINGS, DEFAULT_API_SETTINGS);
    const updated = apis.map(a => ({
      ...a,
      is_default: a.provider_name === providerName
    }));
    setStored(STORAGE_KEYS.API_SETTINGS, updated);
    return updated;
  },

  // --- PLANS & PRICING API ---
  getPlans: () => getStored(STORAGE_KEYS.PLANS, DEFAULT_PLANS),
  
  updatePlan: (id, data) => {
    const plans = getStored(STORAGE_KEYS.PLANS, DEFAULT_PLANS);
    const index = plans.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    plans[index] = { ...plans[index], ...data };
    setStored(STORAGE_KEYS.PLANS, plans);
    return plans[index];
  },
  
  createPlan: (plan) => {
    const plans = getStored(STORAGE_KEYS.PLANS, DEFAULT_PLANS);
    const newPlan = {
      id: `plan_${Date.now()}`,
      ...plan
    };
    plans.push(newPlan);
    setStored(STORAGE_KEYS.PLANS, plans);
    return newPlan;
  },

  deletePlan: (id) => {
    let plans = getStored(STORAGE_KEYS.PLANS, DEFAULT_PLANS);
    plans = plans.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PLANS, plans);
    return true;
  },

  // --- TRANSACTIONS API ---
  getTransactions: () => getStored(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS),
  
  createTransaction: (tx) => {
    const txs = getStored(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
    const newTx = {
      id: `tx-uuid-${Date.now()}`,
      payment_status: 'completed',
      created_at: new Date().toISOString(),
      ...tx
    };
    txs.push(newTx);
    setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    return newTx;
  },
};
