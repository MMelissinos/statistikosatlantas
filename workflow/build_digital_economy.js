const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {execFileSync} = require('child_process');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'xartis/data/indicators');
const codes = ['EL30','EL41','EL42','EL43','EL51','EL52','EL53','EL54','EL61','EL62','EL63','EL64','EL65'];
const retrieved = new Date().toISOString();
const id = 'knowledge_intensive_services';
const url = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/htec_emp_reg2?lang=en&freq=A&nace_r2=KIS&unit=PC_EMP&sex=T&sinceTimePeriod=2015';
const page = 'https://ec.europa.eu/eurostat/databrowser/view/htec_emp_reg2/default/table';

function indexMap(index) {
  return Object.fromEntries(Object.entries(index).map(([label, position]) => [position, label]));
}

function rankValues(values) {
  const sorted = Object.entries(values).sort((a,b) => b[1] - a[1]);
  return Object.fromEntries(sorted.map(([code, value], i) => [code, [value, i + 1]]));
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

function main() {
  const bytes = execFileSync('curl', ['-fsSL', url], {maxBuffer: 10 * 1024 * 1024});
  const raw = JSON.parse(bytes.toString('utf8'));
  const {levels, flags} = extract(raw);
  const years = Object.keys(levels).map(Number).sort((a,b) => a-b);
  const national = {};
  const nuts2 = {};
  for (const year of years) {
    const row = levels[year];
    if (row.EL != null) national[year] = row.EL;
    nuts2[year] = Object.fromEntries(codes.filter(code => row[code] != null).map(code => [code, row[code]]));
  }
  const latest = years.at(-1);
  if (latest !== 2025 || codes.some(code => nuts2[latest][code] == null) || national[latest] == null) {
    throw new Error(`${id}: incomplete 2025 coverage`);
  }
  for (const row of Object.values(nuts2)) {
    for (const value of Object.values(row)) if (!(value >= 0 && value <= 100)) throw new Error(`${id}: invalid value ${value}`);
  }

  const table = 'htec_emp_reg2 (απασχολούμενοι σε υπηρεσίες έντασης γνώσης, % της συνολικής απασχόλησης, ανά περιφέρεια NUTS2)';
  const definition = 'Απασχολούμενοι σε υπηρεσίες έντασης γνώσης ως ποσοστό της συνολικής απασχόλησης. Η κατηγορία περιλαμβάνει ευρύτερες υπηρεσίες που βασίζονται σε υψηλή εξειδίκευση και δεν ταυτίζεται μόνο με τον ψηφιακό κλάδο ή τα videogames.';
  const source = {org:'Eurostat', table, page, sha256:crypto.createHash('sha256').update(bytes).digest('hex'), retrieved};
  const indicator = {
    id,
    title:'Απασχόληση σε υπηρεσίες έντασης γνώσης',
    short:'Υπηρεσίες γνώσης',
    genitive:'του ποσοστού απασχόλησης σε υπηρεσίες έντασης γνώσης',
    unit:'ποσοστό της απασχόλησης',
    kind:'level',
    metrics:['level','diff'],
    metricLabels:{level:'Ποσοστό',diff:'Μεταβολή'},
    ratio:{decimals:1,suffix:'%',of:'της συνολικής απασχόλησης'},
    defaultBase:2021,
    definition,
    headline:{template:'Το {year} οι υπηρεσίες έντασης γνώσης αντιστοιχούσαν στο {value} της συνολικής απασχόλησης, από {base_value} το {base}'},
    notes:[
      'Μόνο ανά περιφέρεια: η Eurostat δεν δημοσιεύει τη συγκεκριμένη σειρά για τις 52 περιφερειακές ενότητες.',
      'Η κατηγορία είναι ευρύτερη από την ψηφιακή οικονομία. Περιλαμβάνει υπηρεσίες που χρησιμοποιούν εντατικά εξειδικευμένη γνώση, όπως εκπαίδευση, υγεία, επαγγελματικές και τεχνολογικές υπηρεσίες.',
      'Υψηλό ποσοστό δεν σημαίνει αυτομάτως μεγάλο κλάδο videogames ή περισσότερες νεοφυείς επιχειρήσεις. Ο δείκτης περιγράφει τη σύνθεση της απασχόλησης.',
      'Οι περιφερειακές τιμές προέρχονται από την Έρευνα Εργατικού Δυναμικού και μπορεί να φέρουν σημαίες αξιοπιστίας ή αλλαγής σειράς.'
    ],
    flagLabels:{b:'σπάσιμο σειράς',d:'διαφορετικός ορισμός',e:'εκτίμηση',p:'προσωρινό',u:'χαμηλή αξιοπιστία'},
    years,
    national:{all:national,domestic:national},
    levels:{nuts2},
    flags,
    source
  };
  fs.writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify(indicator));

  const manifestPath = path.join(root, 'xartis/data/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  const summary = {id,title:indicator.title,short:indicator.short,kind:'level',hidden:false,file:`data/indicators/${id}.json`,years:[years[0],latest],updatedAt:retrieved,source};
  const mi = manifest.indicators.findIndex(item => item.id === id);
  if (mi >= 0) manifest.indicators[mi] = summary; else manifest.indicators.push(summary);
  manifest.scales[id] = Math.max(...Object.values(nuts2).flatMap(row => Object.values(row)));
  const story = {id:'digital-creative-economy',title:'Ψηφιακή και δημιουργική οικονομία',indicators:[id]};
  const si = manifest.stories.findIndex(item => item.id === story.id);
  if (si >= 0) manifest.stories[si] = story; else manifest.stories.push(story);
  manifest.checkedAt = retrieved;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));

  const areaPath = path.join(root, 'perioxi/data.json');
  const area = JSON.parse(fs.readFileSync(areaPath));
  const areaEntry = {
    id,
    group:'Ψηφιακή και δημιουργική οικονομία',
    title:'Υπηρεσίες έντασης γνώσης',
    def:definition,
    dec:1,
    suf:'%',
    sub:'της συνολικής απασχόλησης',
    cav:'Ευρύτερος δείκτης από την ψηφιακή οικονομία: δεν μετρά μόνο πληροφορική ή videogames.',
    src:'Eurostat',
    levels:{nuts2:{year:latest,nat:national[latest],n:codes.length,v:rankValues(nuts2[latest])}}
  };
  const ai = area.indicators.findIndex(item => item.id === id);
  if (ai >= 0) area.indicators[ai] = areaEntry; else area.indicators.push(areaEntry);
  area.updated = retrieved;
  fs.writeFileSync(areaPath, JSON.stringify(area));
}

try { main(); } catch (error) { console.error(error); process.exit(1); }
