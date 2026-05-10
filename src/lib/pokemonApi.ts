export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  rarity?: string;
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: {
      normal?: { market: number };
      holofoil?: { market: number };
      reverseHolofoil?: { market: number };
      '1stEditionHolofoil'?: { market: number };
      '1stEditionNormal'?: { market: number };
    };
  };
}

const API_BASE_URL = 'https://api.pokemontcg.io/v2';

export async function fetchSets(): Promise<PokemonSet[]> {
  const response = await fetch(`${API_BASE_URL}/sets?orderBy=-releaseDate`);
  if (!response.ok) {
    throw new Error('Failed to fetch sets');
  }
  const data = await response.json();
  return data.data;
}

export async function fetchCardsBySet(setId: string): Promise<PokemonCard[]> {
  const response = await fetch(`${API_BASE_URL}/cards?q=set.id:${setId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch cards');
  }
  const data = await response.json();
  return data.data;
}

export async function searchCards(query: string): Promise<PokemonCard[]> {
  // Use wildcard search on the name field
  const response = await fetch(`${API_BASE_URL}/cards?q=name:"*${query}*"&orderBy=-set.releaseDate`);
  if (!response.ok) {
    throw new Error('Failed to search cards');
  }
  const data = await response.json();
  return data.data;
}
