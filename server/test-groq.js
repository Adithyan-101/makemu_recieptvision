const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: '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' });
async function getModels() {
  const models = await groq.models.list();
  console.log(models.data.map(m => m.id).join(', '));
}
getModels().catch(console.error);
