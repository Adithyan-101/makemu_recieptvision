const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
try {
  const { setGlobalDispatcher, Agent } = require('undici');
  setGlobalDispatcher(new Agent({ connect: { lookup: dns.lookup } }));
} catch (e) {}
const aiService = require('./services/aiService');

async function run() {
  try {
    // 1x1 PNG image - just to test if the API accepts the request and key is valid
    const dummyImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    console.log("Testing Gemini API key...");
    
    // We expect this to either return empty products or a specific Gemini error if the image is too small, 
    // but if the key is invalid, it will throw a 400/403 Authentication error.
    const result = await aiService.extractAndAnalyze(dummyImage, 'image/png');
    
    console.log("✅ Gemini API Key is WORKING! Connection successful.");
  } catch (e) {
    console.error("❌ API Key test failed:", e.message);
  }
}

run();
