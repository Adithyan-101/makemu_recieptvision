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
  ArrowRight
} from 'lucide-react';
import WasteStateTracker from '../components/WasteStateTracker';
import { 
  getWasteState, 
  setWasteState,
  getProductKey, 
  WASTE_STATES, 
  STATE_ORDER, 
  STATE_CONFIG 
} from '../utils/wasteState';

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
      [WASTE_STATES.DISPOSED]: [],
    };

    receipts.forEach(receipt => {
      const scanId = receipt._id || 'local';
      (receipt.products || []).forEach((product, index) => {
        const key = getProductKey(product.name, scanId, index);
        const state = getWasteState(key);
        
        if (grouped[state]) {
          grouped[state].push({
            ...product,
            scanId,
            index,
            scanDate: receipt.createdAt,
            expiryDate: product.daysRemaining != null 
              ? new Date(new Date(receipt.createdAt).getTime() + product.daysRemaining * 24 * 60 * 60 * 1000)
              : null
          });
        }
      });
    });

    // Sort each group: nearest expiry (or already expired) first, no-expiry items last
    Object.keys(grouped).forEach(state => {
      grouped[state].sort((a, b) => {
        const aDays = a.daysRemaining != null ? a.daysRemaining : Infinity;
        const bDays = b.daysRemaining != null ? b.daysRemaining : Infinity;
        return aDays - bDays;
      });
    });

    return grouped;
  }, [receipts, updateTrigger]);

  const totalPending = tasksByState[WASTE_STATES.GENERATED].length;

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
          {/* Grouped Lists */}
          {STATE_ORDER.filter(s => s !== WASTE_STATES.DISPOSED).reverse().map(state => {
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
                    <div key={getProductKey(item.name, item.scanId, item.index)} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-bold">
                              {item.wasteCategory}
                            </span>
                            <span className="text-gray-400 font-medium flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" />
                              {item.packaging || 'Unknown packaging'}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className={`font-medium ${item.expiryDate ? (item.expiryDate < new Date() ? 'text-rose-500 font-bold' : 'text-emerald-600') : 'text-gray-400'}`}>
                              {item.expiryDate 
                                ? `Expires ${item.expiryDate.toLocaleDateString()}` 
                                : `Scanned ${new Date(item.scanDate).toLocaleDateString()}`
                              }
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 sm:w-64 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-5">
                          <WasteStateTracker
                            productName={item.name}
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
              <div key={getProductKey(item.name, item.scanId, item.index)} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4 text-gray-500">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold line-through">{item.name}</span>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded font-bold">{item.wasteCategory}</span>
                </div>
                <button
                  onClick={() => {
                    setWasteState(getProductKey(item.name, item.scanId, item.index), WASTE_STATES.GENERATED);
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
