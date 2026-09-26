import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Package, ArrowRight, ScanLine, History } from 'lucide-react';
import axios from 'axios';

export default function ScanHistory() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/receipts');
        setScans(response.data || []);
      } catch (err) {
        console.error(err);
        setScans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-semibold">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="animate-fade-in flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">History</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">Scan History</h1>
          <p className="text-gray-400 mt-1 font-medium">Review your past receipts and waste predictions</p>
        </div>
        <Link to="/scan" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl transition-colors">
          <ScanLine className="w-5 h-5" />
          New Scan
        </Link>
      </div>

      {scans.length === 0 ? (
        <div className="animate-fade-in-up bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">No scans yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">You haven't scanned any receipts yet. Start scanning to track your packaging waste and get disposal plans.</p>
          <Link to="/scan" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all">
            Scan your first receipt
          </Link>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {scans.map((scan, idx) => (
            <div key={scan._id || idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-2xl mt-1">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">
                      {new Date(scan.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2 mt-1 font-medium">
                      <Package className="w-4 h-4" />
                      {scan.products?.length || scan.totalItems || 0} products identified
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {scan.predictedWaste && scan.predictedWaste.slice(0, 4).map(({ category, count }) => (
                        <span key={category} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-gray-50 text-gray-600 border border-gray-100">
                          {category}: <span className="text-gray-900">{count}</span>
                        </span>
                      ))}
                      {scan.predictedWaste && scan.predictedWaste.length > 4 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-gray-50 text-gray-400">
                          +{scan.predictedWaste.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right flex sm:block border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                  <Link 
                    to={`/analysis/${scan._id}`}
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all w-full sm:w-auto justify-center shadow-sm"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
