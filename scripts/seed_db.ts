import * as dotenv from 'dotenv';
dotenv.config({ path: ['.env.local', '.env'] });
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// We need the service role key to bypass row level security for seeding
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase Environment Variables!");
  console.log("Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedDatabase() {
  console.log("🚀 Starting Supabase Database Seeding...");

  const cardsPath = path.join(process.cwd(), 'data', 'cards_dump.json');
  const pricesPath = path.join(process.cwd(), 'data', 'prices_dump.json');

  if (!fs.existsSync(cardsPath)) {
    console.error("❌ No cards data found! Run the importer first.");
    return;
  }

  // 1. Insert Cards
  const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
  console.log(`> Found ${cards.length} cards to insert.`);

  // Supabase bulk insert
  const { error: cardsError } = await supabase
    .from('cards')
    .upsert(cards.map((c: any) => ({
      id: c.id,
      name: c.name,
      supertype: c.supertype,
      subtypes: c.subtypes || [],
      hp: c.hp,
      types: c.types || [],
      evolves_from: c.evolves_from,
      set_id: c.set_id,
      set_name: c.set_name,
      series: c.series,
      number: c.number,
      artist: c.artist,
      rarity: c.rarity,
      flavor_text: c.flavor_text,
      image_small: c.image_small,
      image_large: c.image_large,
      tcgplayer_url: c.tcgplayer_url,
      cardmarket_url: c.cardmarket_url
    })));

  if (cardsError) {
    console.error("❌ Error inserting cards:", cardsError);
  } else {
    console.log("✅ Cards inserted successfully!");
  }

  // 2. Insert Prices
  if (fs.existsSync(pricesPath)) {
    const pricesDump = JSON.parse(fs.readFileSync(pricesPath, 'utf-8'));
    console.log(`> Found ${pricesDump.length} price records to insert.`);

    // Flatten the prices object into individual rows for the hypertable
    const priceRows: any[] = [];
    
    for (const record of pricesDump) {
      for (const [grade, price] of Object.entries(record.prices)) {
        if (price) { // only insert if > 0
          priceRows.push({
            card_id: record.card_id,
            grade: grade,
            source: 'pricecharting', // Our current mock agent
            price_eur: price,
            recorded_at: record.timestamp
          });
        }
      }
    }

    const { error: pricesError } = await supabase
      .from('card_prices')
      .upsert(priceRows);

    if (pricesError) {
      console.error("❌ Error inserting prices:", pricesError);
    } else {
      console.log(`✅ Inserted ${priceRows.length} individual price points successfully!`);
    }
  } else {
    console.log("ℹ️ No prices_dump.json found. Skipping prices.");
  }

  console.log("🎉 Seeding complete!");
}

seedDatabase();
