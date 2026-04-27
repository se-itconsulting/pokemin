import fs from 'fs';
import path from 'path';

// Load from environment or `.env` file in production
const PRICECHARTING_API_KEY = process.env.PRICECHARTING_API_KEY || '';

async function fetchPrice(cardName: string, setName: string): Promise<any> {
  // If no API key is provided, we simulate the PriceCharting response 
  // so the agent workflow can be tested immediately.
  if (!PRICECHARTING_API_KEY) {
    console.warn(`  [WARN] No API key. Simulating PriceCharting response for ${cardName}...`);
    return {
      "ungraded": parseFloat((Math.random() * 50).toFixed(2)),
      "psa-7": parseFloat((Math.random() * 70 + 50).toFixed(2)),
      "psa-8": parseFloat((Math.random() * 100 + 100).toFixed(2)),
      "psa-9": parseFloat((Math.random() * 200 + 200).toFixed(2)),
      "psa-10": parseFloat((Math.random() * 500 + 500).toFixed(2)),
    };
  }

  // Real API Fetch according to PriceCharting Docs
  // The query needs to combine card name and set for best results
  const q = encodeURIComponent(`${cardName} ${setName}`);
  const url = `https://www.pricecharting.com/api/product?t=${PRICECHARTING_API_KEY}&q=${q}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`);
  }
  return await res.json();
}

async function runAgent() {
  console.log("🤖 [AI Agent] PriceCharting Sync initialized...");
  console.log("==================================================");
  
  if (!PRICECHARTING_API_KEY) {
    console.log("⚠️  INFO: Running in MOCK mode. Add PRICECHARTING_API_KEY to fetch real data.");
  } else {
    console.log("✅ API Key detected. Running in LIVE mode.");
  }

  const dataPath = path.join(process.cwd(), 'data', 'cards_dump.json');
  if (!fs.existsSync(dataPath)) {
    console.error("❌ No cards data found! Run the importer first.");
    return;
  }

  const cards = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  // For demonstration, we only sync the first 5 cards to avoid rate limits
  const targetCards = cards.slice(0, 5); 

  console.log(`> Found ${cards.length} cards in DB. Queueing top ${targetCards.length} for price sync...`);

  const updatedPrices = [];

  for (const card of targetCards) {
    console.log(`> Fetching market data for: [${card.id}] ${card.name} (${card.set_name})`);
    try {
      const prices = await fetchPrice(card.name, card.set_name);
      
      const priceRecord = {
        card_id: card.id,
        prices: {
          "Raw": prices.ungraded || prices['loose-price'] || 0,
          "PSA 7": prices["psa-7"] || 0,
          "PSA 8": prices["psa-8"] || 0,
          "PSA 9": prices["psa-9"] || 0,
          "PSA 10": prices["psa-10"] || prices['graded-price'] || 0,
        },
        timestamp: new Date().toISOString()
      };
      
      updatedPrices.push(priceRecord);

      // Simulate processing time / rate limiting
      await new Promise(r => setTimeout(r, 800));
    } catch (err) {
      console.error(`❌ Error fetching ${card.name}:`, err);
    }
  }

  // Save the result to a dump file
  const outputPath = path.join(process.cwd(), 'data', 'prices_dump.json');
  fs.writeFileSync(outputPath, JSON.stringify(updatedPrices, null, 2));

  console.log("==================================================");
  console.log(`✅ Sync complete. Successfully fetched ${updatedPrices.length} multi-tier price records.`);
  console.log(`💾 Saved to data/prices_dump.json.`);
  console.log(`🚀 Ready to be ingested into TimescaleDB 'card_prices' hypertable!`);
}

runAgent();
