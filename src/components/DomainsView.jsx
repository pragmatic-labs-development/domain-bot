/**
 * src/components/DomainsView.jsx
 * TLD availability grid organized by category.
 * Layout mirrors instantdomainsearch.com Extensions tab.
 */

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

const STATUS_BG = {
  available:   '#0d8a57',
  premium:     '#8a6010',
  aftermarket: '#1d4db8',
  taken:       '#8f2830',
  checking:    '#1a1f1f',
  unknown:     '#1a1f1f',
}

export function DomainsView({ keyword, results }) {
  if (!keyword) return null

  const allTiles = Object.entries(results).map(([domain, r]) => r.status)
  const totalAvailable = allTiles.filter(s => s === 'available').length

  return (
    <div className="domains-view">
      {/* Legend */}
      <div className="domains-legend">
        <span className="dv-legend-item available">Available</span>
        <span className="dv-legend-item premium">Premium</span>
        <span className="dv-legend-item aftermarket">Aftermarket</span>
        <span className="dv-legend-item taken">Taken</span>
      </div>

      {TLD_CATEGORIES.map(cat => {
        const tiles = cat.tlds
          .filter((tld, i, arr) => arr.indexOf(tld) === i)
          .map(tld => {
            const domain = `${keyword}.${tld}`
            const r = results[domain]
            const status = r?.status ?? null
            return { tld, domain, status }
          })
          .filter(t => t.status !== null)

        if (tiles.length === 0) return null

        const taken     = tiles.filter(t => t.status === 'taken').length
        const available = tiles.filter(t => t.status === 'available').length
        const subtitle  = available > 0
          ? `${available} available`
          : taken === tiles.length
          ? `${taken} taken`
          : `${taken} taken`

        return (
          <div key={cat.label} className="dv-category">
            <div className="dv-cat-label-col">
              <span className="dv-cat-name">{cat.label}</span>
              <span className="dv-cat-sub">{subtitle}</span>
            </div>
            <div className="dv-tile-grid">
              {tiles.map(({ tld, domain, status }) => {
                const bg = STATUS_BG[status] ?? STATUS_BG.unknown
                const href = status === 'taken'
                  ? `https://lookup.icann.org/en/lookup?name=${domain}`
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
                    title={domain}
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
    </div>
  )
}
