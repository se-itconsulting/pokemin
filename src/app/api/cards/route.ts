import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const cardsPath = path.join(process.cwd(), 'data', 'cards_dump.json');
    const pricesPath = path.join(process.cwd(), 'data', 'prices_dump.json');

    if (!fs.existsSync(cardsPath)) {
      return NextResponse.json({ error: 'Cards data not found' }, { status: 404 });
    }

    const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
    let prices = [];
    if (fs.existsSync(pricesPath)) {
      prices = JSON.parse(fs.readFileSync(pricesPath, 'utf-8'));
    }

    // Merge prices into cards
    const enrichedCards = cards.slice(0, 50).map((card: any) => {
      const cardPrices = prices.find((p: any) => p.card_id === card.id);
      
      // Determine trend based on price existence (dummy trend logic for demo)
      const trend = cardPrices ? (Math.random() > 0.5 ? 'up' : 'down') : 'neutral';
      
      return {
        id: card.id,
        name: card.name,
        set: card.set_name,
        grade: cardPrices ? 'PSA 10' : 'Raw', 
        price: cardPrices ? cardPrices.prices['PSA 10'] : 0,
        trend: trend,
        image: card.image_small,
        types: card.types,
        allPrices: cardPrices ? cardPrices.prices : null
      };
    });

    // Filter to only show cards that have prices first
    const sortedCards = enrichedCards.sort((a: any, b: any) => b.price - a.price);

    return NextResponse.json(sortedCards);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
