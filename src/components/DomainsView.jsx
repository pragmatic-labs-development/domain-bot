/**
 * src/components/DomainsView.jsx
 * TLD availability grid organized by category.
 * Hover tooltip shows domain info, status, price and action.
 */

import { useState, useCallback, useRef } from 'react'

const TLD_CATEGORIES = [
  {
    label: 'Popular',
    tlds: ['com','net','org','ai','io','xyz','app','shop','info','co','store','site','online','dev','tech','pro','live','lol','club','vip','link','top','me','tv','blog','cloud','design','studio','art','fun','one','world','digital','global','space','plus','media','email','host','page','ltd','biz','agency','social','stream','zone','team','work','life','love','best','cool','today','guru','care','fit','marketing','luxury','solutions'],
  },
  {
    label: 'Technology',
    tlds: ['tech','software','codes','systems','network','tools','build','run','digital','cloud','host','computer','technology','hosting','domains','security','protection','safe','secure','mobile','engineering','engineer'],
  },
  {
    label: 'Business',
    tlds: ['business','company','group','ltd','inc','services','solutions','consulting','marketing','ventures','capital','fund','management','enterprises','international','holdings','industries','partners','works','guru','expert','associates','contractors'],
  },
  {
    label: 'Commerce & Shopping',
    tlds: ['shop','store','online','market','markets','deals','discount','promo','sale','coupons','auction','exchange','trading','gifts','jewelry','shoes','clothing','fashion','style'],
  },
  {
    label: 'Creative & Media',
    tlds: ['design','studio','art','media','agency','blog','social','page','link','site','space','world','global','zone','email','ink','graphics','gallery','photography','photos','photo','video','film','movie','music','band','press','news','report','chat','productions'],
  },
  {
    label: 'Professional Services',
    tlds: ['legal','law','finance','tax','accountant','accountants','coach','training','institute','academy','school','education','university','college','foundation'],
  },
  {
    label: 'Health & Wellness',
    tlds: ['health','care','life','clinic','dental','yoga','diet','bio','fit','doctor','hospital','pharmacy','surgery','vet','spa','salon','tattoo'],
  },
  {
    label: 'Food & Beverage',
    tlds: ['food','cafe','beer','wine','pizza','recipes','restaurant','bar','pub','kitchen'],
  },
  {
    label: 'Finance',
    tlds: ['money','cash','credit','loans','investments','insure','fund','capital','finance','tax'],
  },
  {
    label: 'Real Estate & Home',
    tlds: ['home','house','repair','cleaning','garden','realty','rentals','estate','mortgage','properties'],
  },
  {
    label: 'Travel & Transport',
    tlds: ['tours','travel','flights','taxi','car','cars','auto'],
  },
  {
    label: 'Sports & Fitness',
    tlds: ['fit','golf','ski','hockey','basketball','football','soccer','tennis','bike','surf','boats','horse','fishing'],
  },
  {
    label: 'Events & Entertainment',
    tlds: ['events','tickets','party','wedding','games','game','esports','bet','casino','poker'],
  },
  {
    label: 'Lifestyle',
    tlds: ['love','pet','dog','cat','baby','kids','toys','flowers','florist','organic','farm'],
  },
  {
    label: 'Community & Non-Profit',
    tlds: ['community','charity','ngo','gives','church','bible','faith'],
  },
  {
    label: 'Fun & Misc',
    tlds: ['ninja','rocks','buzz','wtf','lol','fun','cool','zone','guru','black','blue','green','red','pink','gold','silver','diamond','luxury','vc','fm','pm','cc','gg'],
  },
]

const TLD_DESC = {
  com: 'The gold standard. Most trusted and recognized domain worldwide.',
  net: 'Originally for networks. A solid .com alternative.',
  org: 'Best for nonprofits, communities, and open-source projects.',
  ai: 'The go-to for AI startups and machine learning companies.',
  io: 'Hugely popular in tech and SaaS. Stands for "input/output".',
  xyz: 'A fresh, modern alternative with no category restrictions.',
  app: 'Purpose-built for web and mobile applications.',
  shop: 'Signals e-commerce instantly. Great for online stores.',
  info: 'Informational sites, directories, and knowledge bases.',
  co: 'Short, clean, and global. A premium .com alternative.',
  store: 'Perfect for retail and e-commerce businesses.',
  site: 'A versatile, affordable option for any website.',
  online: 'Great for businesses with a digital-first presence.',
  dev: 'Loved by developers and engineering teams.',
  tech: 'Signals technology, innovation, and digital products.',
  pro: 'Conveys expertise and professionalism.',
  live: 'Ideal for streaming, events, and real-time content.',
  lol: 'Fun and playful — great for entertainment and humor.',
  club: 'For membership communities, groups, and fan clubs.',
  vip: 'Premium, exclusive, high-end brand positioning.',
  link: 'Great for short URLs, referral links, and aggregators.',
  top: 'Positions your brand as a leader in its space.',
  me: 'Personal sites, portfolios, and individual brands.',
  tv: 'Perfect for video, streaming, and broadcast content.',
  blog: 'Signals content publishing and thought leadership.',
  cloud: 'Ideal for SaaS, infrastructure, and cloud services.',
  design: 'Perfect for designers, agencies, and creative studios.',
  studio: 'For creative studios, production houses, and makers.',
  art: 'Great for artists, galleries, and creative work.',
  fun: 'Lighthearted, casual — perfect for games and entertainment.',
  one: 'Clean and minimal. Suggests a single, focused product.',
  world: 'Global positioning for international brands.',
  digital: 'Signals a modern, digital-native brand.',
  global: 'For brands with international presence or ambitions.',
  space: 'Creative and open-ended. Works across many industries.',
  plus: 'Suggests a premium tier or added value.',
  media: 'Ideal for publishers, agencies, and content brands.',
  email: 'Unique for email services and communication tools.',
  host: 'Great for hosting providers and infrastructure companies.',
  page: 'Perfect for landing pages and single-purpose sites.',
  ltd: 'Professional suffix for limited companies.',
  biz: 'Straightforward signal for commercial businesses.',
  agency: 'Clear and direct — ideal for agencies of all kinds.',
  social: 'For social networks, communities, and platforms.',
  zone: 'Versatile and energetic — great for niche communities.',
  team: 'Signals collaboration, crew, and group identity.',
  work: 'For productivity tools, remote work, and job platforms.',
  life: 'Lifestyle brands, wellness, and personal development.',
  love: 'Emotional, personal — works for gifting, dating, and more.',
  best: 'Positions your brand as the top choice.',
  cool: 'Casual and trendy. For brands that want to feel current.',
  today: 'Signals urgency, news, and current events.',
  guru: 'Positions you as an expert or go-to authority.',
  care: 'Health, wellness, and supportive services.',
  fit: 'Fitness, health, and active lifestyle brands.',
  marketing: 'Direct and descriptive for marketing agencies.',
  luxury: 'Premium, high-end brand positioning.',
  solutions: 'Signals problem-solving for B2B companies.',
  software: 'Clear and direct for software products and tools.',
  codes: 'Developer-friendly, great for code tools and APIs.',
  systems: 'For infrastructure, IT, and enterprise software.',
  network: 'Signals connectivity and community.',
  tools: 'Ideal for SaaS tools, utilities, and developer products.',
  build: 'Great for construction, dev tools, and maker brands.',
  run: 'Minimal and action-oriented — perfect for apps and services.',
  computer: 'Direct and classic for tech hardware or software.',
  technology: 'Descriptive and trustworthy for tech companies.',
  hosting: 'Crystal clear for hosting and infrastructure brands.',
  domains: 'Meta — for domain registrars and DNS services.',
  security: 'Signals safety, protection, and cybersecurity.',
  mobile: 'Perfect for mobile apps and smartphone-first products.',
  engineering: 'Credible, technical — for engineering teams and firms.',
  food: 'Perfect for restaurants, delivery, and food brands.',
  cafe: 'Warm and inviting for coffee shops and eateries.',
  beer: 'Niche and memorable for craft breweries and bars.',
  wine: 'Elegant — for wineries, retailers, and enthusiasts.',
  pizza: 'Fun and specific for pizzerias and food delivery.',
  recipes: 'Great for food bloggers and cooking content.',
  restaurant: 'Direct and clear for dining establishments.',
  bar: 'For bars, nightlife, and beverage brands.',
  pub: 'Classic British feel for pubs and casual dining.',
  kitchen: 'Warm and domestic for cooking and food brands.',
  health: 'Clear signal for healthcare and wellness products.',
  clinic: 'Professional for medical clinics and practices.',
  dental: 'Specific and trustworthy for dental practices.',
  yoga: 'Niche and calm for yoga studios and instructors.',
  diet: 'Specific for nutrition, weight loss, and diet plans.',
  bio: 'Clean and scientific for biotech and life sciences.',
  doctor: 'Direct and trusted for medical professionals.',
  hospital: 'Authoritative for healthcare institutions.',
  pharmacy: 'Clear for drugstores and pharmaceutical brands.',
  spa: 'Relaxing and premium for spas and wellness centers.',
  salon: 'Direct for hair salons and beauty services.',
  legal: 'Authoritative for law firms and legal services.',
  law: 'Clean and direct for attorneys and legal brands.',
  finance: 'Trustworthy for financial services and fintech.',
  tax: 'Direct for tax services and accounting firms.',
  accountant: 'Highly specific for accounting professionals.',
  coach: 'Great for life coaches, sports coaches, and trainers.',
  training: 'Clear for educational programs and courses.',
  institute: 'Prestigious for research and educational bodies.',
  academy: 'Great for online learning and training programs.',
  school: 'Clear and direct for educational institutions.',
  education: 'Broad and authoritative for ed-tech and schools.',
  university: 'Prestigious — reserved for universities.',
  college: 'For colleges and higher education brands.',
  foundation: 'Ideal for charitable foundations and nonprofits.',
  home: 'Warm and familiar for home services and real estate.',
  house: 'Specific for real estate, architecture, and home brands.',
  repair: 'Direct for repair services and maintenance companies.',
  cleaning: 'Clear for cleaning services and home care.',
  garden: 'For gardening, landscaping, and outdoor brands.',
  realty: 'Professional for real estate agencies and agents.',
  rentals: 'Clear for property rental and vacation rental brands.',
  estate: 'Elegant for real estate and luxury property.',
  mortgage: 'Direct for mortgage lenders and brokers.',
  money: 'Bold for fintech, budgeting, and financial tools.',
  cash: 'Energetic for payment, lending, and fintech brands.',
  credit: 'Trustworthy for credit services and lending.',
  loans: 'Direct for lending, mortgages, and financial products.',
  fund: 'For investment funds, startups, and fundraising.',
  capital: 'Prestigious for investment firms and financial brands.',
  tours: 'Clear for travel agencies and tour operators.',
  travel: 'Broad and aspirational for travel brands.',
  flights: 'Specific for flight booking and aviation brands.',
  taxi: 'Direct for ride-sharing and transportation services.',
  car: 'Clean for automotive, rentals, and ride-sharing.',
  auto: 'Great for automotive dealerships and services.',
  events: 'Perfect for event planners and ticketing platforms.',
  tickets: 'Direct for ticketing and event management.',
  party: 'Fun for event planning, entertainment, and nightlife.',
  wedding: 'Romantic and specific for wedding-related businesses.',
  games: 'Broad for gaming studios, apps, and platforms.',
  game: 'Singular and focused for individual game titles.',
  esports: 'Specific for competitive gaming and streaming.',
  bet: 'For sports betting and gambling platforms.',
  pet: 'Friendly for pet care, supplies, and veterinary services.',
  dog: 'Niche and lovable for dog-focused brands.',
  cat: 'Niche and cute for cat-focused brands and communities.',
  baby: 'Safe and nurturing for baby products and parenting.',
  kids: 'Friendly for children\'s products and education.',
  toys: 'Fun and clear for toy brands and gift shops.',
  flowers: 'Romantic for florists and floral delivery services.',
  florist: 'Direct for flower shops and arrangements.',
  organic: 'Clean and trustworthy for organic and natural brands.',
  farm: 'Authentic for farms, agriculture, and local food.',
  community: 'Signals belonging and connection.',
  charity: 'Clear for charitable organizations.',
  ngo: 'International signal for non-governmental organizations.',
  church: 'For religious institutions and faith communities.',
  ninja: 'Playful and memorable — great for standout brands.',
  rocks: 'Enthusiastic and fun — "YourBrand.rocks".',
  buzz: 'Energetic for media, PR, and trending content.',
  wtf: 'Bold and irreverent — only for the right brand.',
  vc: 'Signals venture capital and startup investment.',
  fm: 'Originally for Micronesia — popular for radio/podcasts.',
  cc: 'Versatile two-letter code. Works like a second .com.',
  gg: 'Gamer slang for "good game" — huge in gaming/esports.',
}

const STATUS_BG = {
  available:   '#0d8a57',
  premium:     '#8a6010',
  aftermarket: '#1d4db8',
  taken:       '#8f2830',
  checking:    '#1a1f1f',
  unknown:     '#1a1f1f',
}

const STATUS_LABEL = {
  available:   'Available',
  premium:     'Premium',
  aftermarket: 'Aftermarket',
  taken:       'Taken',
  checking:    'Checking…',
  unknown:     'Unknown',
}

const STATUS_COLOR = {
  available:   'var(--green)',
  premium:     'var(--yellow)',
  aftermarket: 'var(--blue)',
  taken:       'var(--red)',
  checking:    'var(--text-dim)',
  unknown:     'var(--text-dim)',
}

export function DomainsView({ keyword, results, onDetail }) {
  const [tooltip, setTooltip] = useState(null) // { tld, domain, status, price, x, y }
  const hideTimer = useRef(null)

  const handleMouseEnter = useCallback((e, tld, domain, status, price) => {
    clearTimeout(hideTimer.current)
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ tld, domain, status, price, rect })
  }, [])

  const handleMouseLeave = useCallback(() => {
    hideTimer.current = setTimeout(() => setTooltip(null), 250)
  }, [])

  if (!keyword) return null

  return (
    <div className="domains-view">
      {TLD_CATEGORIES.map(cat => {
        const tiles = cat.tlds
          .filter((tld, i, arr) => arr.indexOf(tld) === i)
          .map(tld => {
            const domain = `${keyword}.${tld}`
            const r = results[domain]
            const status = r?.status ?? null
            const price  = r?.price  ?? null
            return { tld, domain, status, price }
          })
          .filter(t => t.status !== null)

        if (tiles.length === 0) return null

        const available = tiles.filter(t => t.status === 'available').length
        const taken     = tiles.filter(t => t.status === 'taken').length
        const subtitle  = available > 0 ? `${available} available` : `${taken} taken`

        return (
          <div key={cat.label} className="dv-category">
            <div className="dv-cat-label-col">
              <span className="dv-cat-name">{cat.label}</span>
              <span className="dv-cat-sub">{subtitle}</span>
            </div>
            <div className="dv-tile-grid">
              {tiles.map(({ tld, domain, status, price }) => {
                const bg   = STATUS_BG[status] ?? STATUS_BG.unknown
                const href = status === 'taken'
                  ? `https://who.is/whois/${domain}`
                  : status === 'available' || status === 'premium'
                  ? `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${domain}`
                  : null
                return (
                  <a
                    key={tld}
                    className={`dv-tile status-${status}`}
                    style={{ background: bg }}
                    href={href ?? undefined}
                    target={href ? '_blank' : undefined}
                    rel="noreferrer"
                    onMouseEnter={e => handleMouseEnter(e, tld, domain, status, price)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <span className="dv-tile-dots">•••</span>
                    <span className="dv-tile-ext">.{tld}</span>
                    <span className="dv-tile-chevron">∨</span>
                  </a>
                )
              })}
            </div>
          </div>
        )
      })}

      {tooltip && (
        <DomainTooltip
          {...tooltip}
          keyword={keyword}
          onMouseEnter={() => clearTimeout(hideTimer.current)}
          onMouseLeave={handleMouseLeave}
          onDetail={onDetail}
        />
      )}
    </div>
  )
}

function DomainTooltip({ tld, domain, status, price, rect, keyword, onMouseEnter, onMouseLeave, onDetail }) {
  const desc   = TLD_DESC[tld] ?? `A domain extension for ${tld}-related content.`
  const label  = STATUS_LABEL[status] ?? 'Unknown'
  const color  = STATUS_COLOR[status] ?? 'var(--text-dim)'

  const isAvailable = status === 'available' || status === 'premium'
  const isTaken     = status === 'taken'
  const href = isAvailable
    ? `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${domain}`
    : isTaken
    ? `https://who.is/whois/${domain}`
    : null

  // Position below the tile, centered
  const tooltipWidth = 260
  const left = Math.max(8, Math.min(
    window.innerWidth - tooltipWidth - 8,
    rect.left + rect.width / 2 - tooltipWidth / 2
  ))
  const top = rect.bottom + 8

  return (
    <div
      className="dv-tooltip"
      style={{ left, top, width: tooltipWidth }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="dv-tt-domain">{domain}</div>

      <div className="dv-tt-status">
        <span className="dv-tt-dot" style={{ background: color }} />
        <span style={{ color }}>{label}</span>
        {price && <span className="dv-tt-price">${price.toFixed(2)}/yr</span>}
      </div>

      <p className="dv-tt-desc">{desc}</p>

      {isAvailable && onDetail && (
        <button
          className="dv-tt-action available"
          onClick={() => onDetail(domain)}
        >
          View Details
        </button>
      )}
      {isTaken && href && (
        <a
          className="dv-tt-action taken"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          WHOIS lookup →
        </a>
      )}
    </div>
  )
}
