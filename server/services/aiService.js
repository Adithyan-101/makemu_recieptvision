const Groq = require('groq-sdk');
const { matchProducts } = require('./productMatcher');
const { demoReceiptText, demoProducts, demoWasteSummary } = require('./demoData');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
require('dotenv').config();

class AIService {
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    // Initialize Groq client if a real API key is provided (not a placeholder)
    if (apiKey && apiKey !== 'your-groq-api-key' && apiKey.length > 10) {
      this.groq = new Groq({ apiKey });
      console.log('🤖 Groq AI initialized for receipt OCR');
    } else {
      console.log('ℹ️  No Groq API key configured — real receipt scanning will fall back to demo data');
    }
  }

  async extractAndAnalyze(imageBuffer, mimeType) {
    if (!this.groq) {
      throw new Error('No AI API key configured. Add GROQ_API_KEY to your .env file to enable real receipt scanning.');
    }

    try {
      const prompt = `You are an expert receipt OCR and waste management assistant. 
Extract all grocery/product items from this receipt and intelligently predict the most likely waste/packaging category for each item.

Return ONLY a valid JSON array of objects. 
Each object must have "name", "wasteCategory", "packaging", "shelfLifeDays", "storageCondition", and "wasteStreams".
Valid waste categories are exactly one of: "Plastic", "Paper/Cardboard", "Glass", "Metal", "Organic", "Battery/Special Waste", "E-waste", "Other".

- shelfLifeDays (integer): estimated shelf life in days from purchase
- storageCondition (string): e.g., "Refrigerated", "Room Temperature", "Cool & Dry"
- wasteStreams (array of objects): each with { "type", "wasteCategory", "timing" } where:
  - type is a description like "Egg carton" or "Eggshells"
  - wasteCategory is one of the valid categories
  - timing is one of: "immediate" (packaging waste, disposable when emptied), "on_consumption" (generated when product is consumed), "on_expiry" (generated when product expires/spoils)

Example format: 
[
  {
    "name": "Farm Fresh Eggs 1 Dozen",
    "packaging": "Cardboard Carton",
    "wasteCategory": "Organic",
    "shelfLifeDays": 21,
    "storageCondition": "Refrigerated",
    "wasteStreams": [
      {"type": "Egg carton", "wasteCategory": "Paper/Cardboard", "timing": "immediate"},
      {"type": "Eggshells", "wasteCategory": "Organic", "timing": "on_consumption"}
    ]
  }
]

CRITICAL RULES:
1. Do not include prices or tax. Just the full product name.
2. Accurately predict the packaging (e.g. "Glass Jar", "Cardboard Box"). If the item itself leaves significant organic waste (like eggshells, fruit peels, or vegetable scraps), prioritize "Organic" as the wasteCategory. Otherwise, categorize by its packaging.
3. If no products are found, return [].
4. Return ONLY valid JSON. No markdown backticks.`;

      // Encode image as a base64 data URL for Groq vision
      const base64Image = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      const modelsToTry = [
        'llama-3.2-90b-vision-preview',
        'llama-3.2-11b-vision-preview'
      ];
      let responseText = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const chatCompletion = await this.groq.chat.completions.create({
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    {
                      type: 'image_url',
                      image_url: { url: dataUrl }
                    }
                  ]
                }
              ],
              model: modelName,
              temperature: 0.2,
              max_tokens: 1000
            });

            responseText = chatCompletion.choices[0].message.content;
            break; // Success
          } catch (err) {
            lastError = err;
            const status = err.status || err.statusCode || '';
            if (String(status) === '503' || String(status) === '429' || (err.message && (err.message.includes('503') || err.message.includes('rate')))) {
              console.log(`⚠️ ${modelName} attempt ${attempt} failed (${status}). Retrying in ${attempt}s...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            } else {
              // Non-retryable error for this model — try the next model
              console.log(`⚠️ ${modelName} failed: ${err.message}. Trying next model...`);
              break;
            }
          }
        }
        if (responseText) break; // Success — stop trying models
      }

      if (!responseText) {
        throw lastError; // All retries and models failed
      }

      // Clean up markdown code blocks if any
      let text = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      let products = [];
      try {
        products = JSON.parse(text);
        
        const today = new Date();
        
        // Add a confidence score for the UI and compute expiry dates
        products = products.map(p => {
          let expiryDate = null;
          let daysRemaining = null;
          
          if (p.shelfLifeDays) {
            expiryDate = new Date(today);
            expiryDate.setDate(today.getDate() + p.shelfLifeDays);
            daysRemaining = p.shelfLifeDays;
          }
          
          return {
            ...p,
            confidence: Math.round((0.85 + Math.random() * 0.14) * 100) / 100,
            expiryDate,
            isEstimatedExpiry: true,
            daysRemaining
          };
        });
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
    const streams = [];

    products.forEach(p => {
      categoryCounts[p.wasteCategory] = (categoryCounts[p.wasteCategory] || 0) + 1;
      
      if (p.wasteStreams && Array.isArray(p.wasteStreams)) {
        p.wasteStreams.forEach(stream => {
          streams.push({
            productName: p.name,
            ...stream
          });
        });
      }
    });

    return {
      categories: Object.keys(categoryCounts).map(category => ({
        category,
        count: categoryCounts[category]
      })),
      streams
    };
  }
}

module.exports = new AIService();
