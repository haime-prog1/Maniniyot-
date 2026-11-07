import type { Destination } from '../types';

export const DESTINATIONS: Destination[] = [
  {
    id: 'boracay',
    name: 'Boracay',
    country: 'Philippines',
    tagline: 'White Beach & paraw sunsets',
    airportName: 'Godofredo P. Ramos Airport – Caticlan',
    portName: 'Caticlan Jetty Port',
    landmarks: ['White Beach', "Willy's Rock", 'Puka Shell Beach', 'Mt. Luho', 'Station 1', "D'Mall"],
    gradient: ['#ffb36b', '#ff6a88', '#38c6d9'],
  },
  {
    id: 'siargao',
    name: 'Siargao',
    country: 'Philippines',
    tagline: 'Surf, palms & island roads',
    airportName: 'Sayak Airport – Siargao',
    portName: 'Dapa Port',
    landmarks: ['Cloud 9 Boardwalk', 'Magpupungko Rock Pools', 'Sugba Lagoon', 'the Coconut Palm Road'],
    gradient: ['#22c1c3', '#1f8a70', '#fdbb2d'],
  },
  {
    id: 'elnido',
    name: 'El Nido',
    country: 'Philippines',
    tagline: 'Lagoons & limestone cliffs',
    airportName: 'Lio Airport – El Nido',
    portName: 'El Nido Port',
    landmarks: ['Big Lagoon', 'Nacpan Beach', 'Las Cabanas Beach', 'Taraw Cliff'],
    gradient: ['#0f9b8e', '#2d6cdf', '#a1ffce'],
  },
  {
    id: 'baguio',
    name: 'Baguio',
    country: 'Philippines',
    tagline: 'Pine trees & cold mornings',
    landmarks: ['Burnham Park', 'Mines View Park', 'Session Road', 'the Strawberry Farm'],
    gradient: ['#3a7d44', '#9dc08b', '#f6d6ad'],
  },
  {
    id: 'bohol',
    name: 'Bohol',
    country: 'Philippines',
    tagline: 'Chocolate Hills & river cruises',
    airportName: 'Bohol–Panglao International Airport',
    portName: 'Tagbilaran City Port',
    landmarks: ['the Chocolate Hills', 'Loboc River', 'the Tarsier Sanctuary', 'Alona Beach'],
    gradient: ['#8e5a3c', '#e0a96d', '#4fb0a5'],
  },
  {
    id: 'coron',
    name: 'Coron',
    country: 'Philippines',
    tagline: 'Crystal lakes & wrecks',
    airportName: 'Francisco B. Reyes Airport – Busuanga',
    portName: 'Coron Town Port',
    landmarks: ['Kayangan Lake', 'Twin Lagoon', 'Mt. Tapyas', 'Barracuda Lake'],
    gradient: ['#1a2a6c', '#11998e', '#38ef7d'],
  },
  {
    id: 'japan',
    name: 'Japan (Tokyo)',
    country: 'Japan',
    tagline: 'Neon nights & temples',
    airportName: 'Narita International Airport',
    landmarks: ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Tower', 'Shinjuku'],
    gradient: ['#ff4e8a', '#7b2ff7', '#1c1c3c'],
  },
];

export const getDestination = (id: string) => DESTINATIONS.find((d) => d.id === id);

export function customDestination(name: string): Destination {
  const clean = name.trim();
  return {
    id: `custom:${clean.toLowerCase().replace(/\s+/g, '-')}`,
    name: clean,
    country: '',
    landmarks: [`the most famous spot in ${clean}`, `a hidden corner of ${clean}`],
    gradient: ['#fa7e1e', '#d62976', '#962fbf'],
  };
}

export const gradientCss = (g: string[]) => `linear-gradient(135deg, ${g.join(', ')})`;
