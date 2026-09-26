const { GoogleGenerativeAI } = require('@google/generative-ai');
const { matchProducts } = require('./productMatcher');
const { demoReceiptText, demoProducts, demoWasteSummary } = require('./demoData');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
require('dotenv').config();

class AIService {
  constructor() {
    this.demoMode = process.env.DEMO_MODE === 'true';
    if (!this.demoMode && process.env.AI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
    }
  }

  async extractAndAnalyze(imageBuffer, mimeType) {
    if (this.demoMode || !this.genAI) {
      return {
        extractedText: demoReceiptText,
        products: demoProducts,
        predictedWaste: demoWasteSummary
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `You are a receipt OCR assistant. Extract all product/item names from this receipt image. Return ONLY a JSON array of product name strings. Example: ["Milk 1L", "Bread", "Eggs"]\nDo not include prices, quantities, totals, tax, or store information. Just product names.`;

      const imageParts = [
        {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType
          }
        }
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown code blocks if any
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let productNames = [];
      try {
        productNames = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse AI response as JSON:', text);
        productNames = [text];
      }

      const products = await matchProducts(productNames);
      const predictedWaste = this.aggregateWaste(products);

      return {
        extractedText: productNames.join('\n'),
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
