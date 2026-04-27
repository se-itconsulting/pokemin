import fs from 'fs';

// To run this: npx tsx scripts/importer.ts

const API_URL = 'https://api.pokemontcg.io/v2/cards';
const API_KEY = process.env.POKEMONTCG_API_KEY || ''; // Optional but recommended

async function fetchCards(page = 1, pageSize = 250) {
  const url = `${API_URL}?page=${page}&pageSize=${pageSize}&q=supertype:Pokémon`;
  console.log(`Fetching ${url}...`);

  const headers: HeadersInit = {};
  if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Error fetching cards: ${res.statusText}`);
  }
  const data = await res.json();
  return data;
}

async function runImporter() {
  console.log('Starting PokemonTCG.io Initial Importer...');
  
  // Note: In a real scenario you would loop through all pages or specific sets
  // Here we fetch just the first page (250 cards) for demonstration
  try {
    const data = await fetchCards(1, 250);
    const cards = data.data;

    console.log(`Fetched ${cards.length} cards.`);
    
    // Transform data to fit our schema
    const mappedCards = cards.map((c: any) => ({
      id: c.id,
      name: c.name,
      supertype: c.supertype,
      subtypes: c.subtypes || [],
      hp: c.hp,
      types: c.types || [],
      evolves_from: c.evolvesFrom,
      set_id: c.set.id,
      set_name: c.set.name,
      series: c.set.series,
      number: c.number,
      artist: c.artist,
      rarity: c.rarity,
      flavor_text: c.flavorText,
      image_small: c.images.small,
      image_large: c.images.large,
      tcgplayer_url: c.tcgplayer?.url,
      cardmarket_url: c.cardmarket?.url
    }));

    // Example: Save to JSON file as a substitute for DB insert
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    fs.writeFileSync('data/cards_dump.json', JSON.stringify(mappedCards, null, 2));
    
    console.log('Saved dump to data/cards_dump.json. Ready to be imported via Supabase / Postgres client.');
    console.log(`Example SQL Insert:
      INSERT INTO cards (id, name, set_id, set_name, series)
      VALUES ('${mappedCards[0].id}', '${mappedCards[0].name.replace(/'/g, "''")}', '${mappedCards[0].set_id}', '${mappedCards[0].set_name.replace(/'/g, "''")}', '${mappedCards[0].series}')
      ON CONFLICT DO NOTHING;
    `);

  } catch (error) {
    console.error('Failed to import cards:', error);
  }
}

runImporter();
