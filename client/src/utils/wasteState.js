/**
 * Waste State Management
 * 
 * Flow: generated → piled_up → cleaned → ready
 * 
 * States are stored per-product in localStorage keyed by a unique product identifier.
 * This keeps things simple without requiring backend changes.
 */
import axios from 'axios';

const STORAGE_KEY = 'wasteStates';

export const WASTE_STATES = {
  GENERATED: 'generated',
  PILED_UP: 'piled_up',
  DISPOSED: 'disposed',
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
    dotColor: 'bg-amber-400',
    description: 'Non-organic waste piled up for bulk disposal',
  },
  [WASTE_STATES.DISPOSED]: {
    label: 'Disposed',
    shortLabel: 'Done',
    emoji: '🎉',
    bg: 'bg-gray-100',
    text: 'text-gray-400',
    border: 'border-gray-200',
    dotColor: 'bg-gray-300',
    description: 'Waste has been correctly disposed of',
  },
};

export const STATE_ORDER = [
  WASTE_STATES.GENERATED,
  WASTE_STATES.PILED_UP,
  WASTE_STATES.DISPOSED,
];

/**
 * Generate a stable key for a product based on its name + scan context.
 * scanId can be a receipt ID or timestamp-based ID from localStorage.
 */
export function getProductKey(productName, scanId, index = 0) {
  return `${scanId || 'local'}::${productName}::${index}`;
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
  window.dispatchEvent(new Event('wasteStatesUpdated'));
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
  // Async sync to backend
  axios.post('/api/waste-states', { key: productKey, state: newState }).catch(console.error);
}

/** Pull states from backend and merge/overwrite local storage */
export async function syncStatesFromBackend() {
  try {
    const { data } = await axios.get('/api/waste-states');
    if (data && typeof data === 'object') {
      const local = loadStates();
      saveStates({ ...local, ...data });
    }
  } catch (err) {
    console.error('Failed to sync states from backend', err);
  }
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
  // Organic waste skips the pile-up step — dispose directly
  if (wasteCategory === 'Organic') {
    return [WASTE_STATES.GENERATED, WASTE_STATES.DISPOSED];
  }
  // Non-organic waste goes through pile-up before disposal
  return STATE_ORDER;
}

/** Check if waste category is non-organic (eligible for pile-up) */
export function isNonOrganic(wasteCategory) {
  return wasteCategory && wasteCategory !== 'Organic';
}

/** Get all states summary for dashboard stats */
export function getStateSummary(totalServerItems = 0) {
  const states = loadStates();
  const summary = {
    [WASTE_STATES.GENERATED]: 0,
    [WASTE_STATES.PILED_UP]: 0,
    [WASTE_STATES.DISPOSED]: 0,
    total: 0,
  };
  
  let totalInteracted = 0;
  Object.values(states).forEach(state => {
    if (summary[state] !== undefined) {
      summary[state]++;
    }
    totalInteracted++;
  });
  
  summary.total = Math.max(totalInteracted, totalServerItems);
  
  if (totalServerItems > totalInteracted) {
    summary[WASTE_STATES.GENERATED] += (totalServerItems - totalInteracted);
  }
  
  return summary;
}

/** Bulk-set multiple keys to a given state */
export function bulkSetWasteState(keys, newState) {
  const states = loadStates();
  keys.forEach(key => { states[key] = newState; });
  saveStates(states);
  // Async bulk sync to backend
  Promise.all(
    keys.map(key => axios.post('/api/waste-states', { key, state: newState }).catch(console.error))
  );
}
