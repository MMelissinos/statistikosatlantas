const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {execFileSync} = require('child_process');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'xartis/data/indicators');
const codes = ['EL30','EL41','EL42','EL43','EL51','EL52','EL53','EL54','EL61','EL62','EL63','EL64','EL65'];
const retrieved = new Date().toISOString();

const specs = [
  {
    id: 'research_expenditure',
    url: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/rd_e_gerdreg?lang=en&freq=A&sectperf=TOTAL&unit=PC_GDP&sinceTimePeriod=2015',
    page: 'https://ec.europa.eu/eurostat/databrowser/view/rd_e_gerdreg/default/table',
    table: 'rd_e_gerdreg (δαπάνες Έρευνας & Ανάπτυξης όλων των τομέων, % του ΑΕΠ, ανά περιφέρεια NUTS2)',
    title: 'Δαπάνες Έρευνας & Ανάπτυξης', short: 'Δαπάνες Ε&Α',
    genitive: 'των δαπανών Έρευνας & Ανάπτυξης ως ποσοστό του ΑΕΠ',
    unit: 'ποσοστό του ΑΕΠ', of: 'του ΑΕΠ', defaultBase: 2021,
    definition: 'Συνολικές δαπάνες για Έρευνα & Ανάπτυξη από επιχειρήσεις, κράτος, ανώτατη εκπαίδευση και ιδιωτικούς μη κερδοσκοπικούς οργανισμούς, ως ποσοστό του περιφερειακού ΑΕΠ.',
    headline: 'Το {year} οι δαπάνες Έρευνας & Ανάπτυξης ήταν {value} του ΑΕΠ, από {base_value} το {base}',
    notes: [
      'Μόνο ανά περιφέρεια: η Eurostat δεν δημοσιεύει τη συγκεκριμένη σειρά για τις 52 περιφερειακές ενότητες.',
      'Το ποσοστό επηρεάζεται τόσο από τις δαπάνες Έρευνας & Ανάπτυξης όσο και από το ύψος του ΑΕΠ. Πτώση του ΑΕΠ μπορεί να αυξήσει το ποσοστό χωρίς αντίστοιχη αύξηση δαπανών.',
      'Περιλαμβάνονται όλοι οι τομείς εκτέλεσης: επιχειρήσεις, κράτος, ανώτατη εκπαίδευση και ιδιωτικοί μη κερδοσκοπικοί οργανισμοί.',
      'Οι περιφερειακές τιμές δεν αθροίζονται ούτε σταθμίζονται με απλό μέσο όρο. Η τιμή της χώρας δημοσιεύεται χωριστά από τη Eurostat.'
    ],
    areaTitle: 'Δαπάνες Έρευνας & Ανάπτυξης', areaSub: 'του περιφερειακού ΑΕΠ', areaCaveat: 'Περιλαμβάνει επιχειρήσεις, κράτος, ανώτατη εκπαίδευση και μη κερδοσκοπικούς οργανισμούς. Το ποσοστό επηρεάζεται και από το ύψος του ΑΕΠ.'
  },
  {
    id: 'researchers_employment',
    url: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/rd_p_persreg?lang=en&freq=A&prof_pos=RSE&sex=T&sectperf=TOTAL&unit=PC_EMP_FTE&sinceTimePeriod=2015',
    page: 'https://ec.europa.eu/eurostat/databrowser/view/rd_p_persreg/default/table',
    table: 'rd_p_persreg (ερευνητές όλων των τομέων σε ισοδύναμα πλήρους απασχόλησης, % της συνολικής απασχόλησης, ανά περιφέρεια NUTS2)',
    title: 'Ερευνητές στη συνολική απασχόληση', short: 'Ερευνητές',
    genitive: 'του ποσοστού ερευνητών στη συνολική απασχόληση',
    unit: 'ποσοστό της απασχόλησης', of: 'της συνολικής απασχόλησης', defaultBase: 2021,
    definition: 'Ερευνητές σε επιχειρήσεις, κράτος, ανώτατη εκπαίδευση και ιδιωτικούς μη κερδοσκοπικούς οργανισμούς, σε ισοδύναμα πλήρους απασχόλησης, ως ποσοστό της συνολικής απασχόλησης.',
    headline: 'Το {year} οι ερευνητές αντιστοιχούσαν στο {value} της συνολικής απασχόλησης, από {base_value} το {base}',
    notes: [
      'Μόνο ανά περιφέρεια: η Eurostat δεν δημοσιεύει τη συγκεκριμένη σειρά για τις 52 περιφερειακές ενότητες.',
      'Οι ερευνητές μετρώνται σε ισοδύναμα πλήρους απασχόλησης (FTE), ώστε δύο άτομα που αφιερώνουν τον μισό χρόνο τους στην έρευνα να ισοδυναμούν με έναν ερευνητή πλήρους απασχόλησης.',
      'Ο δείκτης δεν μετρά όλους τους εργαζομένους υψηλής ειδίκευσης ούτε όλους όσοι έχουν διδακτορικό. Μετρά μόνο προσωπικό που εκτελεί ερευνητική εργασία.',
      'Οι περιφερειακές τιμές δεν αθροίζονται ούτε σταθμίζονται με απλό μέσο όρο. Η τιμή της χώρας δημοσιεύεται χωριστά από τη Eurostat.'
    ],
    areaTitle: 'Ερευνητές', areaSub: 'της συνολικής απασχόλησης', areaCaveat: 'Μετρώνται σε ισοδύναμα πλήρους απασχόλησης και όχι ως απλός αριθμός προσώπων. Δεν περιλαμβάνονται όλοι οι εργαζόμενοι υψηλής ειδίκευσης.'
  }
];

function indexMap(index) {
  return Object.fromEntries(Object.entries(index).map(([label, position]) => [position, label]));
}

function extract(raw) {
  const geoAt = indexMap(raw.dimension.geo.category.index);
  const timeAt = indexMap(raw.dimension.time.category.index);
  const timeSize = raw.size[raw.id.indexOf('time')];
  const geoSize = raw.size[raw.id.indexOf('geo')];
  const levels = {};
  const flags = {};
  for (let gi = 0; gi < geoSize; gi++) {
    const geo = geoAt[gi];
    if (geo !== 'EL' && !codes.includes(geo)) continue;
    for (let ti = 0; ti < timeSize; ti++) {
      const flat = gi * timeSize + ti;
      const value = raw.value?.[flat];
      if (value == null) continue;
      const year = timeAt[ti];
      levels[year] ??= {};
      levels[year][geo] = value;
      const status = raw.status?.[flat];
      if (status) {
        flags[year] ??= {};
        flags[year][geo] = status;
      }
    }
  }
  return {levels, flags};
}

function rankValues(values) {
  const sorted = Object.entries(values).sort((a,b) => b[1] - a[1]);
  return Object.fromEntries(sorted.map(([code, value], i) => [code, [value, i + 1]]));
}

async function main() {
  const area = JSON.parse(fs.readFileSync(path.join(root, 'perioxi/data.json')));
  const manifestPath = path.join(root, 'xartis/data/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  for (const spec of specs) {
    const bytes = execFileSync('curl', ['-fsSL', spec.url], {maxBuffer: 10 * 1024 * 1024});
    const raw = JSON.parse(bytes.toString('utf8'));
    const {levels, flags} = extract(raw);
    const years = Object.keys(levels).map(Number).sort((a,b) => a-b);
    const national = {}, nuts2 = {};
    for (const year of years) {
      const row = levels[year];
      if (row.EL != null) national[year] = row.EL;
      nuts2[year] = Object.fromEntries(codes.filter(c => row[c] != null).map(c => [c, row[c]]));
    }
    const latest = years.at(-1);
    if (latest !== 2024 || codes.some(c => nuts2[latest][c] == null) || national[latest] == null) throw new Error(`${spec.id}: incomplete 2024 coverage`);
    for (const row of Object.values(nuts2)) for (const value of Object.values(row)) if (!(value >= 0 && value <= 100)) throw new Error(`${spec.id}: invalid value ${value}`);
    const indicator = {
      id:spec.id, title:spec.title, short:spec.short, genitive:spec.genitive, unit:spec.unit,
      kind:'level', metrics:['level','diff'], metricLabels:{level:'Ποσοστό',diff:'Μεταβολή'},
      ratio:{decimals:2,suffix:'%',of:spec.of}, defaultBase:spec.defaultBase,
      definition:spec.definition, headline:{template:spec.headline}, notes:spec.notes,
      flagLabels:{b:'σπάσιμο σειράς',d:'διαφορετικός ορισμός',e:'εκτίμηση',p:'προσωρινό',u:'χαμηλή αξιοπιστία'},
      years, national:{all:national,domestic:national}, levels:{nuts2}, flags,
      source:{org:'Eurostat',table:spec.table,page:spec.page,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),retrieved}
    };
    fs.writeFileSync(path.join(outDir, `${spec.id}.json`), JSON.stringify(indicator));
    const summary = {id:spec.id,title:spec.title,short:spec.short,kind:'level',hidden:false,file:`data/indicators/${spec.id}.json`,years:[years[0],latest],updatedAt:retrieved,source:indicator.source};
    const mi = manifest.indicators.findIndex(x => x.id === spec.id);
    if (mi >= 0) manifest.indicators[mi] = summary; else manifest.indicators.push(summary);
    manifest.scales[spec.id] = Math.max(...Object.values(nuts2).flatMap(row => Object.values(row)));
    const areaEntry = {
      id:spec.id, group:'Έρευνα και καινοτομία', title:spec.areaTitle, def:spec.definition,
      dec:2, suf:'%', sub:spec.areaSub, cav:spec.areaCaveat, src:'Eurostat',
      levels:{nuts2:{year:latest,nat:national[latest],n:codes.length,v:rankValues(nuts2[latest])}}
    };
    const ai = area.indicators.findIndex(x => x.id === spec.id);
    if (ai >= 0) area.indicators[ai] = areaEntry; else area.indicators.push(areaEntry);
  }
  area.updated = retrieved;
  fs.writeFileSync(path.join(root, 'perioxi/data.json'), JSON.stringify(area));
  const story = {id:'research-innovation',title:'Έρευνα και καινοτομία',indicators:specs.map(x => x.id)};
  const si = manifest.stories.findIndex(x => x.id === story.id);
  if (si >= 0) manifest.stories[si] = story; else manifest.stories.push(story);
  manifest.checkedAt = retrieved;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
}

main().catch(error => { console.error(error); process.exit(1); });
