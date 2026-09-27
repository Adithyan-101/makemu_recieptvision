import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckSquare, 
  Trash2, 
  AlertTriangle, 
  Package, 
  Sparkles, 
  CheckCircle,
  ArrowRight,
  Layers
} from 'lucide-react';
import WasteStateTracker from '../components/WasteStateTracker';
import { 
  getWasteState, 
  setWasteState,
  bulkSetWasteState,
  getProductKey, 
  WASTE_STATES, 
  STATE_ORDER, 
  STATE_CONFIG,
  isNonOrganic
} from '../utils/wasteState';

// Keyword-based upcycling tips for organic waste streams
const ORGANIC_TIPS = [
  { keywords: ['eggshell', 'egg shell'], emoji: '🥚', tip: 'Crush & sprinkle around plants — calcium fertilizer that also deters slugs.' },
  { keywords: ['banana', 'banana peel'], emoji: '🍌', tip: 'Soak in water 48h → potassium-rich fertilizer. Or bury near roses.' },
  { keywords: ['coffee', 'grounds', 'coffee grounds'], emoji: '☕', tip: 'Mix into soil for acid-loving plants like blueberries & ferns.' },
  { keywords: ['onion', 'garlic', 'skin', 'peel'], emoji: '🧅', tip: 'Boil skins in water, cool, and use to water plants — antifungal & nutrient-rich.' },
  { keywords: ['citrus', 'orange', 'lemon', 'lime'], emoji: '🍊', tip: 'Place near anthills as a natural repellent. Blend with vinegar for a DIY cleaner.' },
  { keywords: ['vegetable', 'veggie', 'carrot', 'celery', 'scrap', 'peel', 'top'], emoji: '🥕', tip: 'Boil into a vegetable stock. Carrot tops, celery ends & onion skins all work.' },
  { keywords: ['bone', 'bones'], emoji: '🦴', tip: 'Give to dogs (avoid chicken bones). Or bake & crush into bone meal fertilizer.' },
  { keywords: ['tea', 'tea bag', 'leaves'], emoji: '🍵', tip: 'Empty loose leaves around plants — deters pests and improves drainage.' },
  { keywords: ['corn', 'husk', 'cob'], emoji: '🌽', tip: 'Soak cobs for a natural scrubber. Husks can be used as garden mulch.' },
  { keywords: ['bread', 'stale'], emoji: '🍞', tip: 'Break into pieces for garden birds. Avoid composting large amounts.' },
  { keywords: ['fruit', 'apple', 'mango', 'grape'], emoji: '🍎', tip: 'Compost or bury near trees — fruit scraps enrich soil with sugars and microbes.' },
];

const CATEGORY_EMOJIS = {
  'Plastic': '♻️',
  'Paper/Cardboard': '📄',
  'Glass': '🍶',
  'Metal': '🥫',
  'E-waste': '💻',
  'Battery/Special Waste': '🔋',
  'Organic': '🌱',
  'Other': '📦',
};

const CATEGORY_COLORS = {
  'Plastic':               { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   btnFrom: 'from-blue-500',   btnTo: 'to-cyan-500',   btnHoverFrom: 'hover:from-blue-600',   btnHoverTo: 'hover:to-cyan-600' },
  'Paper/Cardboard':       { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  btnFrom: 'from-amber-500',  btnTo: 'to-orange-500', btnHoverFrom: 'hover:from-amber-600',  btnHoverTo: 'hover:to-orange-600' },
  'Glass':                 { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200', btnFrom: 'from-purple-500', btnTo: 'to-pink-500',   btnHoverFrom: 'hover:from-purple-600', btnHoverTo: 'hover:to-pink-600' },
  'Metal':                 { bg: 'bg-slate-100',  text: 'text-slate-700',  border: 'border-slate-300',  btnFrom: 'from-slate-500',  btnTo: 'to-gray-500',   btnHoverFrom: 'hover:from-slate-600',  btnHoverTo: 'hover:to-gray-600' },
  'E-waste':               { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200', btnFrom: 'from-orange-500', btnTo: 'to-red-500',    btnHoverFrom: 'hover:from-orange-600', btnHoverTo: 'hover:to-red-600' },
  'Battery/Special Waste': { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    btnFrom: 'from-red-500',    btnTo: 'to-rose-500',   btnHoverFrom: 'hover:from-red-600',    btnHoverTo: 'hover:to-rose-600' },
  'Other':                 { bg: 'bg-gray-50',    text: 'text-gray-700',   border: 'border-gray-200',   btnFrom: 'from-gray-500',   btnTo: 'to-slate-500',  btnHoverFrom: 'hover:from-gray-600',   btnHoverTo: 'hover:to-slate-600' },
};

function getOrganicTip(streamType) {
  if (!streamType) return null;
  const lower = streamType.toLowerCase();
  return ORGANIC_TIPS.find(t => t.keywords.some(k => lower.includes(k))) || null;
}

export default function PendingTasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterState = searchParams.get('state');
  
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  // We need a dummy state to force re-render when a WasteStateTracker updates localStorage
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await axios.get('/api/receipts');
        setReceipts(response.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, []);

  const handleStateChange = () => {
    // Force re-render to re-calculate groups
    setUpdateTrigger(prev => prev + 1);
  };

  useEffect(() => {
    window.addEventListener('wasteStatesUpdated', handleStateChange);
    return () => window.removeEventListener('wasteStatesUpdated', handleStateChange);
  }, []);

  const tasksByState = useMemo(() => {
    const grouped = {
      [WASTE_STATES.GENERATED]: [],
      [WASTE_STATES.PILED_UP]: [],
      [WASTE_STATES.DISPOSED]: [],
    };

    const timingLabels = {
      immediate:      { label: 'Dispose now',       icon: '🔵' },
      on_consumption: { label: 'When consumed',     icon: '🟡' },
      on_expiry:      { label: 'If expired/spoiled', icon: '🔴' },
    };

    receipts.forEach(receipt => {
      const scanId = receipt._id || 'local';
      (receipt.products || []).forEach((product, index) => {
        const expiryDate = product.daysRemaining != null
          ? new Date(new Date(receipt.createdAt || Date.now()).getTime() + product.daysRemaining * 24 * 60 * 60 * 1000)
          : null;

        if (product.wasteStreams && product.wasteStreams.length > 0) {
          // One task per waste stream
          product.wasteStreams.forEach((stream, streamIdx) => {
            const key = getProductKey(`${product.name}::${stream.type}`, scanId, index * 100 + streamIdx);
            const state = getWasteState(key);
            // Packaging/immediate streams don't expire — don't attach expiry info
            const isPackaging = stream.timing === 'immediate';
            if (grouped[state]) {
              grouped[state].push({
                name: product.name,
                streamType: stream.type,
                wasteCategory: stream.wasteCategory,
                timing: stream.timing,
                timingLabel: timingLabels[stream.timing] || { label: stream.timing, icon: '⚪' },
                isPackaging,
                packaging: product.packaging,
                storageCondition: product.storageCondition,
                // Only attach expiry data for perishable streams
                daysRemaining: isPackaging ? null : product.daysRemaining,
                expiryDate: isPackaging ? null : expiryDate,
                scanId,
                index: index * 100 + streamIdx,
                scanDate: receipt.createdAt,
                _key: key,
              });
            }
          });
        } else {
          // Fallback: product has no streams — treat whole product as one task
          const key = getProductKey(product.name, scanId, index);
          const state = getWasteState(key);
          if (grouped[state]) {
            grouped[state].push({
              name: product.name,
              streamType: null,
              wasteCategory: product.wasteCategory,
              timing: null,
              timingLabel: null,
              packaging: product.packaging,
              storageCondition: product.storageCondition,
              daysRemaining: product.daysRemaining,
              expiryDate,
              scanId,
              index,
              scanDate: receipt.createdAt,
              _key: key,
            });
          }
        }
      });
    });

    // Sort: perishable/expiring items first, packaging (no expiry) always at bottom
    Object.keys(grouped).forEach(state => {
      grouped[state].sort((a, b) => {
        // Packaging items always go to the bottom
        if (a.isPackaging && !b.isPackaging) return 1;
        if (!a.isPackaging && b.isPackaging) return -1;
        // Both perishable: sort by soonest expiry first
        const aDays = a.daysRemaining != null ? a.daysRemaining : Infinity;
        const bDays = b.daysRemaining != null ? b.daysRemaining : Infinity;
        return aDays - bDays;
      });
    });

    return grouped;
  }, [receipts, updateTrigger]);

  // Group piled-up items by waste category for the bulk section
  const piledUpByCategory = useMemo(() => {
    const groups = {};
    tasksByState[WASTE_STATES.PILED_UP].forEach(item => {
      const cat = item.wasteCategory || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [tasksByState]);

  const handleDisposeAll = (category) => {
    const items = piledUpByCategory[category];
    if (!items || items.length === 0) return;
    const keys = items.map(item => item._key);
    bulkSetWasteState(keys, WASTE_STATES.DISPOSED);
    handleStateChange();
  };

  const totalGenerated = tasksByState[WASTE_STATES.GENERATED].length;
  const totalPiledUp = tasksByState[WASTE_STATES.PILED_UP].length;
  const totalPending = totalGenerated + totalPiledUp;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-semibold">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="animate-fade-in flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Action Items</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">Pending Tasks</h1>
          <p className="text-gray-400 mt-1 font-medium">Items that need your attention for proper disposal.</p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 inline-flex items-center gap-3 self-start sm:self-end">
          <span className="text-gray-500 text-sm font-bold">Total Pending:</span>
          <span className="text-xl font-black text-emerald-600">{totalPending}</span>
          {totalPiledUp > 0 && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              📦 {totalPiledUp} piled
            </span>
          )}
        </div>
      </div>

      {totalPending === 0 ? (
        <div className="animate-fade-in-up bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">You're all caught up!</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
            There are no items waiting for processing. Every item from your scans has been successfully disposed of.
          </p>
          <Link to="/scan" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all">
            Scan new receipt
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Generated Items — Main Task List */}
          {totalGenerated > 0 && (
            <>
              {[WASTE_STATES.GENERATED].map(state => {
                if (filterState && filterState !== state) return null;
                
                const items = tasksByState[state];
                if (items.length === 0) return null;

                const config = STATE_CONFIG[state];
                
                return (
                  <div key={state} className="animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-4 pl-1">
                      <span className="text-2xl">{config.emoji}</span>
                      <div>
                        <h2 className="text-xl font-black text-gray-900">{config.label}</h2>
                        <p className="text-sm text-gray-400 font-medium">{config.description}</p>
                      </div>
                      <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
                        {items.length} item{items.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {items.map((item) => (
                        <div key={item._key} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                {item.timingLabel && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    {item.timingLabel.icon} {item.timingLabel.label}
                                  </span>
                                )}
                              </div>
                              {item.streamType && (
                                <p className="text-sm font-semibold text-emerald-700 mb-1">↳ {item.streamType}</p>
                              )}
                              {/* Organic upcycling tip */}
                              {item.wasteCategory === 'Organic' && (() => {
                                const tip = getOrganicTip(item.streamType || item.name);
                                return tip ? (
                                  <div className="flex items-start gap-2 mt-1 mb-2 px-3 py-2 bg-green-50 border border-green-100 rounded-xl">
                                    <span className="text-base flex-shrink-0">{tip.emoji}</span>
                                    <p className="text-xs text-green-800 font-medium leading-snug">
                                      <span className="font-bold">Instead of binning: </span>{tip.tip}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="flex items-start gap-2 mt-1 mb-2 px-3 py-2 bg-green-50 border border-green-100 rounded-xl">
                                    <span className="text-base">🌱</span>
                                    <p className="text-xs text-green-800 font-medium leading-snug">
                                      <span className="font-bold">Compost it: </span>Add to your green bin or home compost pile to enrich soil.
                                    </p>
                                  </div>
                                );
                              })()}
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-bold">
                                  {item.wasteCategory}
                                </span>
                                <span className="text-gray-400 font-medium flex items-center gap-1">
                                  <Package className="w-3.5 h-3.5" />
                                  {item.packaging || 'Unknown packaging'}
                                </span>
                                <span className="text-gray-300">•</span>
                                {item.isPackaging ? (
                                  <span className="font-medium text-blue-500 flex items-center gap-1">
                                    🏭 Pile up &amp; bulk dispose at nearest hub
                                  </span>
                                ) : item.expiryDate ? (
                                  <span className={`font-medium ${item.expiryDate < new Date() ? 'text-rose-500 font-bold' : 'text-emerald-600'}`}>
                                    {item.expiryDate < new Date() ? '⚠️ Expired' : `Expires ${item.expiryDate.toLocaleDateString()}`}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 font-medium">
                                    Scanned {new Date(item.scanDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0 sm:w-64 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-5">
                              <WasteStateTracker
                                productName={`${item.name}::${item.streamType || ''}`}
                                wasteCategory={item.wasteCategory}
                                scanId={item.scanId}
                                index={item.index}
                                onStateChange={handleStateChange}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* Pending Waste — Piled-Up Items Grouped by Category       */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {totalPiledUp > 0 && (
            <div className="animate-fade-in-up mt-2 pt-8 border-t-2 border-dashed border-amber-200/60">
              <div className="flex items-center gap-3 mb-6 pl-1">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Pending Waste</h2>
                  <p className="text-sm text-gray-400 font-medium">Non-organic waste piled up — dispose by category when ready</p>
                </div>
                <div className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {totalPiledUp} item{totalPiledUp !== 1 ? 's' : ''} across {Object.keys(piledUpByCategory).length} {Object.keys(piledUpByCategory).length === 1 ? 'category' : 'categories'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Object.entries(piledUpByCategory).map(([category, items]) => {
                  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
                  const catEmoji = CATEGORY_EMOJIS[category] || '📦';
                  
                  return (
                    <div
                      key={category}
                      className={`rounded-2xl border-2 ${catColor.border} ${catColor.bg} p-5 shadow-sm hover:shadow-md transition-shadow duration-200`}
                    >
                      {/* Category Header */}
                      <div className="flex items-center gap-2.5 mb-4">
                        <span className="text-xl">{catEmoji}</span>
                        <h3 className="font-black text-gray-900 text-base">{category}</h3>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${catColor.text} bg-white/80 border ${catColor.border}`}>
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {items.map(item => (
                          <div
                            key={item._key}
                            className="flex items-center justify-between gap-2 text-sm bg-white/70 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/50"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-gray-800 truncate">{item.name}</span>
                              {item.streamType && (
                                <span className="text-[11px] text-gray-400 font-medium flex-shrink-0">↳ {item.streamType}</span>
                              )}
                            </div>
                            {item.packaging && (
                              <span className="text-[10px] text-gray-400 font-medium flex-shrink-0 hidden sm:inline">
                                {item.packaging}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Dispose All Button */}
                      <button
                        onClick={() => handleDisposeAll(category)}
                        className={`
                          w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                          text-white bg-gradient-to-r ${catColor.btnFrom} ${catColor.btnTo}
                          ${catColor.btnHoverFrom} ${catColor.btnHoverTo}
                          shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]
                        `}
                      >
                        <Trash2 className="w-4 h-4" />
                        Dispose All{items.length > 1 ? ` (${items.length})` : ''}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recently Completed / Undo Section */}
      {tasksByState[WASTE_STATES.DISPOSED].length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Recently Completed
          </h2>
          <div className="space-y-3">
            {tasksByState[WASTE_STATES.DISPOSED].slice(0, 5).map((item) => (
              <div key={item._key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4 text-gray-500">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="font-bold line-through">{item.name}</span>
                    {item.streamType && <span className="text-xs text-gray-400 ml-1">↳ {item.streamType}</span>}
                  </div>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded font-bold">{item.wasteCategory}</span>
                </div>
                <button
                  onClick={() => {
                    setWasteState(item._key, WASTE_STATES.GENERATED);
                    handleStateChange();
                  }}
                  className="text-xs font-bold px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
