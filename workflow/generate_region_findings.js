const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'xartis/data/indicators');
const regions = JSON.parse(fs.readFileSync(path.join(root, 'xartis/data/geo/regions.json'))).nuts2;
const codes = Object.keys(regions);
const read = id => JSON.parse(fs.readFileSync(path.join(dataDir, `${id}.json`)));
const fmt = (v, d = 1) => Number(v).toLocaleString('el-GR', {minimumFractionDigits:d, maximumFractionDigits:d});
const signed = (v, d = 1) => `${v > 0 ? '+' : ''}${fmt(v,d)}%`;
const rank = (values, code, high = true) => Object.entries(values).sort((a,b) => high ? b[1]-a[1] : a[1]-b[1]).findIndex(x => x[0] === code) + 1;
const source = j => j.source?.page || 'https://ec.europa.eu/eurostat/';

const census = read('census');
const configs = [
  {
    id:'population-change', topic:17241316, year:'2011–2021', source:source(census),
    values:Object.fromEntries(codes.map(c => [c, (census.levels.nuts2['2021'][c] / census.levels.nuts2['2011'][c] - 1) * 100])),
    national:(census.national.all['2021'] / census.national.all['2011'] - 1) * 100,
    title:(n,v)=>`${n}: ${signed(v,1)} πληθυσμός μεταξύ 2011 και 2021`,
    lead:(n,v,nat,r)=>`Ο μόνιμος πληθυσμός ${n === 'Αττική' ? 'της' : 'της περιφέρειας'} ${n} μεταβλήθηκε κατά ${signed(v,1)} μεταξύ των απογραφών του 2011 και του 2021, έναντι ${signed(nat,1)} στο σύνολο της χώρας. Ήταν η ${r}η μεγαλύτερη μεταβολή ανάμεσα στις 13 περιφέρειες.`,
    note:'Η σύγκριση αφορά δύο απογραφικές στιγμές και συνδυάζει φυσική μεταβολή και μετακινήσεις πληθυσμού.'
  },
  {
    id:'ageing', topic:17241316, year:'2021', j:read('ageing'), ratio:true,
    title:(n,v)=>`${n}: ${fmt(v)}% των κατοίκων ήταν 65+ το 2021`,
    lead:(n,v,nat,r)=>`Στην περιφέρεια ${n} το ${fmt(v)}% των μόνιμων κατοίκων ήταν 65 ετών και άνω στην απογραφή του 2021, έναντι ${fmt(nat)}% στη χώρα. Η περιφέρεια είχε το ${r}ο υψηλότερο ποσοστό μεταξύ των 13.`,
    note:'Το ποσοστό αφορά τον μόνιμο πληθυσμό της απογραφής και δεν είναι ετήσια εκτίμηση.'
  },
  {
    id:'unemployment', topic:4777720, year:'2025', j:read('unemployment'),
    title:(n,v)=>`${n}: ανεργία ${fmt(v)}% το 2025`,
    lead:(n,v,nat,r)=>`Το ποσοστό ανεργίας στην περιφέρεια ${n} ήταν ${fmt(v)}% το 2025, έναντι ${fmt(nat)}% στο σύνολο της χώρας. Ήταν το ${r}ο υψηλότερο μεταξύ των 13 περιφερειών.`,
    note:'Η ανεργία μετρά τους ανέργους 15–74 ετών ως ποσοστό του εργατικού δυναμικού, όχι ολόκληρου του πληθυσμού.'
  },
  {
    id:'employment_rate', topic:4777720, year:'2025', j:read('employment_rate'),
    title:(n,v)=>`${n}: απασχόληση ${fmt(v)}% στις ηλικίες 20–64`,
    lead:(n,v,nat,r)=>`Στην περιφέρεια ${n} εργαζόταν το ${fmt(v)}% των κατοίκων ηλικίας 20–64 ετών το 2025, έναντι ${fmt(nat)}% στη χώρα. Ήταν το ${r}ο υψηλότερο ποσοστό ανάμεσα στις 13 περιφέρειες.`,
    note:'Το ποσοστό απασχόλησης περιλαμβάνει όσους εργάστηκαν έστω μία ώρα την εβδομάδα αναφοράς ή έλειπαν προσωρινά από την εργασία τους.'
  },
  {
    id:'household_income', topic:2552495, year:'2023', j:read('household_income'),
    title:(n,v)=>`${n}: εισόδημα ${fmt(v)}% του μέσου όρου της ΕΕ`,
    lead:(n,v,nat,r)=>`Το διαθέσιμο εισόδημα των νοικοκυριών ανά κάτοικο στην περιφέρεια ${n} αντιστοιχούσε στο ${fmt(v)}% του μέσου όρου της ΕΕ το 2023. Στη χώρα ήταν ${fmt(nat)}%, ενώ η περιφέρεια είχε την ${r}η υψηλότερη τιμή από τις 13.`,
    note:'Ο δείκτης είναι σε μονάδες αγοραστικής δύναμης και μετρά το εισόδημα των νοικοκυριών, όχι το ΑΕΠ που παράγεται στην περιοχή.'
  },
  {
    id:'poverty_risk', topic:2552495, year:'2025', j:read('poverty_risk'),
    title:(n,v)=>`${n}: ${fmt(v)}% σε κίνδυνο φτώχειας το 2025`,
    lead:(n,v,nat,r)=>`Στην περιφέρεια ${n} το ${fmt(v)}% των κατοίκων βρισκόταν σε κίνδυνο φτώχειας στην έρευνα του 2025, έναντι ${fmt(nat)}% στη χώρα. Ήταν το ${r}ο υψηλότερο ποσοστό μεταξύ των 13 περιφερειών.`,
    note:'Η έρευνα του 2025 μετρά εισοδήματα του 2024. Οι περιφερειακές τιμές είναι δειγματοληπτικές και χρειάζονται προσοχή στις μικρές διαφορές.'
  },
  {
    id:'life_expectancy', topic:296997, year:'2024', j:read('life_expectancy'),
    title:(n,v)=>`${n}: προσδόκιμο ζωής ${fmt(v)} έτη το 2024`,
    lead:(n,v,nat,r)=>`Το προσδόκιμο ζωής στη γέννηση στην περιφέρεια ${n} ήταν ${fmt(v)} έτη το 2024, έναντι ${fmt(nat)} ετών στη χώρα. Ήταν το ${r}ο υψηλότερο από τις 13 περιφέρειες.`,
    note:'Το προσδόκιμο ζωής είναι υποθετικός δείκτης που εφαρμόζει τη θνησιμότητα κάθε ηλικίας του 2024 σε ολόκληρη τη διάρκεια ζωής.'
  },
  {
    id:'physicians', topic:296997, year:'2024', j:read('physicians'), decimals:0,
    title:(n,v)=>`${n}: ${fmt(v,0)} γιατροί ανά 100.000 κατοίκους`,
    lead:(n,v,nat,r)=>`Η περιφέρεια ${n} είχε ${fmt(v,0)} εγγεγραμμένους γιατρούς ανά 100.000 κατοίκους το 2024, έναντι ${fmt(nat,0)} στη χώρα. Ήταν η ${r}η υψηλότερη αναλογία μεταξύ των 13 περιφερειών.`,
    note:'Ο δείκτης μετρά γιατρούς με άδεια ασκήσεως επαγγέλματος, όχι μόνο όσους ασκούν πράγματι την ιατρική ή τη γεωγραφική πρόσβαση των κατοίκων.'
  },
  {
    id:'tertiary_census', topic:33077228, year:'2021', j:read('tertiary_census'), ratio:true,
    title:(n,v)=>`${n}: ${fmt(v)}% των κατοίκων 15+ είχε πτυχίο τριτοβάθμιας`,
    lead:(n,v,nat,r)=>`Στην περιφέρεια ${n} το ${fmt(v)}% των μόνιμων κατοίκων ηλικίας 15 ετών και άνω είχε πτυχίο τριτοβάθμιας εκπαίδευσης στην απογραφή του 2021. Στη χώρα το ποσοστό ήταν ${fmt(nat)}%, ενώ η περιφέρεια βρισκόταν στην ${r}η θέση από τις 13.`,
    note:'Ο δείκτης αφορά τίτλους τριτοβάθμιας εκπαίδευσης των μόνιμων κατοίκων 15+ και όχι το ποσοστό των νέων που φοιτούν σήμερα.'
  }
];

for (const cfg of configs) {
  if (cfg.j) {
    const raw = cfg.j.levels.nuts2[cfg.year];
    if (cfg.ratio) {
      const den = cfg.j.denominator.levels.nuts2[cfg.year];
      cfg.values = Object.fromEntries(codes.map(c => [c, raw[c] / den[c] * 100]));
      cfg.national = cfg.j.national[cfg.year] / cfg.j.denominator.national.all[cfg.year] * 100;
    } else {
      cfg.values = raw;
      cfg.national = cfg.j.national.all[cfg.year];
    }
    cfg.source = source(cfg.j);
  }
}

const start = new Date('2026-11-21T00:00:00Z');
const posts = [];
for (let day = 0; day < configs.length; day++) {
  const cfg = configs[day];
  const date = new Date(start.getTime() + day * 86400000).toISOString().slice(0,10);
  for (let slot = 0; slot < 13; slot++) {
    const code = codes[(slot + day * 5) % 13];
    const name = regions[code].replace(' & ', ' και ');
    const value = cfg.values[code];
    const r = rank(cfg.values, code, true);
    const title = cfg.title(name, value);
    const lead = cfg.lead(name, value, cfg.national, r);
    const content = `<!-- wp:paragraph -->\n<p>${lead}</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:paragraph -->\n<p>${cfg.note}</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:paragraph -->\n<p><em>Πηγή: <a href="${cfg.source}">${cfg.j?.source?.org || 'ΕΛΣΤΑΤ'}</a>. Επεξεργασία: Στατιστικός Άτλας.</em></p>\n<!-- /wp:paragraph -->`;
    posts.push({
      title, slug:`evrima-${date}-${cfg.id}-${code.toLowerCase()}`,
      excerpt:lead, content, date:`${date}T${String(9+slot).padStart(2,'0')}:00:00`,
      categories:[403384642, cfg.topic],
      meta:{_jetpack_dont_email_post_to_subs:true}
    });
  }
}
process.stdout.write(JSON.stringify(posts));
