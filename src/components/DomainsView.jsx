/**
 * src/components/DomainsView.jsx
 * TLD availability grid organized by category.
 * Color-coded tiles: green=available, red=taken, yellow=premium,
 * blue=aftermarket, gray=checking/unknown.
 */

const TLD_CATEGORIES = [
  {
    label: 'Popular',
    tlds: ['com','net','org','io','ai','co','app','dev','xyz','me','us','tv','info','biz','cc','gg','one','top','pro','vip','club','lol','fun','cool','mobi','today'],
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
    tlds: ['tours','travel','flights','taxi','car','cars','auto','ski','surf','golf'],
  },
  {
    label: 'Sports & Fitness',
    tlds: ['fit','golf','ski','hockey','basketball','football','soccer','tennis','bike','surf','boats','horse','fishing'],
  },
  {
    label: 'Events & Entertainment',
    tlds: ['events','tickets','party','wedding','games','game','esports','bet','casino','poker','music','band','video','film','movie'],
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
    label: 'Country & Regional',
    tlds: ['us','co','me','tv','fm','pm','vc','gg','cc'],
  },
  {
    label: 'Fun & Misc',
    tlds: ['ninja','rocks','buzz','wtf','lol','fun','cool','zone','guru','black','blue','green','red','pink','gold','silver','diamond','luxury'],
  },
]

const STATUS_COLOR = {
  available:   '#16a34a',
  premium:     '#ca8a04',
  aftermarket: '#1d4ed8',
  taken:       '#dc2626',
  checking:    '#374151',
  unknown:     '#374151',
}

const STATUS_TEXT_COLOR = {
  available:   '#fff',
  premium:     '#fff',
  aftermarket: '#fff',
  taken:       '#fff',
  checking:    '#9ca3af',
  unknown:     '#9ca3af',
}

export function DomainsView({ keyword, results }) {
  if (!keyword) return null

  return (
    <div className="domains-view">
      {TLD_CATEGORIES.map(cat => {
        // Only show TLDs we actually checked
        const tiles = cat.tlds
          .filter((tld, i, arr) => arr.indexOf(tld) === i) // dedupe
          .map(tld => {
            const domain = `${keyword}.${tld}`
            const r = results[domain]
            const status = r?.status ?? null
            return { tld, domain, status }
          })
          .filter(t => t.status !== null)

        if (tiles.length === 0) return null

        const available = tiles.filter(t => t.status === 'available').length

        return (
          <div key={cat.label} className="domains-category">
            <div className="domains-category-header">
              <span className="domains-category-label">{cat.label}</span>
              {available > 0 && (
                <span className="domains-category-count">{available} available</span>
              )}
            </div>
            <div className="domains-tile-grid">
              {tiles.map(({ tld, domain, status }) => (
                <a
                  key={tld}
                  className="domains-tile"
                  style={{
                    background: STATUS_COLOR[status] ?? STATUS_COLOR.unknown,
                    color: STATUS_TEXT_COLOR[status] ?? '#9ca3af',
                  }}
                  href={
                    status === 'taken'
                      ? `https://lookup.icann.org/en/lookup?name=${domain}`
                      : status === 'available'
                      ? `https://www.godaddy.com/domainsearch/find?checkAvail=1&tmskey=&domainToCheck=${domain}`
                      : undefined
                  }
                  target={status === 'taken' || status === 'available' ? '_blank' : undefined}
                  rel="noreferrer"
                  title={domain}
                >
                  .{tld}
                </a>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
