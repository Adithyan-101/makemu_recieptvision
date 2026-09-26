import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Package, ArrowRight, ScanLine } from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scan History</h1>
          <p className="text-gray-500 mt-1">Review your past receipts and waste predictions</p>
        </div>
        <Link to="/scan" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-medium rounded-xl transition-colors">
          <ScanLine className="w-5 h-5" />
          New Scan
        </Link>
      </div>

      {scans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No scans yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't scanned any receipts yet. Start scanning to track your packaging waste and get disposal plans.</p>
          <Link to="/scan" className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-sm">
            Scan your first receipt
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {scans.map((scan, idx) => (
            <div key={scan._id || idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl mt-1">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {new Date(scan.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Package className="w-4 h-4" />
                      {scan.products?.length || scan.totalItems || 0} products identified
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {scan.predictedWaste && scan.predictedWaste.slice(0, 4).map(({ category, count }) => (
                        <span key={category} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {category}: <span className="font-bold">{count}</span>
                        </span>
                      ))}
                      {scan.predictedWaste && scan.predictedWaste.length > 4 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500">
                          +{scan.predictedWaste.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right flex sm:block border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                  <Link 
                    to={`/analysis/${scan._id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors w-full sm:w-auto justify-center"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
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
