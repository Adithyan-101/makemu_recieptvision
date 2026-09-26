/**
 * Waste State Management
 * 
 * Flow: generated → piled_up → cleaned → ready
 * 
 * States are stored per-product in localStorage keyed by a unique product identifier.
 * This keeps things simple without requiring backend changes.
 */

const STORAGE_KEY = 'wasteStates';

export const WASTE_STATES = {
  GENERATED: 'generated',
  PILED_UP: 'piled_up',
  CLEANED: 'cleaned',
  READY: 'ready',
};

export const STATE_CONFIG = {
  [WASTE_STATES.GENERATED]: {
    label: 'Generated',
    shortLabel: 'New',
    emoji: '🗑️',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
    dotColor: 'bg-gray-400',
    description: 'Waste has been generated from this product',
  },
  [WASTE_STATES.PILED_UP]: {
    label: 'Piled Up',
    shortLabel: 'Piled',
    emoji: '📦',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
    description: 'Collected and accumulated for processing',
  },
  [WASTE_STATES.CLEANED]: {
    label: 'Cleaned',
    shortLabel: 'Clean',
    emoji: '✨',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dotColor: 'bg-blue-500',
    description: 'Emptied, rinsed, and ready for disposal',
  },
  [WASTE_STATES.READY]: {
    label: 'Ready to Dispose',
    shortLabel: 'Ready',
    emoji: '✅',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    description: 'Prepared and ready for proper disposal',
  },
};

export const STATE_ORDER = [
  WASTE_STATES.GENERATED,
  WASTE_STATES.PILED_UP,
  WASTE_STATES.CLEANED,
  WASTE_STATES.READY,
];

/**
 * Generate a stable key for a product based on its name + scan context.
 * scanId can be a receipt ID or timestamp-based ID from localStorage.
 */
export function getProductKey(productName, scanId) {
  return `${scanId || 'local'}::${productName}`;
}

/** Load all waste states from localStorage */
function loadStates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Save all waste states to localStorage */
function saveStates(states) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
}

/** Get the current state for a product */
export function getWasteState(productKey) {
  const states = loadStates();
  return states[productKey] || WASTE_STATES.GENERATED;
}

/** Set the state for a product */
export function setWasteState(productKey, newState) {
  const states = loadStates();
  states[productKey] = newState;
  saveStates(states);
}

/** Get the next state in the flow */
export function getNextState(currentState) {
  const idx = STATE_ORDER.indexOf(currentState);
  if (idx < 0 || idx >= STATE_ORDER.length - 1) return null;
  return STATE_ORDER[idx + 1];
}

/** Check if a product needs cleaning (recyclable packaging types) */
export function needsCleaning(wasteCategory) {
  return ['Plastic', 'Glass', 'Metal'].includes(wasteCategory);
}

/** Get the applicable flow steps for a waste category */
export function getFlowSteps(wasteCategory) {
  if (needsCleaning(wasteCategory)) {
    // Recyclables: Generated → Pile Up → Cleaned → Ready
    return STATE_ORDER;
  }
  // Non-cleanable (Organic, Paper, etc.): Generated → Pile Up → Ready (skip Cleaned)
  return [WASTE_STATES.GENERATED, WASTE_STATES.PILED_UP, WASTE_STATES.READY];
}

/** Get all states summary for dashboard stats */
export function getStateSummary() {
  const states = loadStates();
  const summary = {
    [WASTE_STATES.GENERATED]: 0,
    [WASTE_STATES.PILED_UP]: 0,
    [WASTE_STATES.CLEANED]: 0,
    [WASTE_STATES.READY]: 0,
    total: 0,
  };
  Object.values(states).forEach(state => {
    if (summary[state] !== undefined) {
      summary[state]++;
    }
    summary.total++;
  });
  return summary;
}
