import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Recycle, Trash2, BatteryWarning, Monitor, MapPin, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function DisposalGuide() {
  const navigate = useNavigate();
  const [wasteCategories, setWasteCategories] = useState([]);
  const [rules, setRules] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch generic rules from API
        const rulesRes = await axios.get('/api/waste-rules').catch(() => ({ data: [] }));
        
        let allRules = rulesRes.data;
        
        // If API fails or is empty, use some defaults for demo purposes
        if (!allRules || allRules.length === 0) {
          allRules = [
            {
              category: 'Plastic',
              isRecyclable: true,
              method: 'Blue Bin (Recycling)',
              instructions: ['Rinse container thoroughly', 'Remove caps and lids', 'Check bottom for recycling number (1, 2, and 5 are widely accepted)'],
              warning: 'Do not bag recyclables in plastic bags. Black plastics are often rejected.'
            },
            {
              category: 'Paper/Cardboard',
              isRecyclable: true,
              method: 'Blue Bin (Recycling)',
              instructions: ['Flatten all cardboard boxes', 'Ensure paper is clean and dry', 'Remove tape and shipping labels if possible'],
              warning: 'Greasy pizza boxes are not recyclable. Put soiled parts in organic waste.'
            },
            {
              category: 'Glass',
              isRecyclable: true,
              method: 'Glass Bin / Drop-off',
              instructions: ['Rinse completely', 'Remove metal/plastic lids (recycle separately)', 'Sort by color if required by your municipality'],
              warning: 'Broken glass, mirrors, and lightbulbs cannot go in regular glass recycling.'
            },
            {
              category: 'Metal',
              isRecyclable: true,
              method: 'Blue Bin (Recycling)',
              instructions: ['Rinse food residue', 'Tuck tin can lids inside the can and pinch closed', 'Crush aluminum cans to save space'],
              warning: null
            },
            {
              category: 'Organic',
              isRecyclable: true,
              method: 'Green Bin (Compost)',
              instructions: ['Scrape food waste directly into green bin', 'Use only certified compostable bags if lining bin', 'Include soiled paper towels and coffee grounds'],
              warning: 'No plastics, even if labelled "biodegradable", unless specifically marked "BPI Certified Compostable".'
            },
            {
              category: 'Battery/Special Waste',
              isRecyclable: false, // Standard bins
              method: 'Specialized Drop-off Only',
              instructions: ['Tape terminals of lithium and button batteries', 'Store in a cool, dry place until disposal', 'Take to a designated battery drop-off location'],
              warning: 'FIRE HAZARD: Never put batteries in regular garbage or recycling bins.'
            },
            {
              category: 'E-waste',
              isRecyclable: false, // Standard bins
              method: 'Electronic Recycling Center',
              instructions: ['Wipe all personal data from devices', 'Remove batteries if easily accessible', 'Bring cords and chargers along with the device'],
              warning: 'Contains toxic heavy metals. Illegal to dispose of in regular trash in many jurisdictions.'
            },
            {
              category: 'Other',
              isRecyclable: false,
              method: 'Black Bin (Garbage)',
              instructions: ['Place in regular trash bag', 'Tie securely'],
              warning: null
            }
          ];
        }
        
        setRules(allRules);

        // Figure out which categories the user actually has
        const localData = localStorage.getItem('lastAnalysis');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed.predictedWaste && parsed.predictedWaste.length > 0) {
            setWasteCategories(parsed.predictedWaste.map(w => w.category));
          } else {
            setWasteCategories(allRules.map(r => r.category));
          }
        } else {
          setWasteCategories(allRules.map(r => r.category));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleExpand = (category) => {
    setExpanded(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const getIcon = (category) => {
    switch (category) {
      case 'Battery/Special Waste': return <BatteryWarning className="w-6 h-6 text-red-500" />;
      case 'E-waste': return <Monitor className="w-6 h-6 text-orange-500" />;
      case 'Other': return <Trash2 className="w-6 h-6 text-gray-500" />;
      default: return <Recycle className="w-6 h-6 text-emerald-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter rules to only show categories the user has, or all if none
  const displayRules = rules.filter(r => 
    wasteCategories.length === 0 || wasteCategories.includes(r.category)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Disposal Guide</h1>
        <p className="text-gray-500 mt-1">How to properly dispose of your predicted waste</p>
      </div>

      {wasteCategories.length > 0 && wasteCategories.length < rules.length && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl mb-8 flex gap-3 border border-emerald-100">
          <Recycle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">This guide is customized based on your recent receipt scan.</p>
        </div>
      )}

      <div className="space-y-4">
        {displayRules.map((rule, idx) => {
          const isSpecial = rule.category === 'Battery/Special Waste' || rule.category === 'E-waste';
          const isExpanded = expanded[rule.category] !== false; // Default expanded

          return (
            <div 
              key={idx} 
              className={`bg-white rounded-2xl shadow-sm border transition-all ${
                isSpecial ? (rule.category === 'E-waste' ? 'border-orange-200' : 'border-red-200') : 'border-gray-200'
              } overflow-hidden`}
            >
              {/* Header (Clickable) */}
              <button 
                onClick={() => toggleExpand(rule.category)}
                className={`w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors ${
                  isExpanded ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isSpecial ? 'bg-red-50' : 'bg-emerald-50'}`}>
                    {getIcon(rule.category)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{rule.category}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {(rule.recyclable || rule.isRecyclable) ? (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Recyclable
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          {isSpecial ? 'Special Disposal' : 'Non-recyclable'}
                        </span>
                      )}
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> {rule.disposalMethod || rule.method}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-gray-400 p-2">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Expandable Content */}
              {isExpanded && (
                <div className="p-6 bg-gray-50/50">
                  {rule.warning && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-amber-800">{rule.warning}</p>
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Instructions</h3>
                  <ol className="list-decimal list-inside space-y-2 mb-6">
                    {rule.instructions.map((inst, i) => (
                      <li key={i} className="text-gray-700 pl-2">
                        <span className="-ml-2">{inst}</span>
                      </li>
                    ))}
                  </ol>

                  <button
                    onClick={() => navigate(`/map?category=${encodeURIComponent(rule.category)}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
                  >
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Find Nearby Facilities
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper icon component for inline arrow
function ArrowRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  );
}
