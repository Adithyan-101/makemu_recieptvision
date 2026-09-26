# ReceiptVision 🌿

### "From Receipt to Responsible Disposal"

An AI-powered predictive waste management platform that scans grocery receipts, predicts the waste your purchases will generate, and helps you dispose of it responsibly.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Maps API key (optional, for map features)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/receiptvision
GOOGLE_MAPS_API_KEY=your-key
VITE_GOOGLE_MAPS_API_KEY=your-key
GROQ_API_KEY=your-groq-api-key
DEMO_MODE=true
PORT=5000
```

### 3. Run the Application
```bash
# Run both frontend and backend
npm run dev

# Or separately:
npm run server  # Backend on port 5000
npm run client  # Frontend on port 5173
```

### 4. Open in Browser
Visit **http://localhost:5173**

## 🎮 Demo Mode

Demo mode (`DEMO_MODE=true`, default) ensures the entire app works without external services. Click **"Try Demo Receipt"** on the scan page to see the full flow.

## 🏗 Architecture

```
RECEIPT → OCR/AI → PRODUCT IDENTIFICATION → PACKAGING INFERENCE → WASTE FORECAST → DISPOSAL GUIDANCE → NEARBY CENTRES
```

### Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas
- **AI/OCR:** Groq API (Llama 4 Scout / Qwen 2.5 VL vision models)
- **Maps:** Google Maps JavaScript API + Places API (New)

## 📁 Project Structure
```
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components (9 pages)
│       ├── services/       # API client
│       ├── hooks/          # Custom React hooks
│       └── utils/          # Utilities and constants
├── server/                 # Express backend
│   ├── config/             # DB connection, seed data
│   ├── controllers/        # Route handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   └── services/           # AI service, product matcher
├── .env.example
└── README.md
```

## 🔌 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/receipts/analyze` | Analyze receipt image (or demo) |
| GET | `/api/receipts` | List all scans |
| GET | `/api/receipts/:id` | Get scan details |
| GET | `/api/waste-rules` | Get all waste rules |
| GET | `/api/waste-rules/:category` | Get rule by category |
| GET | `/api/dashboard` | Get user waste profile |
| GET | `/api/products/search?q=` | Search products |

## 🎯 Hackathon Demo Flow (< 2 min)

1. Open ReceiptVision landing page
2. Click "Scan a Receipt"
3. Click "Try Demo Receipt"
4. See 7 products identified with packaging + confidence
5. View waste breakdown (Plastic: 4, Paper: 1, Organic: 1, Special: 1)
6. Navigate to Waste Forecast (charts + timeline)
7. View Disposal Guide (expandable category cards)
8. Click "Find Nearby Centres"
9. Allow location → see real Google Maps results
10. Select a facility → view details + "Get Directions"
11. Visit Dashboard → eco score + stats

## ⚠️ Known Limitations

1. **No real authentication** — uses a demo user for the MVP
2. **Packaging inference is approximate** — based on a curated product database (~25 products)
3. **Waste rules are general** — not verified against specific local regulations
4. **Facility acceptance not verified** — Google Places results are candidates only
5. **Eco Score is a prototype metric** — not scientifically validated
6. **OCR accuracy depends on receipt quality** — demo mode recommended for reliable demos

## 📜 License

Built for hackathon demonstration purposes.
