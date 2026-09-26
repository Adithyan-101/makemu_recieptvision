export const WASTE_SEARCH_TYPES = {
  'Plastic': { types: ['recycling_center'], textQuery: 'recycling center' },
  'Paper/Cardboard': { types: ['recycling_center'], textQuery: 'recycling center' },
  'Glass': { types: ['recycling_center'], textQuery: 'glass recycling' },
  'Metal': { types: ['recycling_center'], textQuery: 'scrap metal recycling' },
  'Organic': { types: ['recycling_center'], textQuery: 'composting facility' },
  'Battery/Special Waste': { types: [], textQuery: 'battery recycling center' },
  'E-waste': { types: [], textQuery: 'e-waste recycling center' },
  'Other': { types: ['recycling_center'], textQuery: 'waste collection center' }
};

export const DEMO_FACILITIES = [
  {
    name: 'Green Earth Recycling Centre',
    address: '123 Eco Street, Green District',
    distance: '1.8 km',
    isOpen: true,
    rating: 4.2,
    lat: 0,
    lng: 0,
    types: ['recycling_center'],
    note: 'Demo facility — shown when Google Maps is unavailable'
  },
  {
    name: 'City Waste Management Hub',
    address: '456 Clean Avenue, Central Area',
    distance: '3.2 km',
    isOpen: false,
    rating: 3.8,
    lat: 0,
    lng: 0,
    types: ['waste_management'],
    note: 'Demo facility — shown when Google Maps is unavailable'
  },
  {
    name: 'E-Cycle Solutions',
    address: '789 Tech Road, Innovation Park',
    distance: '5.1 km',
    isOpen: true,
    rating: 4.5,
    lat: 0,
    lng: 0,
    types: ['e-waste'],
    note: 'Demo facility — shown when Google Maps is unavailable'
  }
];
