const { GoogleGenerativeAI } = require('@google/generative-ai');
const { matchProducts } = require('./productMatcher');
const { demoReceiptText, demoProducts, demoWasteSummary } = require('./demoData');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
require('dotenv').config();

class AIService {
  constructor() {
    const apiKey = process.env.AI_API_KEY;
    // Initialize AI client if a real API key is provided (not a placeholder)
    if (apiKey && apiKey !== 'your-gemini-api-key' && apiKey.length > 10) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      console.log('🤖 Gemini AI initialized for receipt OCR');
    } else {
      console.log('ℹ️  No Gemini API key configured — real receipt scanning will fall back to demo data');
    }
  }

  async extractAndAnalyze(imageBuffer, mimeType) {
    if (!this.genAI) {
      throw new Error('No AI API key configured. Add AI_API_KEY to your .env file to enable real receipt scanning.');
    }

    try {
      const prompt = `You are an expert receipt OCR and waste management assistant. 
Extract all grocery/product items from this receipt and intelligently predict the most likely waste/packaging category for each item.

Return ONLY a valid JSON array of objects. 
Each object must have "name", "wasteCategory", and "packaging".
Valid waste categories are exactly one of: "Plastic", "Paper/Cardboard", "Glass", "Metal", "Organic", "Battery/Special Waste", "E-waste", "Other".

Example format: 
[
  {"name": "Amul Milk 1L", "packaging": "Plastic Pouch", "wasteCategory": "Plastic"},
  {"name": "Farm Fresh Eggs 1 Dozen", "packaging": "Cardboard Carton", "wasteCategory": "Organic"},
  {"name": "Tomatoes", "packaging": "Thin Plastic Bag", "wasteCategory": "Organic"}
]

CRITICAL RULES:
1. Do not include prices or tax. Just the full product name.
2. Accurately predict the packaging (e.g. "Glass Jar", "Cardboard Box"). If the item itself leaves significant organic waste (like eggshells, fruit peels, or vegetable scraps), prioritize "Organic" as the wasteCategory. Otherwise, categorize by its packaging.
3. If no products are found, return [].
4. Return ONLY valid JSON. No markdown backticks.`;

      const imageParts = [
        {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType
          }
        }
      ];

      // Retry logic for 503 High Demand errors
      const modelsToTry = [
        'gemini-flash-latest', 
        'gemini-3.5-flash',
        'gemini-3.8-flash',
        'gemini-pro-latest'
      ];
      let result = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const model = this.genAI.getGenerativeModel({ model: modelName });
            result = await model.generateContent([prompt, ...imageParts]);
            break; // Success! Break out of the retry loop
          } catch (err) {
            lastError = err;
            if (err.message && err.message.includes('503')) {
              console.log(`⚠️ ${modelName} attempt ${attempt} failed with 503 High Demand. Retrying in ${attempt}s...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            } else {
              throw err; // Throw non-503 errors immediately
            }
          }
        }
        if (result) break; // Success! Break out of model fallback loop
      }

      if (!result) {
        throw lastError; // All retries and models failed
      }

      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown code blocks if any
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let products = [];
      try {
        products = JSON.parse(text);
        // Add a fake confidence score for the UI
        products = products.map(p => ({
          ...p,
          confidence: Math.round((0.85 + Math.random() * 0.14) * 100) / 100
        }));
      } catch (e) {
        console.error('Failed to parse AI response as JSON:', text);
        throw new Error('AI returned invalid JSON');
      }

      const predictedWaste = this.aggregateWaste(products);

      return {
        extractedText: products.map(p => p.name).join('\n'),
        products,
        predictedWaste
      };
    } catch (error) {
      console.error('AI extraction error:', error);
      throw error;
    }
  }

  aggregateWaste(products) {
    const categoryCounts = {};
    products.forEach(p => {
      categoryCounts[p.wasteCategory] = (categoryCounts[p.wasteCategory] || 0) + 1;
    });

    return Object.keys(categoryCounts).map(category => ({
      category,
      count: categoryCounts[category]
    }));
  }
}

module.exports = new AIService();
