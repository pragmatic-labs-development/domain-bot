/**
 * src/lib/tlds.js
 * TLD waves — ported from domain-bot.com
 */

// Wave 1 — fired immediately (~50 highest-value TLDs)
export const TLDS_W1 = [
  { ext: 'com' }, { ext: 'net' }, { ext: 'org' }, { ext: 'io' }, { ext: 'ai' },
  { ext: 'co' }, { ext: 'app' }, { ext: 'dev' }, { ext: 'xyz' }, { ext: 'tech' },
  { ext: 'shop' }, { ext: 'store' }, { ext: 'online' }, { ext: 'info' }, { ext: 'pro' },
  { ext: 'me' }, { ext: 'us' }, { ext: 'tv' }, { ext: 'live' }, { ext: 'cloud' },
  { ext: 'media' }, { ext: 'site' }, { ext: 'agency' }, { ext: 'studio' }, { ext: 'design' },
  { ext: 'digital' }, { ext: 'blog' }, { ext: 'one' }, { ext: 'link' }, { ext: 'world' },
  { ext: 'space' }, { ext: 'global' }, { ext: 'club' }, { ext: 'email' }, { ext: 'team' },
  { ext: 'social' }, { ext: 'plus' }, { ext: 'page' }, { ext: 'fun' }, { ext: 'lol' },
  { ext: 'vip' }, { ext: 'top' }, { ext: 'ltd' }, { ext: 'inc' }, { ext: 'biz' },
  { ext: 'today' }, { ext: 'art' }, { ext: 'guru' }, { ext: 'host' }, { ext: 'zone' },
]

// Wave 2 — fired after 400ms (~100 second-tier TLDs)
export const TLDS_W2 = [
  { ext: 'cc' }, { ext: 'gg' }, { ext: 'vc' }, { ext: 'fm' }, { ext: 'pm' },
  { ext: 'run' }, { ext: 'fit' }, { ext: 'bio' }, { ext: 'care' }, { ext: 'life' },
  { ext: 'love' }, { ext: 'cool' }, { ext: 'best' }, { ext: 'money' }, { ext: 'work' },
  { ext: 'works' }, { ext: 'build' }, { ext: 'tools' }, { ext: 'network' }, { ext: 'systems' },
  { ext: 'services' }, { ext: 'solutions' }, { ext: 'software' }, { ext: 'codes' }, { ext: 'consulting' },
  { ext: 'marketing' }, { ext: 'business' }, { ext: 'company' }, { ext: 'group' }, { ext: 'ventures' },
  { ext: 'capital' }, { ext: 'fund' }, { ext: 'finance' }, { ext: 'cash' }, { ext: 'tax' },
  { ext: 'legal' }, { ext: 'law' }, { ext: 'health' }, { ext: 'clinic' }, { ext: 'dental' },
  { ext: 'yoga' }, { ext: 'diet' }, { ext: 'food' }, { ext: 'cafe' }, { ext: 'beer' },
  { ext: 'wine' }, { ext: 'pizza' }, { ext: 'recipes' }, { ext: 'restaurant' }, { ext: 'bar' },
  { ext: 'pub' }, { ext: 'kitchen' }, { ext: 'fashion' }, { ext: 'style' }, { ext: 'clothing' },
  { ext: 'shoes' }, { ext: 'jewelry' }, { ext: 'gifts' }, { ext: 'pet' }, { ext: 'dog' },
  { ext: 'cat' }, { ext: 'garden' }, { ext: 'home' }, { ext: 'house' }, { ext: 'repair' },
  { ext: 'cleaning' }, { ext: 'mobi' }, { ext: 'mobile' }, { ext: 'games' }, { ext: 'game' },
  { ext: 'esports' }, { ext: 'bet' }, { ext: 'casino' }, { ext: 'poker' }, { ext: 'photos' },
  { ext: 'photo' }, { ext: 'video' }, { ext: 'film' }, { ext: 'movie' }, { ext: 'music' },
  { ext: 'band' }, { ext: 'events' }, { ext: 'tickets' }, { ext: 'party' }, { ext: 'wedding' },
  { ext: 'tours' }, { ext: 'travel' }, { ext: 'flights' }, { ext: 'taxi' }, { ext: 'car' },
  { ext: 'cars' }, { ext: 'auto' }, { ext: 'education' }, { ext: 'school' }, { ext: 'academy' },
  { ext: 'training' }, { ext: 'coach' }, { ext: 'community' }, { ext: 'news' }, { ext: 'press' },
  { ext: 'report' }, { ext: 'chat' }, { ext: 'coupons' },
]

// Wave 3 — load on demand (~100 long-tail TLDs)
export const TLDS_W3 = [
  { ext: 'photography' }, { ext: 'gallery' }, { ext: 'graphics' }, { ext: 'ink' },
  { ext: 'accountant' }, { ext: 'accountants' }, { ext: 'associates' }, { ext: 'contractors' },
  { ext: 'engineer' }, { ext: 'engineering' }, { ext: 'management' }, { ext: 'enterprises' },
  { ext: 'international' }, { ext: 'holdings' }, { ext: 'industries' }, { ext: 'partners' },
  { ext: 'productions' }, { ext: 'properties' }, { ext: 'realty' }, { ext: 'rentals' },
  { ext: 'estate' }, { ext: 'mortgage' }, { ext: 'loans' }, { ext: 'credit' }, { ext: 'insure' },
  { ext: 'investments' }, { ext: 'trading' }, { ext: 'exchange' }, { ext: 'market' }, { ext: 'markets' },
  { ext: 'auction' }, { ext: 'deals' }, { ext: 'discount' }, { ext: 'promo' }, { ext: 'sale' },
  { ext: 'black' }, { ext: 'blue' }, { ext: 'green' }, { ext: 'red' }, { ext: 'pink' },
  { ext: 'gold' }, { ext: 'silver' }, { ext: 'diamond' }, { ext: 'luxury' }, { ext: 'expert' },
  { ext: 'institute' }, { ext: 'university' }, { ext: 'college' }, { ext: 'foundation' }, { ext: 'charity' },
  { ext: 'ngo' }, { ext: 'gives' }, { ext: 'church' }, { ext: 'bible' }, { ext: 'faith' },
  { ext: 'spa' }, { ext: 'salon' }, { ext: 'tattoo' }, { ext: 'surgery' }, { ext: 'doctor' },
  { ext: 'hospital' }, { ext: 'pharmacy' }, { ext: 'vet' }, { ext: 'fishing' }, { ext: 'golf' },
  { ext: 'ski' }, { ext: 'hockey' }, { ext: 'basketball' }, { ext: 'football' }, { ext: 'soccer' },
  { ext: 'tennis' }, { ext: 'bike' }, { ext: 'surf' }, { ext: 'boats' }, { ext: 'horse' },
  { ext: 'farm' }, { ext: 'organic' }, { ext: 'flowers' }, { ext: 'florist' }, { ext: 'baby' },
  { ext: 'kids' }, { ext: 'toys' }, { ext: 'computer' }, { ext: 'technology' }, { ext: 'hosting' },
  { ext: 'domains' }, { ext: 'security' }, { ext: 'protection' }, { ext: 'safe' }, { ext: 'secure' },
  { ext: 'ninja' }, { ext: 'rocks' }, { ext: 'buzz' }, { ext: 'wtf' },
]

export const AFTERMARKET_WORDS = ['hub', 'labs', 'studio', 'hq', 'spot', 'base', 'works', 'nest', 'link', 'flow']
