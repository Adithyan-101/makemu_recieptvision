import { useState, useCallback } from 'react';
import {
  WASTE_STATES,
  STATE_CONFIG,
  STATE_ORDER,
  getWasteState,
  setWasteState,
  getNextState,
  getFlowSteps,
  getProductKey,
  needsCleaning,
} from '../utils/wasteState';
import { ArrowRight, Check } from 'lucide-react';

/**
 * WasteStateTracker — inline component for a single product card.
 * Shows the current state, a progress bar, and a button to advance to the next state.
 */
export default function WasteStateTracker({ productName, wasteCategory, scanId, compact = false, onStateChange }) {
  const productKey = getProductKey(productName, scanId);
  const [currentState, setCurrentState] = useState(() => getWasteState(productKey));

  const flowSteps = getFlowSteps(wasteCategory);
  const currentIdx = flowSteps.indexOf(currentState);
  const nextState = getNextStateInFlow(currentState, flowSteps);
  const isComplete = currentState === WASTE_STATES.READY;
  const stateConfig = STATE_CONFIG[currentState];

  const advanceState = useCallback(() => {
    if (!nextState) return;
    setWasteState(productKey, nextState);
    setCurrentState(nextState);
    if (onStateChange) onStateChange(productKey, nextState);
  }, [productKey, nextState, onStateChange]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${stateConfig.bg} ${stateConfig.text} ${stateConfig.border}`}>
          {stateConfig.emoji} {stateConfig.shortLabel}
        </span>
        {nextState && (
          <button
            onClick={advanceState}
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            → {STATE_CONFIG[nextState].shortLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      {/* Progress Steps */}
      <div className="flex items-center gap-1 mb-2.5">
        {flowSteps.map((step, idx) => {
          const stepConfig = STATE_CONFIG[step];
          const isCurrent = step === currentState;
          const isPast = flowSteps.indexOf(step) < flowSteps.indexOf(currentState);
          const isFuture = flowSteps.indexOf(step) > flowSteps.indexOf(currentState);

          return (
            <div key={step} className="flex items-center gap-1 flex-1">
              {/* Step dot/circle */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300
                  ${isPast ? 'bg-emerald-500 text-white' : ''}
                  ${isCurrent ? `${stepConfig.bg} ${stepConfig.text} ring-2 ring-offset-1 ring-current scale-110` : ''}
                  ${isFuture ? 'bg-gray-100 text-gray-400' : ''}
                `}>
                  {isPast ? <Check className="w-3 h-3" /> : stepConfig.emoji}
                </div>
                <span className={`text-[9px] font-bold text-center leading-tight ${isCurrent ? stateConfig.text : isPast ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {stepConfig.shortLabel}
                </span>
              </div>

              {/* Connector line */}
              {idx < flowSteps.length - 1 && (
                <div className={`h-0.5 flex-1 rounded-full transition-all duration-300 -mt-3 ${isPast ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current State Badge + Action Button */}
      <div className="flex items-center justify-between gap-2">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${stateConfig.bg} ${stateConfig.text}`}>
          <span>{stateConfig.emoji}</span>
          <span>{stateConfig.label}</span>
        </div>

        {nextState && (
          <button
            onClick={advanceState}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
              transition-all duration-200 active:scale-95
              ${nextState === WASTE_STATES.CLEANED 
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm shadow-blue-200' 
                : nextState === WASTE_STATES.READY 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200'
              }
            `}
          >
            {nextState === WASTE_STATES.PILED_UP && '📦 Mark Piled Up'}
            {nextState === WASTE_STATES.CLEANED && '✨ Mark Cleaned'}
            {nextState === WASTE_STATES.READY && '✅ Ready to Dispose'}
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {isComplete && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
            <Check className="w-3.5 h-3.5" /> All set!
          </span>
        )}
      </div>

      {/* Cleaning hint for recyclables */}
      {currentState === WASTE_STATES.PILED_UP && needsCleaning(wasteCategory) && (
        <p className="mt-2 text-[11px] text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg font-medium">
          💡 Rinse and clean this {wasteCategory.toLowerCase()} packaging before marking as cleaned.
        </p>
      )}
    </div>
  );
}

/** Get the next state respecting the flow for this waste category */
function getNextStateInFlow(currentState, flowSteps) {
  const idx = flowSteps.indexOf(currentState);
  if (idx < 0 || idx >= flowSteps.length - 1) return null;
  return flowSteps[idx + 1];
}
