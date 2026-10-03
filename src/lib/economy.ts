/** Gem costs and rewards. Tune here; every screen reads from this file. */
export const GEMS = {
  starting: 250,
  perReply: 10,
  checkIn: 25,
  checkInDay7: 100,
  adReward: 125,
  adsPerDay: 3,
} as const;

export const GEM_PACKS = [
  { id: 'gems_6300', gems: 6300, price: '$4.99' },
  { id: 'gems_13200', gems: 13200, price: '$9.99', tag: 'Most popular' },
  { id: 'gems_20160', gems: 20160, price: '$14.99' },
  { id: 'gems_27600', gems: 27600, price: '$19.99', tag: 'Best value' },
] as const;

export const PLANS = [
  { id: 'lite_monthly', name: 'Kinship Lite', price: '$3.99 / mo', perks: ['Monthly gem allowance', 'No ads'] },
  { id: 'pro_monthly', name: 'Kinship Pro', price: '$12.49 / mo', perks: ['Largest monthly gem allowance', 'Longer character memory', 'No ads, priority replies'] },
] as const;
