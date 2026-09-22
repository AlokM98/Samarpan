export type Product = { name: string; price: number; mark: string; description: string };

export const products: Product[] = [
  { name: "Gulab Chandni Thali", price: 1899, mark: "Gulab", description: "A blush-pink thali dressed with hand-painted florals and a moonlit sheen." },
  { name: "Sona Sitara Sieve", price: 1299, mark: "Sitara", description: "A gold-finished chalni with delicate star details for the first glimpse of the moon." },
  { name: "Mehfil Celebration Set", price: 2499, mark: "Mehfil", description: "A considered pairing of thali, sieve and diya for a beautifully complete ritual." },
  { name: "Noor Diya Pair", price: 699, mark: "Noor", description: "Two warm brass-finish diyas to add a soft glow to your evening table." },
  { name: "Chaand Baali Favour", price: 449, mark: "Baali", description: "A tiny keepsake favour inspired by moonlight, wrapped ready for gifting." },
  { name: "Suhagan Gift Hamper", price: 3199, mark: "Suhagan", description: "A festive curation of little luxuries, made for someone very loved." },
  { name: "Aastha Pooja Thali", price: 1599, mark: "Aastha", description: "A serene ivory-and-gold thali with room for the rituals that matter." },
  { name: "Raat Rani Tealight Trio", price: 899, mark: "Raat Rani", description: "Three floral tealight holders that turn a simple corner into a celebration." },
  { name: "Mogra Gajra Box", price: 549, mark: "Mogra", description: "A keepsake box for a small floral gesture, finished with a satin ribbon." },
  { name: "Chaandni Couple Hamper", price: 2899, mark: "Chaandni", description: "A thoughtful pair of keepsakes for the couple at the heart of the evening." },
  { name: "Laal Dhaaga Potli", price: 399, mark: "Dhaaga", description: "A rich red potli for gifting sweets, blessings and a little good fortune." },
  { name: "Riwaaz Memory Box", price: 2199, mark: "Riwaaz", description: "A keepsake box made to hold photographs, notes and the stories of your rituals." },
];

export const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;
