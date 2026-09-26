import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ScanReceipt from './pages/ScanReceipt'
import ReceiptAnalysis from './pages/ReceiptAnalysis'
import WasteForecast from './pages/WasteForecast'
import DisposalGuide from './pages/DisposalGuide'
import NearbyMap from './pages/NearbyMap'
import ScanHistory from './pages/ScanHistory'
import Profile from './pages/Profile'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan" element={<ScanReceipt />} />
          <Route path="/analysis/:id" element={<ReceiptAnalysis />} />
          <Route path="/forecast" element={<WasteForecast />} />
          <Route path="/disposal" element={<DisposalGuide />} />
          <Route path="/map" element={<NearbyMap />} />
          <Route path="/history" element={<ScanHistory />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
